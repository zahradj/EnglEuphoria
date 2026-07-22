import React from 'react';
import { Calendar, Clock, Users, Sparkles } from 'lucide-react';

interface SchedulerHeaderProps {
  teacherName: string;
  openSlotsCount: number;
  bookedSlotsCount: number;
  hubSpecialty?: 'Playground' | 'Academy' | 'Professional';
  slotDuration?: 30 | 60;
}

const HUB_META: Record<NonNullable<SchedulerHeaderProps['hubSpecialty']>, { emoji: string; label: string; tint: string }> = {
  Playground: { emoji: '🎪', label: 'Playground Hub', tint: 'from-amber-400/20 via-orange-400/15 to-rose-400/20' },
  Academy: { emoji: '📘', label: 'Academy Hub', tint: 'from-blue-400/20 via-indigo-400/15 to-purple-400/20' },
  Professional: { emoji: '💼', label: 'Success Hub', tint: 'from-emerald-400/20 via-teal-400/15 to-cyan-400/20' },
};

export const SchedulerHeader: React.FC<SchedulerHeaderProps> = ({
  teacherName,
  openSlotsCount,
  bookedSlotsCount,
  hubSpecialty = 'Academy',
  slotDuration = 60,
}) => {
  const meta = HUB_META[hubSpecialty];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
      {/* Aurora background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.tint} opacity-80`} />
      <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur px-3 py-1 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{meta.emoji} {meta.label}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-primary">{slotDuration}-min sessions</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Your teaching schedule
              </h1>
              <p className="mt-1 text-muted-foreground">
                Welcome back, <span className="font-semibold text-foreground">{teacherName}</span>. Tap any cell to open a free slot.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatChip
              icon={<Clock className="h-5 w-5" />}
              value={openSlotsCount}
              label="Open"
              accent="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            />
            <StatChip
              icon={<Users className="h-5 w-5" />}
              value={bookedSlotsCount}
              label="Booked"
              accent="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
            />
            <StatChip
              icon={<Calendar className="h-5 w-5" />}
              value={openSlotsCount + bookedSlotsCount}
              label="Total"
              accent="bg-primary/15 text-primary border-primary/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatChip: React.FC<{
  icon: React.ReactNode;
  value: number;
  label: string;
  accent: string;
}> = ({ icon, value, label, accent }) => (
  <div className={`flex flex-col items-center justify-center rounded-2xl border backdrop-blur px-3 py-3 min-w-[84px] ${accent}`}>
    <div className="mb-1 opacity-90">{icon}</div>
    <div className="text-2xl font-bold leading-none">{value}</div>
    <div className="text-[11px] uppercase tracking-wide opacity-80 mt-1">{label}</div>
  </div>
);
