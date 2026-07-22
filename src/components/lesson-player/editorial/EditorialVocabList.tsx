import React from 'react';
import { BookOpen, RotateCw } from 'lucide-react';

interface EditorialVocabListProps {
  slide: any;
}

interface VocabEntry {
  word: string;
  definition?: string;
  example_sentence?: string;
  image_url?: string;
}

const normalizeEntry = (raw: any, fallbackExample?: string): VocabEntry => {
  if (typeof raw === 'string') return { word: raw, example_sentence: fallbackExample };
  return {
    word: raw?.word || raw?.term || raw?.title || '',
    definition: raw?.definition || raw?.meaning || raw?.translation,
    example_sentence:
      raw?.example_sentence || raw?.sentence || raw?.example || fallbackExample,
    image_url:
      raw?.image_url || raw?.imageUrl || raw?.thumbnail_url || raw?.picture_url,
  };
};

export default function EditorialVocabList({ slide }: EditorialVocabListProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const rawList: any[] = Array.isArray(payload.words)
    ? payload.words
    : Array.isArray(payload.vocabulary)
    ? payload.vocabulary
    : Array.isArray(payload.vocab_list)
    ? payload.vocab_list
    : Array.isArray(payload.items)
    ? payload.items
    : [];
  const examples: any[] = Array.isArray(payload.examples) ? payload.examples : [];

  const entries: VocabEntry[] = rawList
    .map((raw, i) => {
      const ex = examples[i];
      const exText = typeof ex === 'string' ? ex : ex?.sentence || ex?.text;
      return normalizeEntry(raw, exText);
    })
    .filter((e) => e.word);

  const colsClass =
    entries.length <= 2
      ? 'sm:grid-cols-2'
      : entries.length === 4
      ? 'sm:grid-cols-2'
      : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <BookOpen className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {slide.title || 'Vocabulary'}
          </h2>
          {slide.description && (
            <p className="mt-1 text-sm text-muted-foreground">{slide.description}</p>
          )}
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
          <RotateCw className="w-3 h-3" /> Hover / tap to flip
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-amber-600 italic text-center py-8">
          Vocabulary data missing for this activity.
        </p>
      ) : (
        <div className={`grid grid-cols-1 ${colsClass} gap-4`}>
          {entries.map((entry, i) => (
            <FlipCard key={`${entry.word}-${i}`} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlipCard({ entry }: { entry: VocabEntry }) {
  const id = React.useId();
  return (
    <div className="group relative h-56 [perspective:1200px]">
      <input id={id} type="checkbox" className="peer sr-only" />
      <label
        htmlFor={id}
        className="absolute inset-0 cursor-pointer rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] peer-checked:[transform:rotateY(180deg)]"
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 bg-card overflow-hidden flex flex-col [backface-visibility:hidden]">
          {entry.image_url ? (
            <img
              src={entry.image_url}
              alt={entry.word}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary/30" />
            </div>
          )}
          <div className="flex-1 flex items-center justify-center p-3 bg-card">
            <h3 className="text-xl md:text-2xl font-bold text-foreground text-center leading-tight">
              {entry.word}
            </h3>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-4 flex flex-col justify-center gap-2 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">
            {entry.word}
          </span>
          {entry.definition && (
            <p className="text-sm font-semibold leading-snug">{entry.definition}</p>
          )}
          {entry.example_sentence && (
            <p className="text-xs italic text-primary-foreground/90 leading-snug border-t border-primary-foreground/20 pt-2 mt-1">
              "{entry.example_sentence}"
            </p>
          )}
        </div>
      </label>
    </div>
  );
}
