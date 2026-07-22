import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveTheme } from '@/hooks/useActiveTheme';
import { useStudentXP } from '@/hooks/useStudentXP';
import { DashboardShell, useHubTheme } from '@/components/dashboard/DashboardShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Word {
  id: string;
  word: string;
  ipa: string | null;
  definition: string;
  example: string | null;
}

export default function VocabularyRoom() {
  const { data: theme } = useActiveTheme();
  const { hub, accent } = useHubTheme();
  const { awardXP } = useStudentXP();
  const { toast } = useToast();
  const [listened, setListened] = useState<Set<string>>(new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);

  const { data: words, isLoading } = useQuery({
    queryKey: ['vocab-bank', theme?.theme],
    enabled: !!theme?.theme,
    queryFn: async () => {
      const { data } = await supabase
        .from('vocabulary_bank')
        .select('id, word, ipa, definition, example')
        .ilike('theme', `%${theme!.theme}%`)
        .contains('hub_scope', [hub])
        .limit(15);
      return (data ?? []) as Word[];
    },
  });

  const playWord = async (w: Word) => {
    setPlayingId(w.id);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { text: w.word },
      });
      if (error) throw error;
      // function returns audio/mpeg directly when invoked via fetch; via invoke we get a blob/ArrayBuffer
      const blob = data instanceof Blob ? data : new Blob([data as any], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
      if (!listened.has(w.id)) {
        setListened((s) => new Set(s).add(w.id));
        awardXP({ action: 'phonics_listen', ref_id: w.id });
      }
    } catch (e) {
      toast({ title: 'Audio unavailable', description: String(e), variant: 'destructive' });
    } finally {
      setPlayingId(null);
    }
  };

  const canQuiz = useMemo(() => listened.size >= Math.min(5, (words?.length ?? 0)), [listened, words]);

  const passQuiz = () => {
    if (quizPassed) return;
    setQuizPassed(true);
    awardXP({ action: 'vocab_quiz_pass' });
    toast({ title: '+25 XP', description: 'Vocabulary quiz passed!' });
  };

  return (
    <DashboardShell>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/dashboard/${hub === 'professional' ? 'hub' : hub}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Link>
        </Button>
        <h1 className={`text-xl font-bold ${accent} capitalize`}>
          Vocabulary: {theme?.theme ?? '...'}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : !words || words.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No vocabulary tagged for "{theme?.theme}" yet. Your teacher can add words from this theme.
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {words.map((w) => {
              const isListened = listened.has(w.id);
              return (
                <Card key={w.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-lg font-bold capitalize">{w.word}</div>
                      {w.ipa && <div className="text-xs text-muted-foreground font-mono">{w.ipa}</div>}
                    </div>
                    <Button
                      size="icon"
                      variant={isListened ? 'secondary' : 'default'}
                      onClick={() => playWord(w)}
                      disabled={playingId === w.id}
                    >
                      {playingId === w.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isListened ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-foreground/80">{w.definition}</p>
                  {w.example && (
                    <p className="text-xs italic text-muted-foreground border-l-2 pl-2">{w.example}</p>
                  )}
                </Card>
              );
            })}
          </div>

          <Card className="mt-6 p-5 text-center space-y-3">
            <div className="text-sm">
              Listened: <span className="font-bold">{listened.size}/{words.length}</span>
            </div>
            <Button onClick={passQuiz} disabled={!canQuiz || quizPassed}>
              {quizPassed ? 'Quiz complete (+25 XP)' : canQuiz ? 'Take quick quiz (+25 XP)' : 'Listen to 5 words to unlock quiz'}
            </Button>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
