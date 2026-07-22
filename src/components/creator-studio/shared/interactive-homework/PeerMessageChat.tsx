import { useEffect, useRef, useState } from 'react';
import { Send, Check, CheckCheck, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

/**
 * DM-style chat homework. Student exchanges 3 messages with a virtual classmate.
 * Derives turn prompts from the task prompt; defaults to an "introduce yourself" arc.
 */

interface Turn {
  friend: string;          // friend's incoming line
  hint?: string;           // hint above the input
  suggested?: string[];    // tappable chip suggestions
}

function deriveTurns(prompt: string): { friendName: string; turns: Turn[] } {
  const lower = prompt.toLowerCase();
  // Introduce-yourself arc (default + matches "introduce", "my name is", "name")
  if (lower.includes('introduce') || lower.includes('my name') || lower.includes('name')) {
    return {
      friendName: 'Sam',
      turns: [
        {
          friend: "Hey! 👋 I'm Sam. What's your name?",
          hint: 'Tell Sam your name.',
          suggested: ['My name is …', "I'm …", "Hi! I'm …"],
        },
        {
          friend: 'Nice to meet you! Where are you from?',
          hint: 'Say where you are from.',
          suggested: ["I'm from …", 'I live in …'],
        },
        {
          friend: 'Cool! What do you like to do for fun?',
          hint: 'Share one hobby you like.',
          suggested: ['I like …', 'I love …', 'I enjoy …'],
        },
      ],
    };
  }
  // Generic 3-turn fallback built around the lesson prompt
  return {
    friendName: 'Alex',
    turns: [
      { friend: `Hey! Quick homework chat 👇  ${prompt}`, hint: 'Start the conversation.' },
      { friend: 'Got it — can you say more about that?', hint: 'Add one detail.' },
      { friend: 'Nice! Last one — give me an example?', hint: 'Give a quick example.' },
    ],
  };
}

interface Bubble {
  side: 'friend' | 'me';
  text: string;
  ts: string;
}

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function PeerMessageChat({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const { friendName, turns } = deriveTurns(task.prompt);

  const [bubbles, setBubbles] = useState<Bubble[]>([{ side: 'friend', text: turns[0].friend, ts: now() }]);
  const [turnIdx, setTurnIdx] = useState(0);
  const [input, setInput] = useState('');
  const [friendTyping, setFriendTyping] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles, friendTyping]);

  const send = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || done) return;
    setInput('');
    setBubbles((b) => [...b, { side: 'me', text: value, ts: now() }]);

    const next = turnIdx + 1;
    if (next >= turns.length) {
      // Final friend wrap-up + completion
      setFriendTyping(true);
      setTimeout(() => {
        setFriendTyping(false);
        setBubbles((b) => [...b, { side: 'friend', text: 'Awesome chat — see you in class! 🎉', ts: now() }]);
        setDone(true);
        onComplete?.();
      }, 900);
      return;
    }
    setFriendTyping(true);
    setTimeout(() => {
      setFriendTyping(false);
      setBubbles((b) => [...b, { side: 'friend', text: turns[next].friend, ts: now() }]);
      setTurnIdx(next);
    }, 1100);
  };

  const current = turns[Math.min(turnIdx, turns.length - 1)];
  const initial = friendName.charAt(0).toUpperCase();

  return (
    <div className={cn('mx-auto w-full max-w-md rounded-[28px] border-4 border-slate-900 bg-slate-900 shadow-2xl overflow-hidden', 'relative')}>
      {/* Phone notch */}
      <div className="h-6 bg-slate-900 flex items-center justify-center">
        <div className="w-24 h-4 rounded-full bg-black" />
      </div>

      {/* Chat header */}
      <div className={cn('flex items-center gap-3 px-4 py-3 border-b border-slate-200', 'bg-white')}>
        <div className={cn('w-10 h-10 rounded-full grid place-items-center text-white font-extrabold shadow', theme.bubble)}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 leading-tight truncate">{friendName}</p>
          <p className="text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> online · classmate
          </p>
        </div>
        <span className={cn('text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full', theme.badge)}>
          Homework
        </span>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="bg-[linear-gradient(180deg,#f8fafc,white)] px-3 py-4 h-[340px] overflow-y-auto space-y-2"
      >
        {bubbles.map((b, i) => (
          <div key={i} className={cn('flex animate-fade-in', b.side === 'me' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm leading-snug',
              b.side === 'me'
                ? cn(theme.bubble, 'rounded-br-sm')
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm',
            )}>
              <p className="whitespace-pre-wrap break-words">{b.text}</p>
              <div className={cn('mt-1 flex items-center gap-1 text-[10px]',
                b.side === 'me' ? 'text-white/70 justify-end' : 'text-slate-400')}>
                <span>{b.ts}</span>
                {b.side === 'me' && (done ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
              </div>
            </div>
          </div>
        ))}
        {friendTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.1s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hint + chips */}
      {!done && (
        <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100">
          {current.hint && (
            <p className={cn('text-[11px] font-bold uppercase tracking-wider mb-1.5', theme.accent)}>
              💡 {current.hint}
            </p>
          )}
          {current.suggested && current.suggested.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {current.suggested.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput((v) => (v ? v : s))}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 px-3 py-3 bg-white border-t border-slate-100"
      >
        <Smile className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={input}
          disabled={done}
          onChange={(e) => setInput(e.target.value)}
          placeholder={done ? 'Chat complete 🎉' : `Reply to ${friendName}…`}
          className="flex-1 min-w-0 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300"
        />
        <button
          type="submit"
          disabled={!input.trim() || done}
          className={cn('w-10 h-10 rounded-full grid place-items-center shrink-0 shadow transition active:scale-95',
            theme.button, (!input.trim() || done) && 'opacity-40 cursor-not-allowed')}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Progress */}
      <div className="px-3 pb-3 bg-white">
        <div className="flex items-center gap-1.5">
          {turns.map((_, i) => (
            <span
              key={i}
              className={cn('h-1.5 flex-1 rounded-full transition',
                i < turnIdx || done ? theme.bubble : i === turnIdx ? 'bg-slate-300' : 'bg-slate-100')}
            />
          ))}
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-1.5 font-semibold uppercase tracking-wider">
          {done ? '✓ Exchange complete' : `Message ${Math.min(turnIdx + 1, turns.length)} of ${turns.length}`}
        </p>
      </div>
    </div>
  );
}
