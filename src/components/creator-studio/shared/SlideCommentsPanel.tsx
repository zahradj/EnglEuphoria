import React, { useState } from 'react';
import { MessageCircle, Check, Trash2, Send, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSlideComments, type SlideComment } from '@/hooks/useSlideComments';

interface Props {
  lessonId: string | null;
  slideId: string | null;
  hub: 'playground' | 'academy' | 'success';
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

export const SlideCommentsPanel: React.FC<Props> = ({ lessonId, slideId, hub }) => {
  const { commentsForSlide, currentUserId, addComment, toggleResolved, deleteComment, loading } =
    useSlideComments(lessonId);
  const [draft, setDraft] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const accent =
    hub === 'playground'
      ? { ring: 'focus:ring-orange-400', text: 'text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600', chip: 'bg-orange-100 text-orange-700' }
      : { ring: 'focus:ring-indigo-400', text: 'text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-500', chip: 'bg-indigo-100 text-indigo-700' };

  const all = slideId ? commentsForSlide(slideId) : [];
  const visible = showResolved ? all : all.filter((c) => !c.resolved);
  const openCount = all.filter((c) => !c.resolved).length;

  const handleSubmit = async () => {
    if (!slideId || !draft.trim()) return;
    setSubmitting(true);
    const created = await addComment(slideId, draft);
    setSubmitting(false);
    if (created) setDraft('');
  };

  if (!lessonId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
        <MessageCircle className="w-5 h-5 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500">
          Save the lesson once to enable collaborative comments.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[60vh]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageCircle className={cn('w-4 h-4', accent.text)} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Comments
          </h3>
          {openCount > 0 && (
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', accent.chip)}>
              {openCount} open
            </span>
          )}
        </div>
        <button
          onClick={() => setShowResolved((v) => !v)}
          className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
          title={showResolved ? 'Hide resolved' : 'Show resolved'}
        >
          <RotateCcw className="w-3 h-3" />
          {showResolved ? 'Hide resolved' : 'Show resolved'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            {all.length === 0 ? 'No comments yet on this slide.' : 'All comments resolved 🎉'}
          </p>
        ) : (
          visible.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              isMine={c.user_id === currentUserId}
              onToggle={() => toggleResolved(c.id, !c.resolved)}
              onDelete={() => deleteComment(c.id)}
              accentText={accent.text}
            />
          ))
        )}
      </div>

      <div className="border-t border-slate-100 p-2">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={slideId ? 'Add a comment…' : 'Select a slide to comment'}
            disabled={!slideId || submitting}
            rows={2}
            className={cn(
              'flex-1 text-xs rounded-lg border border-slate-200 px-2 py-1.5 resize-none focus:outline-none focus:ring-2',
              accent.ring
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!slideId || !draft.trim() || submitting}
            className={cn(
              'text-white rounded-lg p-2 transition disabled:opacity-40 disabled:cursor-not-allowed',
              accent.btn
            )}
            title="Post (⌘/Ctrl+Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

function CommentItem({
  comment,
  isMine,
  onToggle,
  onDelete,
  accentText,
}: {
  comment: SlideComment;
  isMine: boolean;
  onToggle: () => void;
  onDelete: () => void;
  accentText: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-2 text-xs transition',
        comment.resolved
          ? 'bg-slate-50 border-slate-200 opacity-70'
          : 'bg-white border-slate-200 hover:border-slate-300'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn('font-bold text-[11px]', accentText)}>
          {comment.author_name || 'Anonymous'}
          {isMine && <span className="ml-1 text-slate-400 font-normal">(you)</span>}
        </span>
        <span className="text-[10px] text-slate-400">{formatTime(comment.created_at)}</span>
      </div>
      <p className={cn('text-slate-700 leading-snug whitespace-pre-wrap', comment.resolved && 'line-through text-slate-500')}>
        {comment.body}
      </p>
      <div className="flex items-center gap-1 mt-1.5 -mb-0.5">
        <button
          onClick={onToggle}
          className="text-[10px] font-semibold text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-emerald-50"
          title={comment.resolved ? 'Reopen' : 'Mark resolved'}
        >
          <Check className="w-3 h-3" />
          {comment.resolved ? 'Reopen' : 'Resolve'}
        </button>
        {isMine && (
          <button
            onClick={onDelete}
            className="text-[10px] font-semibold text-slate-500 hover:text-red-600 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
