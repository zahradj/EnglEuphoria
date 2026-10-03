// Lesson video briefs — admin-only. Shows each brief's preflight (the same lint the server runs), the cost estimate and
// the review checklist, and orders ONE clip at a time through generate-playground-video (Higgsfield / Seedance 2.5).
// Nothing is ordered unless the brief is `ready` (its still approved by the owner) and no clip exists for it yet.
// See .claude/skills/video-quality-gate. Lesson videos only — never games.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VIDEO_BRIEFS, type VideoBrief } from '@/content/playground-library/videoBriefs';
import { REVIEW_CHECKLIST, estimateClipCostUsd, finalVideoPrompt, lintVideoPrompt } from '@/lib/videoPolicy';

interface ClipRow {
  id: string;
  status: string;
  error?: string | null;
  signed_url?: string | null;
  video_url?: string | null;
  source_image_url?: string | null;
  created_at?: string;
}

const MODEL = 'veo-3.0-fast-generate-001'; // price reference only; Higgsfield's own price is shown in its console

function BriefCard({ brief, clips, onOrdered }: { brief: VideoBrief; clips: ClipRow[]; onOrdered: () => void }) {
  const lint = useMemo(() => lintVideoPrompt(brief.motion, { hasStartImage: true, seconds: brief.seconds }), [brief]);
  const existing = clips.find((c) => (c.source_image_url ?? '').endsWith(brief.startImage) && c.status !== 'failed');
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const canOrder = lint.ok && brief.stillApproved && brief.status === 'ready' && !existing && !busy;
  const reason = !lint.ok ? 'the prompt fails the gate'
    : !brief.stillApproved ? 'waiting for you to approve the start image'
      : brief.status !== 'ready' ? 'not ready yet (an earlier clip must be approved first)'
        : existing ? 'a clip already exists — review it first' : '';

  const order = async () => {
    const cost = estimateClipCostUsd(MODEL, brief.seconds);
    if (!window.confirm(`Order ONE ${brief.seconds}-second clip with Higgsfield (Seedance 2.5)?\n\nThis spends credits (about $${cost.toFixed(2)} at Veo prices; check Higgsfield's price).\n\nLesson: ${brief.lesson}`)) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-playground-video', {
        body: { prompt: brief.motion, image_url: brief.startImage, provider: 'higgsfield' },
      });
      if (error) {
        let detail = error.message;
        try {
          const resp = (error as unknown as { context?: { response?: Response } })?.context?.response;
          if (resp) detail = (await resp.clone().text()) || detail;
        } catch { /* keep the generic message */ }
        throw new Error(detail);
      }
      toast.success('Clip ordered. It takes a few minutes: this page updates by itself.');
      void data;
      onOrdered();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {brief.lesson}
          <Badge variant={brief.status === 'ready' ? 'default' : 'secondary'}>{brief.status}</Badge>
          {brief.stillApproved ? <Badge className="bg-emerald-600">still approved</Badge> : <Badge variant="outline">still not approved</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <img src={brief.startImage} alt="Start image" className="w-full rounded-lg border" />
          <div className="space-y-2">
            <p><strong>Purpose:</strong> {brief.purpose}</p>
            <p><strong>Motion:</strong> {brief.motion}</p>
            <p className="text-xs text-muted-foreground"><strong>Sent to the model:</strong> {finalVideoPrompt(brief.motion)}</p>
            <p><strong>Gate:</strong> {lint.ok ? 'passes' : 'BLOCKED'} · {brief.seconds}s · silent · image-to-video</p>
            {lint.issues.map((i) => (
              <p key={i.code} className={i.level === 'block' ? 'text-red-600' : 'text-amber-600'}>
                {i.level === 'block' ? 'BLOCK' : 'warn'} [{i.code}] {i.message}{i.match ? ` (“${i.match}”)` : ''}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={order} disabled={!canOrder}>{busy ? 'Ordering…' : 'Order ONE clip (Higgsfield)'}</Button>
          {reason && <span className="text-muted-foreground">{reason}</span>}
        </div>

        {existing && (
          <div className="space-y-3 rounded-lg border p-3">
            <p><strong>Clip:</strong> {existing.status}{existing.error ? ` — ${existing.error}` : ''}</p>
            {existing.status === 'ready' && (existing.signed_url || existing.video_url) && (
              <>
                <video src={(existing.signed_url ?? existing.video_url) as string} controls loop muted playsInline className="w-full max-w-2xl rounded-lg border" />
                <p className="font-semibold">Review frame by frame (use the pause button and arrow keys). Every box must be ticked before it is used:</p>
                {REVIEW_CHECKLIST.map((c) => (
                  <label key={c.id} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" checked={checked.includes(c.id)} onChange={(e) => setChecked((cur) => e.target.checked ? [...cur, c.id] : cur.filter((x) => x !== c.id))} />
                    <span>{c.check}</span>
                  </label>
                ))}
                <p className={checked.length === REVIEW_CHECKLIST.length ? 'font-semibold text-emerald-700' : 'text-amber-700'}>
                  {checked.length === REVIEW_CHECKLIST.length ? 'All checks passed. Tell Claude “clip approved” to unlock the next brief.' : `${checked.length} / ${REVIEW_CHECKLIST.length} checks done. If anything fails, do NOT re-order: tell Claude what was wrong so the brief is fixed first.`}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VideoBriefs() {
  const [clips, setClips] = useState<ClipRow[]>([]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from('playground_videos').select('id,status,error,video_url,source_image_url,storage_path,created_at').order('created_at', { ascending: false }).limit(50);
    const rows = (data ?? []) as (ClipRow & { storage_path?: string | null })[];
    // Sign the stored files so the player can play private clips.
    const signed = await Promise.all(rows.map(async (r) => {
      if (r.status === 'ready' && r.storage_path) {
        const s = await supabase.storage.from('playground-videos').createSignedUrl(r.storage_path, 60 * 60);
        return { ...r, signed_url: s.data?.signedUrl ?? null };
      }
      return r;
    }));
    setClips(signed);
    // Ask the poller to move any clip that is still rendering forward (it downloads and stores finished ones).
    await Promise.all(rows.filter((r) => r.status === 'rendering').map((r) => supabase.functions.invoke('poll-playground-video', { body: { id: r.id } })));
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => { void refresh(); }, 10000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Lesson video briefs</h1>
      <p className="text-sm text-muted-foreground">
        Lesson videos only (never games). Every clip is silent, cartoon-only, image-to-video and goes through the quality gate first.
        One clip at a time: order it, review it against the checklist, and only then ask for the next one.
      </p>
      {VIDEO_BRIEFS.map((b) => <BriefCard key={b.id} brief={b} clips={clips} onOrdered={() => void refresh()} />)}
    </div>
  );
}
