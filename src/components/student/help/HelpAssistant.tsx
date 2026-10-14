import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Headset, MessageCircle, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  ACTION_LABELS,
  BILLING_EMAIL,
  FAMILY_BUY_TOPICS,
  FAMILY_HIDDEN_ACTIONS,
  FAMILY_NOTES,
  FAMILY_OPEN_TOPICS,
  HELP_TOPICS,
  SUPPORT_EMAIL,
  UI,
  type HelpActionId,
  type HelpLang,
  type HelpTopic,
} from '@/lib/helpAssistant/knowledge';
import { matchQuestion, toHelpLang } from '@/lib/helpAssistant/matcher';
import { HUB_BRAND } from '@/lib/hubAssignment';

/**
 * Help Assistant — a chat window in the student dashboard that answers "how do I book / reschedule / cancel /
 * get a refund / buy credits / join my lesson…" in the student's language (en, fr, es, ar, tr).
 *
 * It is rule-based on purpose: every answer comes from src/lib/helpAssistant/knowledge.ts, which restates the
 * app's own published rules (Refund Policy, the 5-day rule, free first lesson…). It cannot make up a policy, costs
 * nothing per message, and works offline. A question it cannot answer can be sent to the support team
 * (support_tickets, the same table as the teacher Help Center).
 */

type Msg = {
  id: number;
  role: 'user' | 'bot';
  text: string;
  lang: HelpLang;
  topicId?: string;
  related?: HelpTopic[];
  actions?: HelpActionId[];
  /** the bot could not answer this question */
  unmatched?: boolean;
  /** the question that led to this unmatched reply (sent to the team on request) */
  asked?: string;
  feedback?: 'yes' | 'no';
};

const TAB_ACTIONS: Partial<Record<HelpActionId, string>> = {
  lessons: 'lessons',
  billing: 'billing',
  homework: 'homework',
  games: 'games',
  path: 'learning-path',
  profile: 'profile',
};

const EMAIL_RE = /([\w.+-]+@[\w-]+\.[\w.]+)/g; // used with split() only (no global state)
const IS_EMAIL = /^[\w.+-]+@[\w-]+\.[\w.]+$/;

/** `**bold**`, "• " bullets, numbered lines and e-mail links — no HTML is ever injected. */
function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const bullet = line.startsWith('• ');
        const body = bullet ? line.slice(2) : line;
        return (
          <p key={i} className={bullet ? 'ps-4 -indent-3' : undefined}>
            {bullet && <span aria-hidden>• </span>}
            {body.split(/(\*\*[^*]+\*\*)/g).map((seg, j) => {
              if (seg.startsWith('**') && seg.endsWith('**')) {
                const inner = seg.slice(2, -2);
                return IS_EMAIL.test(inner) ? <Mail key={j} addr={inner} bold /> : <strong key={j}>{inner}</strong>;
              }
              return (
                <React.Fragment key={j}>
                  {seg.split(EMAIL_RE).map((part, k) => (k % 2 === 1 ? <Mail key={k} addr={part} /> : part))}
                </React.Fragment>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

function Mail({ addr, bold }: { addr: string; bold?: boolean }) {
  return (
    <a href={`mailto:${addr}`} className={`underline underline-offset-2 whitespace-nowrap ${bold ? 'font-semibold' : ''}`} dir="ltr">
      {addr}
    </a>
  );
}

/** Brand colours of the chat. Each hub uses its own (HUB_BRAND in lib/hubAssignment): Playground orange → amber on cream,
 *  Academy purple → blue, Success green → teal. The family dashboard (a parent with children in several hubs) blends all
 *  three, using the deeper shade of each so white text stays readable. `ink` is the text/icon colour placed on the
 *  gradient, `chip` the darker tone for small text, `g1` the accent for borders and focus rings. */
const THEMES: Record<string, { grad: string; g1: string; ink: string; chip: string; soft: string; hover: string }> = {
  playground: { grad: `linear-gradient(135deg,${HUB_BRAND.playground.primary},#FEAF15)`, g1: HUB_BRAND.playground.primary, ink: '#2B1200', chip: '#B93A00', soft: HUB_BRAND.playground.accent, hover: 'rgba(43,18,0,.12)' },
  academy: { grad: `linear-gradient(135deg,${HUB_BRAND.academy.primary},#3B82F6)`, g1: HUB_BRAND.academy.primary, ink: '#FFFFFF', chip: HUB_BRAND.academy.primary, soft: HUB_BRAND.academy.accent, hover: 'rgba(255,255,255,.2)' },
  professional: { grad: 'linear-gradient(135deg,#047857,#14B8A6)', g1: '#047857', ink: '#FFFFFF', chip: '#047857', soft: HUB_BRAND.professional.accent, hover: 'rgba(255,255,255,.2)' },
  family: { grad: 'linear-gradient(135deg in oklch,#D9480F,#6B21A8 52%,#047857)', g1: '#6B21A8', ink: '#FFFFFF', chip: '#6B21A8', soft: '#F7F5FC', hover: 'rgba(255,255,255,.2)' },
};

export interface HelpAssistantProps {
  /** The student's hub, used for "Book a lesson" (/find-teacher?hub=…). */
  hub?: string | null;
}

export const HelpAssistant: React.FC<HelpAssistantProps> = ({ hub }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const uiLang = toHelpLang(i18n.resolvedLanguage || i18n.language);
  const dir = uiLang === 'ar' ? 'rtl' : 'ltr';
  const isFamily = hub === 'family';
  const theme = THEMES[hub ?? 'playground'] ?? THEMES.playground;
  const themeVars = {
    '--ha-grad': theme.grad, '--ha-g1': theme.g1, '--ha-ink': theme.ink, '--ha-chip': theme.chip, '--ha-soft': theme.soft, '--ha-hover': theme.hover,
  } as React.CSSProperties;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const idRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const starters = useMemo(() => HELP_TOPICS.filter((t) => t.starter), []);
  const t = useCallback((key: keyof typeof UI, lang: HelpLang = uiLang) => UI[key][lang], [uiLang]);

  const push = useCallback((m: Omit<Msg, 'id'>) => {
    setMsgs((prev) => [...prev, { ...m, id: ++idRef.current }]);
  }, []);

  const answer = useCallback(
    (question: string) => {
      const r = matchQuestion(question, uiLang);
      if (!r.best) {
        push({ role: 'bot', lang: uiLang, text: UI.notSure[uiLang], unmatched: true, asked: question, actions: ['email-support'] });
        return;
      }
      let text = r.best.a[r.lang];
      let actions = r.best.actions;
      if (isFamily) {
        // a parent: the student steps start from the child's space; buying happens in the Lessons tab
        if (FAMILY_OPEN_TOPICS.includes(r.best.id)) text += `\n\n${FAMILY_NOTES.open[r.lang]}`;
        if (FAMILY_BUY_TOPICS.includes(r.best.id)) text += `\n\n${FAMILY_NOTES.buy[r.lang]}`;
        const keep = (actions ?? []).filter((a) => !FAMILY_HIDDEN_ACTIONS.includes(a));
        actions = FAMILY_OPEN_TOPICS.includes(r.best.id) ? ['open-space', ...keep] : keep;
      }
      push({ role: 'bot', lang: r.lang, text, topicId: r.best.id, related: r.related, actions });
    },
    [push, uiLang, isFamily],
  );

  const ask = useCallback(
    (question: string) => {
      const q = question.trim();
      if (!q) return;
      push({ role: 'user', lang: uiLang, text: q });
      answer(q);
      setInput('');
    },
    [answer, push, uiLang],
  );

  // Greeting once, in the current language; refreshed if the language changes before any question was asked.
  useEffect(() => {
    setMsgs((prev) => (prev.length > 1 || prev.some((m) => m.role === 'user') ? prev : [{ id: ++idRef.current, role: 'bot', lang: uiLang, text: UI.greeting[uiLang] }]));
  }, [uiLang]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const last = msgs[msgs.length - 1];
    // a new answer is read from its first line; the student's own message / the greeting scroll to the bottom
    const el = last?.role === 'bot' && msgs.length > 1 ? list.querySelector<HTMLElement>(`[data-msg="${last.id}"]`) : null;
    list.scrollTo({ top: el ? Math.max(0, el.offsetTop - 8) : list.scrollHeight, behavior: 'smooth' });
  }, [msgs, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const runAction = (id: HelpActionId) => {
    const tab = TAB_ACTIONS[id];
    if (tab) {
      window.dispatchEvent(new CustomEvent('student-dashboard:open-tab', { detail: { tab } }));
      setOpen(false);
      return;
    }
    if (id === 'open-space') {
      window.dispatchEvent(new CustomEvent('student-dashboard:open-tab', { detail: { tab: 'profile' } })); // family dashboard: Students tab
      setOpen(false);
    } else if (id === 'book') {
      navigate(hub ? `/find-teacher?hub=${encodeURIComponent(hub)}` : '/find-teacher');
      setOpen(false);
    } else if (id === 'refund') {
      navigate('/refund-policy');
      setOpen(false);
    } else if (id === 'email-support') {
      window.location.href = `mailto:${SUPPORT_EMAIL}`;
    } else if (id === 'email-billing') {
      window.location.href = `mailto:${BILLING_EMAIL}`;
    }
  };

  const categoryFor = (topicId?: string) =>
    topicId && ['refund', 'buy', 'credits'].includes(topicId) ? 'billing' : topicId === 'tech' ? 'technical' : 'general';

  const sendToTeam = async (question: string, topicId?: string) => {
    if (!user || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        user_email: user.email || '',
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        category: categoryFor(topicId),
        message: `[Help assistant] ${question}`,
        priority: 'normal',
      });
      if (error) throw error;
      push({ role: 'bot', lang: uiLang, text: UI.sent[uiLang] });
      toast.success(UI.sent[uiLang]);
    } catch {
      push({ role: 'bot', lang: uiLang, text: UI.sendFailed[uiLang], actions: ['email-support'] });
    } finally {
      setSending(false);
    }
  };

  const rate = (id: number, value: 'yes' | 'no') => {
    const target = msgs.find((m) => m.id === id);
    if (!target || target.feedback) return;
    setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, feedback: value } : m)));
    const lastQuestion = [...msgs].reverse().find((m) => m.role === 'user' && m.id < id)?.text ?? '';
    if (value === 'yes') push({ role: 'bot', lang: target.lang, text: UI.thanksYes[target.lang] });
    else push({ role: 'bot', lang: target.lang, text: UI.notSure[target.lang], unmatched: true, asked: lastQuestion, actions: ['email-support'] });
  };

  const topicById = (id: string) => HELP_TOPICS.find((x) => x.id === id);

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={t('title')}
          dir={dir}
          style={themeVars}
          className="fixed z-[60] bottom-40 left-3 right-3 sm:right-auto sm:left-20 md:bottom-24 sm:w-[390px] max-h-[min(640px,calc(100dvh-11rem))] md:max-h-[min(640px,calc(100dvh-7rem))] flex flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl"
        >
          <header className="flex items-center gap-3 bg-[image:var(--ha-grad)] px-4 py-3 text-[var(--ha-ink)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ha-hover)]" aria-hidden>
              <Headset className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">{t('title')}</p>
              <p className="truncate text-xs opacity-90">{t('subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={t('close')}
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--ha-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-ink)]"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={listRef} className="relative flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm" aria-live="polite">
            {msgs.map((m) => (
              <div key={m.id} data-msg={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  dir={m.lang === 'ar' ? 'rtl' : 'ltr'}
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.role === 'user' ? 'bg-[image:var(--ha-grad)] text-[var(--ha-ink)]' : 'bg-[var(--ha-soft)] text-foreground'
                  }`}
                >
                  <RichText text={m.text} />

                  {m.role === 'bot' && m.actions && m.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {m.actions.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => runAction(a)}
                          className="min-h-[40px] rounded-full border border-[var(--ha-g1)] bg-background px-3 text-xs font-semibold text-[var(--ha-chip)] hover:bg-[var(--ha-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-g1)]"
                        >
                          {ACTION_LABELS[a][m.lang]}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.unmatched && user && m.asked && (
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => sendToTeam(m.asked!, m.topicId)}
                      className="mt-2.5 min-h-[40px] rounded-full bg-[image:var(--ha-grad)] px-3 text-xs font-semibold text-[var(--ha-ink)] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-g1)]"
                    >
                      {t('sendToTeam', m.lang)}
                    </button>
                  )}

                  {m.unmatched && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {starters.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => ask(s.q[m.lang])}
                          className="min-h-[36px] rounded-full border border-border bg-background px-3 text-xs hover:bg-[var(--ha-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-g1)]"
                        >
                          {s.q[m.lang]}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.related && m.related.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs font-medium opacity-70">{t('related', m.lang)}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.related.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => ask(topicById(r.id)!.q[m.lang])}
                            className="min-h-[36px] rounded-full border border-border bg-background px-3 text-xs hover:bg-[var(--ha-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-g1)]"
                          >
                            {r.q[m.lang]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.role === 'bot' && m.topicId && m.topicId !== 'hello' && (
                    <div className="mt-3 flex items-center gap-2 text-xs opacity-80">
                      <span>{t('helpful', m.lang)}</span>
                      {(['yes', 'no'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          disabled={!!m.feedback}
                          onClick={() => rate(m.id, v)}
                          className={`min-h-[32px] rounded-full border px-3 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-g1)] ${
                            m.feedback === v ? 'border-[var(--ha-g1)] bg-[image:var(--ha-grad)] text-[var(--ha-ink)]' : 'border-border bg-background hover:bg-[var(--ha-soft)]'
                          }`}
                        >
                          {t(v, m.lang)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {msgs.length <= 1 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t('suggestions')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {starters.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => ask(s.q[uiLang])}
                      className="min-h-[40px] rounded-full border border-[var(--ha-g1)] bg-background px-3 text-xs font-medium text-[var(--ha-chip)] hover:bg-[var(--ha-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-g1)]"
                    >
                      {s.q[uiLang]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border bg-background p-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              maxLength={300}
              className="min-h-[44px] flex-1 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-g1)]"
            />
            <button
              type="submit"
              aria-label={t('send')}
              disabled={!input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[image:var(--ha-grad)] text-[var(--ha-ink)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ha-g1)] rtl:-scale-x-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="px-3 pb-2 text-center text-[11px] text-muted-foreground">{t('disclaimer')}</p>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('open')}
        aria-expanded={open}
        style={themeVars}
        className="fixed z-[60] bottom-24 left-3 md:left-20 md:bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-[image:var(--ha-grad)] text-[var(--ha-ink)] shadow-xl transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ha-g1)]/40"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
};

export default HelpAssistant;
