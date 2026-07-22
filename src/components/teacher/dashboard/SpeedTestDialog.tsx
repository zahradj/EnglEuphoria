import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Wifi, Gauge, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const SpeedTestDialog: React.FC<{ open: boolean; onOpenChange: (o: boolean) => void }> = ({ open, onOpenChange }) => {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ mbps: number; pingMs: number } | null>(null);

  useEffect(() => {
    if (!open) { setResult(null); setProgress(0); return; }
    let cancelled = false;
    const run = async () => {
      setRunning(true); setResult(null); setProgress(10);
      try {
        // Latency: small image
        const t0 = performance.now();
        await fetch(`https://www.google.com/favicon.ico?cb=${Date.now()}`, { mode: 'no-cors', cache: 'no-store' });
        const pingMs = Math.round(performance.now() - t0);
        if (cancelled) return;
        setProgress(40);

        // Throughput: download ~1MB sample
        const url = `https://speed.cloudflare.com/__down?bytes=1000000&cb=${Date.now()}`;
        const tStart = performance.now();
        const res = await fetch(url, { cache: 'no-store' });
        const blob = await res.blob();
        const seconds = Math.max(0.05, (performance.now() - tStart) / 1000);
        const mbps = +(((blob.size * 8) / 1_000_000) / seconds).toFixed(1);
        if (cancelled) return;
        setProgress(100);
        setResult({ mbps, pingMs });
      } catch {
        if (!cancelled) setResult({ mbps: 0, pingMs: 0 });
      } finally {
        if (!cancelled) setRunning(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [open]);

  const quality = result ? (result.mbps >= 5 ? 'Excellent for HD video' : result.mbps >= 2 ? 'Good for video calls' : 'Audio only recommended') : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Wifi className="w-5 h-5" /> Speed Test</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {running && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Measuring your connection…</p>
              <Progress value={progress} />
            </div>
          )}
          {result && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1"><Gauge className="w-3 h-3" /> Download</div>
                  <p className="text-2xl font-bold text-foreground">{result.mbps} <span className="text-sm font-normal text-muted-foreground">Mbps</span></p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1"><Timer className="w-3 h-3" /> Ping</div>
                  <p className="text-2xl font-bold text-foreground">{result.pingMs} <span className="text-sm font-normal text-muted-foreground">ms</span></p>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">{quality}</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
