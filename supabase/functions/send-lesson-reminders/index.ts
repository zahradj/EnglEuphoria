import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { internalAuthHeaders, requireInternalSecret } from "../_shared/internalAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authError = requireInternalSecret(req, corsHeaders);
  if (authError) return authError;

  try {
    console.log('🔔 Starting lesson reminder check...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get pending reminders that need to be sent
    const { data: reminders, error: remindersError } = await supabase
      .rpc('get_pending_reminders');

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      throw remindersError;
    }

    if (!reminders || reminders.length === 0) {
      console.log('No pending reminders to send');
      return new Response(
        JSON.stringify({ message: 'No pending reminders', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${reminders.length} reminders to send`);

    let successCount = 0;
    let failCount = 0;

    for (const reminder of reminders) {
      try {
        const { error } = await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'lesson-reminder',
            recipientEmail: reminder.recipient_email,
            idempotencyKey: `reminder-${reminder.reminder_id}`,
            templateData: {
              recipientName: reminder.recipient_name,
              lessonTitle: reminder.lesson_title,
              lessonDate: new Date(reminder.lesson_date).toLocaleString(),
              teacherName: reminder.teacher_name,
              studentName: reminder.student_name,
              reminderType: reminder.reminder_type,
              roomLink: reminder.room_link,
            },
          },
          headers: internalAuthHeaders(),
        });

        if (error) {
          console.error(`Failed to send reminder to ${reminder.recipient_email}:`, error);
          await supabase
            .from('lesson_reminders')
            .update({ email_status: 'failed', error_message: String(error), sent_at: new Date().toISOString() })
            .eq('id', reminder.reminder_id);
          failCount++;
        } else {
          console.log(`✅ Sent ${reminder.reminder_type} reminder to ${reminder.recipient_email}`);
          await supabase
            .from('lesson_reminders')
            .update({ email_status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', reminder.reminder_id);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.reminder_id}:`, error);
        failCount++;
      }
    }

    console.log(`✅ Reminder processing complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({ message: 'Reminders processed', total: reminders.length, success: successCount, failed: failCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in send-lesson-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
