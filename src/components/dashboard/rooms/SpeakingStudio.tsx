import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveTheme } from '@/hooks/useActiveTheme';
import { useStudentXP } from '@/hooks/useStudentXP';
import { useCEFRProgress } from '@/hooks/useCEFRProgress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardShell, useHubTheme } from '@/components/dashboard/DashboardShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic, Square, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SpeakingStudio() {
  const { user } = useAuth();
  const { data: theme } = useActiveTheme();
  const { data: cefr } = useCEFRProgress();
  const { hub, accent } = useHubTheme();
  const { awardXP } = useStudentXP();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState<string | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duration, setDuration] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTsRef = useRef(0);

  useEffect(() => {
    if (!theme?.theme) return;
    setLoadingPrompt(true);
    supabase.functions
      .invoke('generate-speaking-prompt', {
        body: { theme: theme.theme, cefr_level: cefr?.level ?? 'A2', hub },
      })
      .then(({ data, error }) => {
        if (error) {
          setPrompt(`Record a 1-minute audio about "${theme.theme}". Share your opinion and one example.`);
        } else {
          setPrompt(data?.prompt ?? null);
        }
      })
      .finally(() => setLoadingPrompt(false));
  }, [theme?.theme, cefr?.level, hub]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setDuration(Math.round((Date.now() - startTsRef.current) / 1000));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      startTsRef.current = Date.now();
      setRecording(true);
    } catch (e) {
      toast({ title: 'Microphone access denied', description: String(e), variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    if (!audioBlob || !user || !theme || !prompt) return;
    setUploading(true);
    try {
      const path = `${user.id}/${theme.theme.replace(/\s+/g, '-')}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from('student-speaking')
        .upload(path, audioBlob, { contentType: 'audio/webm' });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from('speaking_submissions').insert({
        student_id: user.id,
        theme: theme.theme,
        prompt,
        audio_path: path,
        duration_sec: duration,
      });
      if (insErr) throw insErr;

      awardXP({ action: 'speaking_submit' });
      setSubmitted(true);
      toast({ title: 'Submitted!', description: '+50 XP — your teacher will review it.' });
    } catch (e) {
      toast({ title: 'Upload failed', description: String(e), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/dashboard/${hub === 'professional' ? 'hub' : hub}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Link>
        </Button>
        <h1 className={`text-xl font-bold ${accent}`}>Speaking Studio</h1>
      </div>

      <Card className="p-6 space-y-5 max-w-2xl mx-auto">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
            Today's prompt · {theme?.theme}
          </div>
          {loadingPrompt ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating your prompt…
            </div>
          ) : (
            <p className="text-lg leading-relaxed">{prompt}</p>
          )}
        </div>

        {!submitted ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {!recording && !audioBlob && (
                <Button onClick={startRecording} size="lg">
                  <Mic className="h-5 w-5 mr-2" /> Start recording
                </Button>
              )}
              {recording && (
                <Button onClick={stopRecording} variant="destructive" size="lg">
                  <Square className="h-5 w-5 mr-2" /> Stop
                </Button>
              )}
              {recording && (
                <span className="text-sm text-muted-foreground animate-pulse">● Recording…</span>
              )}
            </div>

            {audioBlob && audioUrl && (
              <div className="space-y-3">
                <audio src={audioUrl} controls className="w-full" />
                <div className="text-xs text-muted-foreground">{duration}s recorded</div>
                <div className="flex gap-2">
                  <Button onClick={submit} disabled={uploading}>
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" /> Submit to teacher (+50 XP)</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => { setAudioBlob(null); setAudioUrl(null); }}>
                    Re-record
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <div className="font-semibold">Submitted!</div>
              <div className="text-sm">Your teacher will listen before your next class.</div>
            </div>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
