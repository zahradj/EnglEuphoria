import { StickyNote } from 'lucide-react';

interface Props {
  value?: string;
  onChange: (next: string) => void;
}

/**
 * Amber "Teacher Script / Notes" textarea.
 * Visible only in the editor — never rendered to students in the preview/classroom.
 */
export function TeacherNotesField({ value, onChange }: Props) {
  return (
    <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1.5">
        <StickyNote className="w-3.5 h-3.5" />
        Teacher Script / Notes
        <span className="ml-1 normal-case font-semibold text-amber-700/80">
          (Hidden from Student)
        </span>
      </label>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="e.g. Ask the student to read the sentence aloud before playing the audio."
        className="w-full resize-none rounded-lg border border-amber-200 bg-white px-2.5 py-2 text-sm text-slate-800 placeholder:text-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
      />
    </div>
  );
}
