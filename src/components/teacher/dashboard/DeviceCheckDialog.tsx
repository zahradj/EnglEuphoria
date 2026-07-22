import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2, Monitor, Mic, Camera, Globe } from 'lucide-react';

type CheckState = 'pending' | 'pass' | 'fail';
interface CheckRow { label: string; detail: string; state: CheckState; icon: React.ElementType }

export const DeviceCheckDialog: React.FC<{ open: boolean; onOpenChange: (o: boolean) => void }> = ({ open, onOpenChange }) => {
  const [checks, setChecks] = useState<CheckRow[]>([]);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      const rows: CheckRow[] = [
        { label: 'Browser', detail: navigator.userAgent.split(' ').slice(-1)[0], state: 'pass', icon: Globe },
        { label: 'Screen resolution', detail: `${window.screen.width} × ${window.screen.height}`, state: window.screen.width >= 1024 ? 'pass' : 'fail', icon: Monitor },
        { label: 'Microphone', detail: 'Checking…', state: 'pending', icon: Mic },
        { label: 'Camera', detail: 'Checking…', state: 'pending', icon: Camera },
      ];
      setChecks([...rows]);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        rows[2] = { ...rows[2], detail: stream.getAudioTracks()[0]?.label || 'Default mic', state: 'pass' };
        rows[3] = { ...rows[3], detail: stream.getVideoTracks()[0]?.label || 'Default camera', state: 'pass' };
        stream.getTracks().forEach(t => t.stop());
      } catch (e: any) {
        rows[2] = { ...rows[2], detail: e?.message || 'Permission denied', state: 'fail' };
        rows[3] = { ...rows[3], detail: e?.message || 'Permission denied', state: 'fail' };
      }
      setChecks([...rows]);
    };
    run();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Device Check</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <c.icon className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.label}</p>
                <p className="text-xs text-muted-foreground truncate">{c.detail}</p>
              </div>
              {c.state === 'pending' && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
              {c.state === 'pass' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {c.state === 'fail' && <XCircle className="w-5 h-5 text-destructive" />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
