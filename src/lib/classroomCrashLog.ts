import type { ErrorInfo } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** One place that records a live-lesson crash to `system_errors`, with enough
 *  context to find the cause without source maps (the production bundle's
 *  component names are minified): which scene, which kind, which side of the
 *  classroom, and whether it was already running in safe mode. */
export interface CrashContext {
  /** e.g. "Scene l1-model-h [sound-model] · student mirror · safe mode" */
  label: string;
}

export async function logClassroomCrash(error: Error, errorInfo: ErrorInfo, ctx: CrashContext): Promise<void> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    await supabase.from('system_errors').insert({
      error_message: error.message?.slice(0, 4000) ?? 'Unknown error',
      stack_trace: [error.stack, errorInfo.componentStack].filter(Boolean).join('\n\n---\n\n'),
      component_name: `ClassroomScenePlayer > ${ctx.label}`.slice(0, 500),
      route: typeof window !== 'undefined' ? window.location.pathname : null,
      user_id: auth.user?.id ?? null,
      status: 'open',
    });
  } catch (logErr) {
    console.warn('[classroomCrashLog] failed to log crash:', logErr);
  }
}
