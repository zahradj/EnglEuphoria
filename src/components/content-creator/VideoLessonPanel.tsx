import React, { useState } from 'react';
import { Loader2, Video, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Cefr, Hub } from '@/governance/types';

export interface VideoLessonPanelProps {
  lessonId: string;
  cefr: Cefr;
  hub: Hub;
  defaultPrompt?: string;
  onAttached?: (result: { video_url?: string; cached?: boolean }) => void;
}

/**
 * Creator-side toggle + swap-video UI for the Video Lesson Track.
 *
 * Renders inside Playground / Academy / Success creators. Calls the
 * `generate-lesson-video` edge function which persists the clip to
 * `lesson_videos` and flips `curriculum_lessons.video_lesson_enabled`.
 */
export const VideoLessonPanel: React.FC<VideoLessonPanelProps> = ({
  lessonId,
  cefr,
  hub,
  defaultPrompt = '',
  onAttached,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [swapUrl, setSwapUrl] = useState('');
  const [duration, setDuration] = useState<'5' | '10'>(cefr === 'Pre-A1' || cefr === 'A1' ? '5' : '10');
  const [startingFrameUrl, setStartingFrameUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Add a short video prompt (topic + action).');
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson-video', {
        body: {
          lessonId,
          prompt: prompt.trim(),
          cefr,
          hub,
          durationSeconds: Number(duration),
          startingFrameUrl: startingFrameUrl.trim() || undefined,
          questions: [],
          swapVideoUrl: swapUrl.trim() || undefined,
        },
      });
      if (error) throw error;
      toast.success(data?.cached ? 'Attached from cache' : 'Video attached');
      onAttached?.({ video_url: data?.lesson_video?.video_url, cached: !!data?.cached });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Video generation failed';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-4 w-4" />
          Video Lesson Track
        </CardTitle>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Enable video lesson" />
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="video-prompt">Prompt</Label>
            <Textarea
              id="video-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A child jumping over a puddle in a park, kawaii style"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={(v) => setDuration(v as '5' | '10')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="video-frame">Starting frame URL</Label>
              <Input
                id="video-frame"
                value={startingFrameUrl}
                onChange={(e) => setStartingFrameUrl(e.target.value)}
                placeholder="Optional poster image"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="video-swap">Swap video URL (override AI)</Label>
            <Input
              id="video-swap"
              value={swapUrl}
              onChange={(e) => setSwapUrl(e.target.value)}
              placeholder="Paste a custom clip URL to bypass generation"
            />
          </div>
          <Button onClick={handleGenerate} disabled={busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Attaching…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate &amp; attach
              </>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default VideoLessonPanel;
