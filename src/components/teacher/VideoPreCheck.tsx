import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Volume2, VolumeX, Sun, SunDim, Clock, CheckCircle, XCircle, AlertTriangle, Upload, RefreshCw, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckResult {
  status: 'pass' | 'warn' | 'fail' | 'pending';
  message: string;
  detail?: string;
}

interface VideoPreCheckProps {
  onCheckComplete: (passed: boolean, results: Record<string, CheckResult>) => void;
  className?: string;
}

export const VideoPreCheck: React.FC<VideoPreCheckProps> = ({ onCheckComplete, className }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, CheckResult>>({
    audio: { status: 'pending', message: 'Audio quality not checked yet' },
    brightness: { status: 'pending', message: 'Brightness not checked yet' },
    duration: { status: 'pending', message: 'Duration not checked yet' },
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeVideo = useCallback(async (file: File) => {
    setAnalyzing(true);
    setProgress(0);

    const newResults: Record<string, CheckResult> = {
      audio: { status: 'pending', message: 'Analyzing audio…' },
      brightness: { status: 'pending', message: 'Analyzing brightness…' },
      duration: { status: 'pending', message: 'Checking duration…' },
    };
    setResults({ ...newResults });

    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.src = videoUrl;

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => resolve();
    });

    // --- Duration Check ---
    setProgress(20);
    const duration = video.duration;
    if (isNaN(duration) || duration === 0) {
      newResults.duration = { status: 'fail', message: 'Could not read video duration', detail: 'The file may be corrupted.' };
    } else if (duration < 30) {
      newResults.duration = { status: 'fail', message: `Too short (${Math.round(duration)}s)`, detail: 'Your video must be at least 30 seconds long.' };
    } else if (duration > 90) {
      newResults.duration = { status: 'warn', message: `Too long (${Math.round(duration)}s)`, detail: 'We recommend keeping it between 30–90 seconds.' };
    } else {
      newResults.duration = { status: 'pass', message: `${Math.round(duration)}s — Perfect length!` };
    }
    setResults({ ...newResults });

    // --- Brightness Check (sample frames) ---
    setProgress(40);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 160;
      canvas.height = 90;
      const frameTimes = [1, Math.min(duration * 0.25, 10), Math.min(duration * 0.5, 20)];
      let totalLuminosity = 0;
      let framesAnalyzed = 0;

      for (const t of frameTimes) {
        if (t >= duration) continue;
        video.currentTime = t;
        await new Promise<void>((r) => { video.onseeked = () => r(); });
        ctx.drawImage(video, 0, 0, 160, 90);
        const imageData = ctx.getImageData(0, 0, 160, 90);
        const pixels = imageData.data;
        let frameLum = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          frameLum += (0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
        }
        totalLuminosity += frameLum / (160 * 90);
        framesAnalyzed++;
      }

      const avgLuminosity = framesAnalyzed > 0 ? totalLuminosity / framesAnalyzed : 0;
      if (avgLuminosity < 50) {
        newResults.brightness = { status: 'fail', message: 'Video is too dark', detail: 'Your video looks too dark. Try facing a window or turning on a light.' };
      } else if (avgLuminosity < 80) {
        newResults.brightness = { status: 'warn', message: 'Lighting could be better', detail: 'Consider adding more light for a more professional look.' };
      } else {
        newResults.brightness = { status: 'pass', message: 'Good lighting!' };
      }
    } catch {
      newResults.brightness = { status: 'warn', message: 'Could not analyze brightness', detail: 'Manual review recommended.' };
    }
    setResults({ ...newResults });

    // --- Audio Check ---
    setProgress(70);
    try {
      const audioCtx = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);

      // Calculate RMS
      let sumSq = 0;
      for (let i = 0; i < channelData.length; i++) {
        sumSq += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sumSq / channelData.length);
      const dbLevel = 20 * Math.log10(rms + 1e-10);

      // Simple noise detection: check variance in quiet sections
      const silentSamples = channelData.filter(s => Math.abs(s) < 0.01).length;
      const silenceRatio = silentSamples / channelData.length;

      if (dbLevel < -35) {
        newResults.audio = { status: 'fail', message: 'Audio volume is too low', detail: 'We detected low audio quality. Please use a headset or move closer to your microphone.' };
      } else if (dbLevel < -25) {
        newResults.audio = { status: 'warn', message: 'Audio is a bit quiet', detail: 'Consider speaking louder or using a headset for better clarity.' };
      } else if (silenceRatio < 0.05 && dbLevel > -10) {
        newResults.audio = { status: 'warn', message: 'Possible background noise detected', detail: 'We hear continuous sound. Please use a quieter room.' };
      } else {
        newResults.audio = { status: 'pass', message: 'Audio quality is good!' };
      }
      audioCtx.close();
    } catch {
      newResults.audio = { status: 'warn', message: 'Could not analyze audio', detail: 'Manual review recommended.' };
    }

    setProgress(100);
    setResults({ ...newResults });
    setAnalyzing(false);

    const allPassed = Object.values(newResults).every(r => r.status === 'pass' || r.status === 'warn');
    const anyFail = Object.values(newResults).some(r => r.status === 'fail');
    onCheckComplete(!anyFail, newResults);

    URL.revokeObjectURL(videoUrl);
  }, [onCheckComplete]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      return;
    }
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    analyzeVideo(file);
  };

  const handleReAnalyze = () => {
    if (videoFile) analyzeVideo(videoFile);
  };

  const statusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warn': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const statusBadge = (status: CheckResult['status']) => {
    const map = {
      pass: { label: 'Pass', variant: 'default' as const, cls: 'bg-green-100 text-green-800' },
      warn: { label: 'Warning', variant: 'secondary' as const, cls: 'bg-amber-100 text-amber-800' },
      fail: { label: 'Fail', variant: 'destructive' as const, cls: 'bg-red-100 text-red-800' },
      pending: { label: 'Pending', variant: 'outline' as const, cls: '' },
    };
    const cfg = map[status];
    return <Badge variant={cfg.variant} className={cfg.cls}>{cfg.label}</Badge>;
  };

  const checks = [
    { key: 'audio', label: 'Audio Quality', icon: results.audio.status === 'pass' ? Volume2 : VolumeX },
    { key: 'brightness', label: 'Lighting / Brightness', icon: results.brightness.status === 'pass' ? Sun : SunDim },
    { key: 'duration', label: 'Video Duration (30–90s)', icon: Clock },
  ];

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🤖 AI Video Pre-Check
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload your intro video for an instant quality analysis before submitting.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        {!videoFile && (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">Click to upload your intro video</p>
            <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV • Max 100MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Video preview */}
        {videoPreviewUrl && (
          <div className="rounded-lg overflow-hidden border bg-black">
            <video src={videoPreviewUrl} controls className="w-full max-h-48 object-contain" />
          </div>
        )}

        {/* Progress */}
        {analyzing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your video…
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {videoFile && (
          <div className="space-y-3">
            {checks.map(({ key, label, icon: Icon }) => {
              const result = results[key];
              return (
                <div key={key} className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  result.status === 'pass' && 'bg-green-50/50 border-green-200',
                  result.status === 'warn' && 'bg-amber-50/50 border-amber-200',
                  result.status === 'fail' && 'bg-red-50/50 border-red-200',
                )}>
                  {statusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{label}</span>
                      {statusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{result.message}</p>
                    {result.detail && result.status !== 'pass' && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{result.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        {videoFile && !analyzing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReAnalyze}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Re-analyze
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setVideoFile(null);
              setVideoPreviewUrl(null);
              setResults({
                audio: { status: 'pending', message: 'Audio quality not checked yet' },
                brightness: { status: 'pending', message: 'Brightness not checked yet' },
                duration: { status: 'pending', message: 'Duration not checked yet' },
              });
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}>
              <Upload className="h-4 w-4 mr-1" />
              Upload different video
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
