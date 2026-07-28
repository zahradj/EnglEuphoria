import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';

type ConnectionQuality = 'good' | 'fair' | 'poor';

interface ConnectionHealth {
  quality: ConnectionQuality;
  latencyMs: number;
  suggestion: string | null;
}

export const useConnectionHealth = (): ConnectionHealth => {
  const [quality, setQuality] = useState<ConnectionQuality>('good');
  const [latencyMs, setLatencyMs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const checkConnection = useCallback(async () => {
    // Try navigator.connection API first
    const nav = navigator as any;
    if (nav.connection) {
      const conn = nav.connection;
      const effectiveType = conn.effectiveType;
      const downlink = conn.downlink;

      if (effectiveType === '4g' && downlink > 2) {
        setQuality('good');
        setLatencyMs(conn.rtt || 50);
        return;
      } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 2)) {
        setQuality('fair');
        setLatencyMs(conn.rtt || 200);
        return;
      } else {
        setQuality('poor');
        setLatencyMs(conn.rtt || 500);
        return;
      }
    }

    // Fallback: measure latency with a small fetch
    try {
      const start = performance.now();
      await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': supabaseAnonKey,
        },
      });
      const latency = Math.round(performance.now() - start);
      setLatencyMs(latency);

      if (latency < 200) setQuality('good');
      else if (latency < 500) setQuality('fair');
      else setQuality('poor');
    } catch {
      setQuality('poor');
      setLatencyMs(999);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    intervalRef.current = setInterval(checkConnection, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkConnection]);

  const suggestion = quality === 'poor'
    ? 'We noticed a slow connection. Try turning off your video to improve audio quality.'
    : quality === 'fair'
      ? 'Your connection is unstable. Audio quality may vary.'
      : null;

  return { quality, latencyMs, suggestion };
};
