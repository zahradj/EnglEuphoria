import React, { useState, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Search, Loader2, Volume2 } from 'lucide-react';

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audio?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{ definition: string; example?: string }>;
  }>;
}

interface DictionaryPopoverProps {
  /** Hub-themed button classes from getClassroomHubTheme(). */
  buttonClass?: string;
  /** Side to render the popover from. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

/**
 * Inline dictionary lookup for the classroom chat. Uses the free
 * dictionaryapi.dev service — no API key required. Lets a student
 * (or teacher) look up an unfamiliar word without leaving the chat.
 */
export const DictionaryPopover: React.FC<DictionaryPopoverProps> = ({
  buttonClass,
  side = 'top',
  align = 'end',
}) => {
  const [query, setQuery] = useState('');
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (term: string) => {
    const word = term.trim();
    if (!word) return;
    setLoading(true);
    setError(null);
    setEntry(null);
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      );
      if (!res.ok) {
        setError(`No definition found for "${word}".`);
        return;
      }
      const data = await res.json();
      const first = Array.isArray(data) ? data[0] : null;
      if (!first) {
        setError(`No definition found for "${word}".`);
        return;
      }
      const audio = (first.phonetics || []).find((p: any) => p.audio)?.audio;
      setEntry({
        word: first.word,
        phonetic: first.phonetic ?? (first.phonetics || [])[0]?.text,
        audio,
        meanings: (first.meanings || []).map((m: any) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: (m.definitions || []).slice(0, 2),
        })),
      });
    } catch (e) {
      setError('Could not reach the dictionary. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const playAudio = (url: string) => {
    try {
      const a = new Audio(url);
      a.play().catch(() => undefined);
    } catch {
      /* noop */
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          title="Dictionary — look up a word"
          aria-label="Open dictionary"
          className={`h-8 w-8 shrink-0 rounded-md ${buttonClass ?? 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="w-72 p-3"
        onOpenAutoFocus={(e) => {
          // Keep focus inside the input we render below.
          e.preventDefault();
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3 w-3" /> Dictionary
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(query);
            }}
            className="flex items-center gap-1.5"
          >
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a word…"
              className="h-8 text-xs"
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={loading || !query.trim()}
              aria-label="Search"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            </Button>
          </form>

          {error && (
            <p className="text-[11px] text-destructive bg-destructive/5 rounded px-2 py-1.5">
              {error}
            </p>
          )}

          {entry && (
            <ScrollArea className="max-h-64 -mx-1 px-1">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-foreground">{entry.word}</span>
                  {entry.phonetic && (
                    <span className="text-[11px] text-muted-foreground font-mono">{entry.phonetic}</span>
                  )}
                  {entry.audio && (
                    <button
                      type="button"
                      onClick={() => playAudio(entry.audio!)}
                      title="Play pronunciation"
                      className="ml-auto h-6 w-6 rounded-full inline-flex items-center justify-center hover:bg-muted"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {entry.meanings.map((m, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-primary">
                      {m.partOfSpeech}
                    </div>
                    <ol className="space-y-1 list-decimal list-inside text-xs text-foreground/90">
                      {m.definitions.map((d, j) => (
                        <li key={j}>
                          {d.definition}
                          {d.example && (
                            <div className="ml-4 mt-0.5 text-[11px] italic text-muted-foreground">
                              "{d.example}"
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {!entry && !error && !loading && (
            <p className="text-[11px] text-muted-foreground">
              Stuck on a word? Type it above and press search.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
