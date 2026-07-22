import { toast } from 'sonner';

/**
 * Shared AI error handler for all wizards calling AI edge functions.
 *
 * Handles three failure modes uniformly:
 *  1. Graceful overload payload  → { error: true, message: "..." }   (HTTP 200 but business error)
 *  2. FunctionsHttpError          → Supabase invoke `error` object
 *  3. Thrown JS errors            → catch-all
 *
 * Always shows a glassmorphism amber warning toast (with optional Retry action),
 * always returns `false` so the caller can early-return and stop its spinner.
 *
 * Usage:
 *   const { data, error } = await supabase.functions.invoke('...', { body });
 *   if (handleAIResponse({ data, error, onRetry: handleGenerate })) {
 *     // success → continue with data
 *   } else {
 *     setIsGenerating(false);
 *     return;
 *   }
 */

export interface AIResponseHandlerArgs {
  data: any;
  error: any;
  onRetry?: () => void;
  /** Optional context label, e.g. "Magic Deck", "Slide Injection". */
  context?: string;
}

const GLASS_WARNING_CLASS =
  'backdrop-blur-xl bg-amber-500/10 border border-amber-400/40 text-amber-50 shadow-2xl shadow-amber-500/20';
const GLASS_ERROR_CLASS =
  'backdrop-blur-xl bg-red-500/10 border border-red-400/40 text-red-50 shadow-2xl shadow-red-500/20';

function classifyError(rawMessage: string): {
  title: string;
  description: string;
  nextStep: string;
  isOverload: boolean;
} {
  const msg = (rawMessage || '').toLowerCase();

  if (msg.includes('overload') || msg.includes('429') || msg.includes('rate') || msg.includes('quota')) {
    return {
      title: '⚠️ AI Engine Overloaded',
      description: 'The AI curriculum engine is busy.',
      nextStep: 'Wait ~10 seconds, then click Retry. If it keeps failing, your Gemini paid quota may need a top-up.',
      isOverload: true,
    };
  }
  if (msg.includes('invalid json') || msg.includes('parse') || msg.includes('empty response') || msg.includes('malformed')) {
    return {
      title: '🧩 AI Returned Malformed Output',
      description: 'The AI generated a response we couldn\'t parse.',
      nextStep: 'Click Retry — this is usually a one-off. If it persists, simplify your topic or shorten the prompt.',
      isOverload: false,
    };
  }
  if (msg.includes('timed out') || msg.includes('coffee break') || msg.includes('timeout')) {
    return {
      title: '☕ AI Is Taking a Coffee Break',
      description: 'The AI took too long to respond.',
      nextStep: 'Click Retry — usually works on the second try. If it keeps stalling, shorten the prompt.',
      isOverload: true,
    };
  }
  if (msg.includes('not configured') || msg.includes('api key')) {
    return {
      title: '🔑 AI Key Missing',
      description: 'GEMINI_API_KEY is not configured on the server.',
      nextStep: 'Add the key in Supabase → Settings → Edge Functions → Secrets, then retry.',
      isOverload: false,
    };
  }
  return {
    title: 'AI Generation Failed',
    description: rawMessage || 'Unknown error',
    nextStep: 'Click Retry. If it keeps failing, check your network or contact support.',
    isOverload: false,
  };
}

/**
 * Returns `true` if the response is a clean success (caller should continue),
 * `false` if any error was detected and shown to the user (caller should stop).
 */
export function handleAIResponse({ data, error, onRetry, context }: AIResponseHandlerArgs): boolean {
  // 1. Network / Supabase invoke error
  if (error) {
    const msg = error?.message || 'Edge function call failed';
    showAIErrorToast(msg, onRetry, context);
    return false;
  }

  // 2. Graceful overload / business error from edge function
  if (data?.error === true && data?.message) {
    showAIErrorToast(data.message, onRetry, context);
    return false;
  }

  // 3. Legacy string-error shape from older edge functions
  if (data?.error && typeof data.error === 'string') {
    showAIErrorToast(data.error, onRetry, context);
    return false;
  }

  return true;
}

export function showAIErrorToast(rawMessage: string, onRetry?: () => void, context?: string) {
  const { title, description, nextStep, isOverload } = classifyError(rawMessage);
  const ctxPrefix = context ? `[${context}] ` : '';

  toast(`${ctxPrefix}${title}`, {
    description: `${description} ${nextStep}`,
    duration: 8000,
    className: isOverload ? GLASS_WARNING_CLASS : GLASS_ERROR_CLASS,
    action: onRetry
      ? {
          label: 'Retry',
          onClick: () => onRetry(),
        }
      : undefined,
  });
}
