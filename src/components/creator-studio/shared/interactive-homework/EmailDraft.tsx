import { useState } from 'react';
import { Mail, Paperclip, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

export function EmailDraft({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const [to] = useState('mentor@engleuphoria.com');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const ready = subject.trim().length > 0 && wordCount >= 8;

  const send = () => {
    if (!ready || sent) return;
    setSent(true);
    onComplete?.();
  };

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-2xl border-2 border-emerald-200 bg-white p-8 text-center shadow-lg animate-scale-in">
        <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500" />
        <h3 className="mt-3 text-2xl font-extrabold text-slate-900">Email Sent</h3>
        <p className="text-sm text-slate-500 mt-1">Your mentor will reply shortly.</p>
        <div className="mt-5 text-left bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase">Subject</p>
          <p className="font-semibold text-slate-800 mb-2">{subject}</p>
          <p className="text-xs font-bold text-slate-500 uppercase">Body</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden">
      <div className={cn('px-4 py-3 border-b border-slate-200 flex items-center gap-2', theme.text)}>
        <Mail className="w-4 h-4" />
        <span className="font-extrabold text-sm">New Message</span>
      </div>

      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 text-sm">
        <span className="text-slate-500 font-semibold w-12">To</span>
        <span className="text-slate-800 font-mono">{to}</span>
      </div>

      <div className="px-4 py-3 border-b border-slate-100">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject — keep it clear and professional"
          className="w-full bg-transparent outline-none text-base font-semibold placeholder:text-slate-400"
        />
      </div>

      <div className="px-4 py-3">
        <p className={cn('text-[11px] font-bold uppercase tracking-wider mb-2', theme.accent)}>
          💡 Task: {task.prompt}
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder={'Dear …,\n\nWrite your message here. Aim for at least 8 words.'}
          className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Paperclip className="w-4 h-4" />
          <span>{wordCount} words {wordCount >= 8 ? '✓' : '· min 8'}</span>
        </div>
        <button
          onClick={send}
          disabled={!ready}
          className={cn('inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-extrabold shadow transition active:scale-95',
            theme.button, !ready && 'opacity-40 cursor-not-allowed')}
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </div>
    </div>
  );
}
