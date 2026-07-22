import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ZapOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LiveNowToggleProps {
  teacherId: string;
}

export const LiveNowToggle: React.FC<LiveNowToggleProps> = ({ teacherId }) => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [teacherId]);

  const fetchStatus = async () => {
    const { data } = await supabase
      .from('teacher_profiles')
      .select('is_available')
      .eq('user_id', teacherId)
      .maybeSingle();
    setIsLive(data?.is_available ?? false);
    setLoading(false);
  };

  const toggleLive = async (checked: boolean) => {
    setIsLive(checked);
    const { error } = await supabase
      .from('teacher_profiles')
      .update({ is_available: checked })
      .eq('user_id', teacherId);

    if (error) {
      setIsLive(!checked);
      toast.error('Failed to update status');
    } else {
      toast.success(checked ? "You're now visible to students!" : 'You went offline');
    }
  };

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300",
        isLive
          ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          : "bg-card/50 border-border/50"
      )}
    >
      <div className="relative">
        {isLive ? (
          <Zap className="h-5 w-5 text-emerald-400" />
        ) : (
          <ZapOff className="h-5 w-5 text-muted-foreground" />
        )}
        {isLive && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
        )}
      </div>
      <Label htmlFor="live-toggle" className={cn(
        "text-sm font-medium cursor-pointer select-none",
        isLive ? "text-emerald-400" : "text-muted-foreground"
      )}>
        {isLive ? "I'm Online Now" : "Go Live"}
      </Label>
      <Switch
        id="live-toggle"
        checked={isLive}
        onCheckedChange={toggleLive}
        className="ml-auto data-[state=checked]:bg-emerald-500"
      />
    </motion.div>
  );
};
