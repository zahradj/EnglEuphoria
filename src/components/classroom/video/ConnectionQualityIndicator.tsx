import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConnectionQualityMetrics } from '@/services/video/connectionQualityMonitor';

interface ConnectionQualityIndicatorProps {
  quality: ConnectionQualityMetrics | null;
  className?: string;
}

export function ConnectionQualityIndicator({ quality, className }: ConnectionQualityIndicatorProps) {
  const [qualityState, setQualityState] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'unknown'>('unknown');

  useEffect(() => {
    if (quality) {
      setQualityState(quality.quality);
    } else {
      setQualityState('unknown');
    }
  }, [quality]);

  const getIcon = () => {
    switch (qualityState) {
      case 'excellent':
        return <SignalHigh className="h-4 w-4" />;
      case 'good':
        return <Signal className="h-4 w-4" />;
      case 'fair':
        return <SignalMedium className="h-4 w-4" />;
      case 'poor':
        return <SignalLow className="h-4 w-4" />;
      case 'unknown':
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (qualityState) {
      case 'excellent':
      case 'good':
        return 'default';
      case 'fair':
        return 'secondary';
      case 'poor':
        return 'destructive';
      case 'unknown':
      default:
        return 'outline';
    }
  };

  const getTooltipContent = () => {
    if (!quality) {
      return 'Connection quality unknown';
    }

    return (
      <div className="space-y-1 text-xs">
        <div className="font-semibold mb-2">Connection Quality: {qualityState.toUpperCase()}</div>
        <div>Latency: {quality.latency}ms</div>
        <div>Packet Loss: {quality.packetLoss.toFixed(2)}%</div>
        <div>Jitter: {quality.jitter}ms</div>
        <div>Bandwidth: {quality.bandwidth} KB/s</div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className={`flex items-center gap-1 cursor-help ${className}`}>
            {getIcon()}
            <span className="capitalize">{qualityState}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
