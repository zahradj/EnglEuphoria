import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, jobId, batchSize = 5 } = await req.json();

    console.log(`Orchestrator called with action: ${action}`);

    switch (action) {
      case 'create_job':
        return await createGenerationJob(supabase);
      
      case 'process_batch':
        return await processBatch(supabase, jobId, batchSize);
      
      case 'get_status':
        return await getJobStatus(supabase, jobId);
      
      case 'pause_job':
        return await pauseJob(supabase, jobId);
      
      case 'resume_job':
        return await resumeJob(supabase, jobId);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Orchestrator error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createGenerationJob(supabase: any) {
  console.log('Creating new generation job...');
  
  // Get all active lessons that need slides
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons_content')
    .select('id, title, topic, cefr_level, learning_objectives, vocabulary_focus, grammar_focus, slides_content')
    .eq('is_active', true)
    .order('module_number', { ascending: true })
    .order('lesson_number', { ascending: true });

  if (lessonsError) {
    throw new Error(`Failed to fetch lessons: ${lessonsError.message}`);
  }

  // Filter lessons that need slide generation (empty or minimal slides)
  const lessonsNeedingSlides = lessons.filter(lesson => {
    const slidesContent = lesson.slides_content;
    if (!slidesContent || !slidesContent.slides) return true;
    return slidesContent.slides.length < 15; // Less than 15 slides means needs regeneration
  });

  console.log(`Found ${lessonsNeedingSlides.length} lessons needing slides out of ${lessons.length} total`);

  if (lessonsNeedingSlides.length === 0) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'All lessons already have sufficient slides',
        totalLessons: lessons.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create the job
  const { data: job, error: jobError } = await supabase
    .from('content_generation_jobs')
    .insert({
      job_name: `Automated Slide Generation - ${new Date().toISOString()}`,
      total_lessons: lessonsNeedingSlides.length,
      status: 'pending',
      job_config: {
        batchSize: 5,
        maxRetries: 3,
        throttleMs: 2000,
        generateMedia: true
      }
    })
    .select()
    .single();

  if (jobError) {
    throw new Error(`Failed to create job: ${jobError.message}`);
  }

  // Create tasks for each lesson
  const tasks = lessonsNeedingSlides.map(lesson => ({
    job_id: job.id,
    lesson_id: lesson.id,
    status: 'pending'
  }));

  const { error: tasksError } = await supabase
    .from('content_generation_tasks')
    .insert(tasks);

  if (tasksError) {
    throw new Error(`Failed to create tasks: ${tasksError.message}`);
  }

  console.log(`Created job ${job.id} with ${tasks.length} tasks`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      jobId: job.id,
      totalLessons: lessonsNeedingSlides.length,
      message: 'Generation job created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processBatch(supabase: any, jobId: string, batchSize: number) {
  console.log(`Processing batch for job ${jobId}, batch size: ${batchSize}`);

  // Get the job
  const { data: job, error: jobError } = await supabase
    .from('content_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new Error(`Job not found: ${jobError?.message}`);
  }

  if (job.status === 'paused') {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Job is paused',
        jobId,
        status: 'paused'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update job status to running
  if (job.status === 'pending') {
    await supabase
      .from('content_generation_jobs')
      .update({ 
        status: 'running', 
        started_at: new Date().toISOString() 
      })
      .eq('id', jobId);
  }

  // Get pending tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('content_generation_tasks')
    .select(`
      id, lesson_id, attempt_count, max_attempts,
      lessons_content (
        id, title, topic, cefr_level, 
        learning_objectives, vocabulary_focus, grammar_focus
      )
    `)
    .eq('job_id', jobId)
    .eq('status', 'pending')
    .lt('attempt_count', 3)
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (tasksError) {
    throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
  }

  if (!tasks || tasks.length === 0) {
    // Check if job is complete
    const { data: remainingTasks } = await supabase
      .from('content_generation_tasks')
      .select('id, status')
      .eq('job_id', jobId)
      .in('status', ['pending', 'running']);

    if (!remainingTasks || remainingTasks.length === 0) {
      await supabase
        .from('content_generation_jobs')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Job completed successfully',
          jobId,
          status: 'completed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'No pending tasks to process',
        jobId,
        status: 'waiting'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Processing ${tasks.length} tasks`);

  const results = [];
  for (const task of tasks) {
    try {
      // Update task status to running
      await supabase
        .from('content_generation_tasks')
        .update({ 
          status: 'running',
          started_at: new Date().toISOString(),
          attempt_count: task.attempt_count + 1
        })
        .eq('id', task.id);

      console.log(`Generating slides for lesson: ${task.lessons_content.title}`);

      // Call ai-slide-generator
      const { data: slideResult, error: slideError } = await supabase.functions.invoke('ai-slide-generator', {
        body: {
          action: 'generate_full_deck',
          content_id: task.lesson_id,
          slide_count: 20,
          custom_prompt: true, // Use the master template
          enrich_media: true // Generate and store real images
        }
      });

      if (slideError || !slideResult?.success) {
        throw new Error(slideResult?.error || slideError?.message || 'Slide generation failed');
      }

      // Update task as completed
      await supabase
        .from('content_generation_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          generated_slides_count: slideResult.total_slides || 20,
          media_enriched: true
        })
        .eq('id', task.id);

      // Update job progress
      await supabase
        .from('content_generation_jobs')
        .update({ 
          completed_lessons: job.completed_lessons + 1 
        })
        .eq('id', jobId);

      results.push({
        taskId: task.id,
        lessonId: task.lesson_id,
        lessonTitle: task.lessons_content.title,
        status: 'completed',
        slidesGenerated: slideResult.total_slides || 20
      });

      console.log(`✓ Completed slides for: ${task.lessons_content.title}`);

      // Throttle to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`Failed to process task ${task.id}:`, error);

      // Check if we should retry
      if (task.attempt_count + 1 >= task.max_attempts) {
        await supabase
          .from('content_generation_tasks')
          .update({ 
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', task.id);

        await supabase
          .from('content_generation_jobs')
          .update({ 
            failed_lessons: job.failed_lessons + 1 
          })
          .eq('id', jobId);
      } else {
        await supabase
          .from('content_generation_tasks')
          .update({ 
            status: 'pending',
            error_message: error.message
          })
          .eq('id', task.id);
      }

      results.push({
        taskId: task.id,
        lessonId: task.lesson_id,
        lessonTitle: task.lessons_content.title,
        status: 'failed',
        error: error.message,
        willRetry: task.attempt_count + 1 < task.max_attempts
      });
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      jobId,
      batchResults: results,
      processedCount: results.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getJobStatus(supabase: any, jobId: string) {
  const { data: job, error: jobError } = await supabase
    .from('content_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError) {
    throw new Error(`Job not found: ${jobError.message}`);
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('content_generation_tasks')
    .select('status, error_message, generated_slides_count')
    .eq('job_id', jobId);

  if (tasksError) {
    throw new Error(`Failed to fetch task status: ${tasksError.message}`);
  }

  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const totalSlides = tasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + (task.generated_slides_count || 0), 0);

  return new Response(
    JSON.stringify({ 
      success: true,
      job: {
        ...job,
        tasksByStatus,
        totalSlidesGenerated: totalSlides,
        progressPercentage: Math.round((job.completed_lessons / job.total_lessons) * 100)
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function pauseJob(supabase: any, jobId: string) {
  const { error } = await supabase
    .from('content_generation_jobs')
    .update({ status: 'paused' })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to pause job: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Job paused successfully',
      jobId 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function resumeJob(supabase: any, jobId: string) {
  const { error } = await supabase
    .from('content_generation_jobs')
    .update({ status: 'running' })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to resume job: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Job resumed successfully',
      jobId 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}