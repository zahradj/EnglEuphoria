import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Users, TrendingUp, Wallet } from 'lucide-react';
import logoImage from '@/assets/engleuphoria-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeacherWelcomeHeroProps {
  teacherName: string;
  hubLabel?: string;
  todayLessons?: number;
  totalStudents?: number;
  weeklyHours?: number;
  monthlyEarnings?: number;
  profileImageUrl?: string | null;
}

export const TeacherWelcomeHero: React.FC<TeacherWelcomeHeroProps> = ({
  teacherName,
  hubLabel = 'Educator',
  todayLessons = 0,
  totalStudents = 0,
  weeklyHours = 0,
  monthlyEarnings = 0,
  profileImageUrl = null,
}) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profileImageUrl);

  useEffect(() => {
    if (profileImageUrl) {
      setAvatarUrl(profileImageUrl);
      return;
    }
    if (!user?.id) return;
    supabase
      .from('teacher_profiles')
      .select('profile_image_url')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        console.log('[TeacherWelcomeHero] avatar lookup', { userId: user.id, data, error });
        setAvatarUrl(data?.profile_image_url || null);
      });
  }, [user?.id, profileImageUrl]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = teacherName.split(' ')[0] || teacherName;
  const initials = teacherName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background via-background to-muted/40 mb-6"
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 w-[26rem] h-[26rem] rounded-full bg-accent/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.06),transparent_60%)]" />

      {/* Top-right logo */}
      <div className="absolute top-5 right-6 z-10 hidden sm:flex items-center gap-2 opacity-80">
        <img src={logoImage} alt="EnglEuphoria" className="h-8 w-auto object-contain" />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 items-center px-6 sm:px-10 py-8">
        {/* Teacher avatar */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 18 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-md opacity-40" />
          <Avatar className="relative w-24 h-24 sm:w-28 sm:h-28 border-4 border-card shadow-xl">
            <AvatarImage src={avatarUrl ?? undefined} alt={teacherName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        {/* Greeting */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            {hubLabel}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {greeting}, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{firstName}</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Your classroom is ready. Inspire one student today, and you've already changed the world a little.
          </p>
        </div>

        {/* Stat strip */}
        <div className="flex lg:flex-col gap-3 lg:gap-2">
          <Stat icon={Calendar} label="Today" value={todayLessons} suffix={todayLessons === 1 ? 'lesson' : 'lessons'} />
          <Stat icon={Users} label="Students" value={totalStudents} />
          <Stat icon={TrendingUp} label="This week" value={weeklyHours} suffix={weeklyHours === 1 ? 'hour' : 'hours'} />
          <Stat
            icon={Wallet}
            label="Payments · MTD"
            value={monthlyEarnings}
            prefix="$"
            highlight
          />
        </div>
      </div>
    </motion.section>
  );
};

const Stat: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  highlight?: boolean;
}> = ({ icon: Icon, label, value, suffix, prefix, highlight }) => (
  <div
    className={
      'flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur border min-w-[150px] ' +
      (highlight
        ? 'bg-emerald-500/10 border-emerald-500/40'
        : 'bg-card/70 border-border/60')
    }
  >
    <div
      className={
        'w-9 h-9 rounded-lg flex items-center justify-center ' +
        (highlight ? 'bg-emerald-500/20 text-emerald-600' : 'bg-primary/10 text-primary')
      }
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className="leading-tight">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-lg font-bold text-foreground">
        {prefix}{value}{suffix && <span className="text-xs font-medium text-muted-foreground ml-1">{suffix}</span>}
      </div>
    </div>
  </div>
);
