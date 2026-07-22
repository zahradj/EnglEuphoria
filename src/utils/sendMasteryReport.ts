import { supabase } from '@/integrations/supabase/client';

interface MasteryReportParams {
  studentId: string;
  unitId: string;
  milestoneResultId: string;
}

async function logNotification(params: {
  studentId: string;
  unitId: string;
  recipientEmail: string;
  templateName: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
}) {
  await supabase.from('notification_logs').insert({
    student_id: params.studentId,
    unit_id: params.unitId,
    recipient_email: params.recipientEmail,
    template_name: params.templateName,
    status: params.status,
    error_message: params.errorMessage || null,
  });
}

export async function sendMasteryReport({ studentId, unitId, milestoneResultId }: MasteryReportParams) {
  // 1. Fetch student profile for parent email and name
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('parent_email, display_name')
    .eq('user_id', studentId)
    .single();

  if (!profile?.parent_email) {
    console.warn('No parent email found for student, skipping mastery report email');
    return { sent: false, reason: 'no_parent_email' };
  }

  // 2. Fetch milestone result and gate on score >= 80
  const { data: milestone } = await supabase
    .from('mastery_milestone_results')
    .select('score, passed, skill_scores, weakest_skill')
    .eq('id', milestoneResultId)
    .single();

  if (!milestone || Number(milestone.score) < 80) {
    return { sent: false, reason: 'score_below_threshold' };
  }

  // 3. Fetch unit info
  const { data: unit } = await supabase
    .from('curriculum_units')
    .select('title, cefr_level')
    .eq('id', unitId)
    .single();

  // 4. Fetch Home Mission for this unit
  const { data: mission } = await supabase
    .from('unit_missions')
    .select('mission_text, mission_tip, goal_description')
    .eq('unit_id', unitId)
    .single();

  // 5. Fetch vocabulary for this unit
  const { data: vocabData } = await supabase
    .from('student_vocabulary_progress')
    .select('word')
    .eq('student_id', studentId)
    .eq('unit_id', unitId);

  const vocabularyWords = (vocabData || []).map((v: any) => v.word);

  // 6. Fetch phonics progress
  const { data: phonicsData } = await supabase
    .from('student_phonics_progress')
    .select('phoneme, mastery_level')
    .eq('student_id', studentId);

  const masteredPhonemes = (phonicsData || [])
    .filter((p: any) => p.mastery_level === 'mastered')
    .map((p: any) => p.phoneme);

  const phonicsSummary = masteredPhonemes.length > 0
    ? `Your child mastered the ${masteredPhonemes.join(', ')} sound${masteredPhonemes.length > 1 ? 's' : ''} in this unit!`
    : 'Your child is developing their phonics skills.';

  // 7. Build skill scores
  const rawSkillScores = milestone.skill_scores as Record<string, number> | null;
  const skillScores = rawSkillScores
    ? Object.entries(rawSkillScores).map(([name, score]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        score: Math.round(Number(score)),
        status: Number(score) >= 90 ? 'mastered' : Number(score) >= 80 ? 'excellent' : Number(score) >= 60 ? 'developing' : 'needs_review',
        observation: Number(score) >= 90 ? 'Excellent performance!' : Number(score) >= 80 ? 'Strong understanding.' : Number(score) >= 60 ? 'Good progress, continuing to develop.' : 'We will revisit this area.',
      }))
    : [];

  // 8. Attempt to send (with one retry on failure)
  const templateName = 'unit-mastery-report';
  const idempotencyKey = `mastery-report-${milestoneResultId}`;

  const attemptSend = async (): Promise<{ success: boolean; error?: any }> => {
    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName,
        recipientEmail: profile.parent_email,
        idempotencyKey,
        templateData: {
          studentName: profile.display_name || 'Your child',
          unitName: unit?.title || 'Unit',
          overallScore: Math.round(Number(milestone.score)),
          phonicsSummary,
          vocabularyCount: vocabularyWords.length,
          vocabularyWords,
          grammarPattern: '',
          realWorldWin: '',
          homeActivity: mission
            ? `${mission.mission_text}${mission.mission_tip ? ' ' + mission.mission_tip : ''}`
            : '',
          skillScores,
        },
      },
    });
    return error ? { success: false, error } : { success: true };
  };

  // First attempt
  let result = await attemptSend();

  // Retry once on failure
  if (!result.success) {
    console.warn('First email attempt failed, retrying once...', result.error);
    result = await attemptSend();
  }

  // Log to notification_logs
  if (result.success) {
    await logNotification({
      studentId,
      unitId,
      recipientEmail: profile.parent_email,
      templateName,
      status: 'sent',
    });
    return { sent: true };
  } else {
    const errorMsg = result.error?.message || JSON.stringify(result.error) || 'Unknown error';
    console.error('Failed to send mastery report email after retry:', errorMsg);
    await logNotification({
      studentId,
      unitId,
      recipientEmail: profile.parent_email,
      templateName,
      status: 'failed',
      errorMessage: errorMsg,
    });
    return { sent: false, reason: 'send_error', error: result.error };
  }
}
