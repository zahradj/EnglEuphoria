// A dictionary icon in the classroom (owner 2026-10-17): one tap opens the draggable dictionary so teacher and student can look up a word in English. It does NOT translate the lesson (the lesson is English only).
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { FloatingDictionary } from './oneonone/dictionary/FloatingDictionary';

export function ClassroomDictionaryIcon({ onAddToVocab }: { onAddToVocab?: (word: string, definition: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        data-testid="classroom-dictionary-icon"
        aria-label="Dictionary"
        aria-pressed={open}
        title="Dictionary"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 left-3 z-[110] h-12 w-12 rounded-full bg-white/95 text-violet-700 shadow-lg ring-1 ring-violet-200 backdrop-blur hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 flex items-center justify-center"
      >
        <BookOpen className="h-6 w-6" aria-hidden="true" />
      </button>
      <FloatingDictionary isVisible={open} onClose={() => setOpen(false)} onAddToVocab={onAddToVocab} />
    </>
  );
}
