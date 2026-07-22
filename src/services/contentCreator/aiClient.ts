// Browser-side ActivityAIClient that proxies to the gemini-proxy edge function.
// Honors mem://architecture/runtime-ai-gemini-only — no Lovable Gateway.

import { supabase } from '@/integrations/supabase/client';
import type { ActivityAIClient } from '@/activities/types';

export const browserGeminiAiClient: ActivityAIClient = async ({ systemPrompt, userPrompt }) => {
  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { systemPrompt, userPrompt },
  });
  if (error) throw new Error(`gemini-proxy: ${error.message}`);
  const text = (data as { text?: string } | null)?.text;
  if (typeof text !== 'string') {
    throw new Error('gemini-proxy: malformed response (missing text)');
  }
  return text;
};
