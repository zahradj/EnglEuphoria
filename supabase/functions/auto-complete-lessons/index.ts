import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireInternalSecret } from "../_shared/internalAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lesson {
  id: string;
  scheduled_at: string;
  duration: number;
  status: string;
  student_id: string;
  teacher_id: string;
  title: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authError = requireInternalSecret(req, corsHeaders);
  if (authError) return authError;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log('🔄 Auto-completion check started at:', new Date().toISOString());

    // Find lessons that should be marked as completed
    // Lessons are auto-completed 10 minutes after their scheduled end time
    const { data: lessonsToComplete, error: fetchError } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('status', 'scheduled')
      .lt('scheduled_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // 10 minutes ago
      .order('scheduled_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching lessons:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log(`📋 Found ${lessonsToComplete?.length || 0} lessons to auto-complete`);

    if (!lessonsToComplete || lessonsToComplete.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No lessons to auto-complete',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const results = [];

    for (const lesson of lessonsToComplete as Lesson[]) {
      try {
        console.log(`⏰ Auto-completing lesson: ${lesson.id} - ${lesson.title}`);
        
        // Call the existing process_lesson_completion function
        const { data: completionResult, error: completionError } = await supabaseClient
          .rpc('process_lesson_completion', {
            lesson_uuid: lesson.id,
            lesson_status: 'completed',
            failure_reason: null
          });

        if (completionError) {
          console.error(`❌ Error completing lesson ${lesson.id}:`, completionError);
          results.push({
            lesson_id: lesson.id,
            status: 'error',
            error: completionError.message
          });
          continue;
        }

        console.log(`✅ Lesson ${lesson.id} auto-completed successfully`);
        
        // Create notifications for teacher and student
        await createCompletionNotifications(supabaseClient, lesson, completionResult);
        
        results.push({
          lesson_id: lesson.id,
          status: 'completed',
          payment_result: completionResult
        });

      } catch (error) {
        console.error(`❌ Error processing lesson ${lesson.id}:`, error);
        results.push({
          lesson_id: lesson.id,
          status: 'error',
          error: (error as Error).message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'completed').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`🎯 Auto-completion summary: ${successCount} completed, ${errorCount} errors`);

    return new Response(JSON.stringify({
      message: `Auto-completed ${successCount} lessons`,
      processed: successCount,
      errors: errorCount,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Auto-completion function error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function createCompletionNotifications(
  supabaseClient: any,
  lesson: Lesson,
  paymentResult: any
) {
  try {
    // Get student and teacher names for notifications
    const { data: users } = await supabaseClient
      .from('users')
      .select('id, full_name')
      .in('id', [lesson.student_id, lesson.teacher_id]);

    const student = users?.find((u: any) => u.id === lesson.student_id);
    const teacher = users?.find((u: any) => u.id === lesson.teacher_id);

    const teacherEarnings = paymentResult?.teacher_paid || 0;
    const studentCharged = paymentResult?.student_charged || 0;
    const platformFee = paymentResult?.student_charged ? (paymentResult.student_charged - paymentResult.teacher_paid) : 0;

    // Create teacher notification
    if (teacher && teacherEarnings > 0) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: lesson.teacher_id,
          type: 'payment_received',
          title: 'Payment Received! 💰',
          message: `You've earned €${teacherEarnings} from your completed lesson with ${student?.full_name || 'student'}`,
          data: {
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            student_name: student?.full_name,
            amount_earned: teacherEarnings,
            lesson_date: lesson.scheduled_at
          }
        });
    }

    // Create student notification  
    if (student && studentCharged > 0) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: lesson.student_id,
          type: 'lesson_completed',
          title: 'Lesson Completed ✅',
          message: `€${studentCharged} paid: €${teacherEarnings} to ${teacher?.full_name || 'teacher'}, €${platformFee} platform service`,
          data: {
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            teacher_name: teacher?.full_name,
            total_paid: studentCharged,
            teacher_share: teacherEarnings,
            platform_share: platformFee,
            lesson_date: lesson.scheduled_at
          }
        });
    }

    console.log(`📬 Notifications created for lesson ${lesson.id}`);
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}