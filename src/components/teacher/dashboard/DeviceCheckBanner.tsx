import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Wifi, Video } from 'lucide-react';
import { DeviceCheckDialog } from './DeviceCheckDialog';
import { SpeedTestDialog } from './SpeedTestDialog';
import { AVTestDialog } from './AVTestDialog';

export const DeviceCheckBanner: React.FC = () => {
  const [open, setOpen] = useState<'device' | 'speed' | 'av' | null>(null);

  return (
    <>
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">System Check</p>
              <p className="text-sm text-muted-foreground">Ensure your setup is ready for classes</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen('device')}>
              <Monitor className="w-4 h-4" />
              Check Device
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen('speed')}>
              <Wifi className="w-4 h-4" />
              Speed Test
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen('av')}>
              <Video className="w-4 h-4" />
              A/V Test
            </Button>
          </div>
        </div>
      </div>

      <DeviceCheckDialog open={open === 'device'} onOpenChange={(o) => !o && setOpen(null)} />
      <SpeedTestDialog open={open === 'speed'} onOpenChange={(o) => !o && setOpen(null)} />
      <AVTestDialog open={open === 'av'} onOpenChange={(o) => !o && setOpen(null)} />
    </>
  );
};
