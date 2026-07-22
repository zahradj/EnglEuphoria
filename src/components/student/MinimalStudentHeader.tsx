import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeModeToggle } from "@/components/ui/ThemeModeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HubLogo } from "@/components/student/HubLogo";
import { useStudentLevel } from "@/hooks/useStudentLevel";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/hooks/useStreak";

const StreakBadge: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { streak, loading } = useStreak();
  if (loading || streak < 1) return null;
  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
      isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-600'
    }`}>
      <Flame className="h-3.5 w-3.5" />
      {streak}
    </div>
  );
};

interface MinimalStudentHeaderProps {
  studentName: string;
  studentId: string;
  hasProfile?: boolean;
  studentProfile?: any;
}

export const MinimalStudentHeader: React.FC<MinimalStudentHeaderProps> = ({
  studentName,
  studentId,
  hasProfile = false,
  studentProfile
}) => {
  const { t } = useTranslation();
  const { studentLevel } = useStudentLevel();
  const { resolvedTheme } = useThemeMode();
  const { user } = useAuth();
  const isDark = resolvedTheme === 'dark';
  const hubId = (studentLevel || 'playground') as 'playground' | 'academy' | 'professional';

  const initials = studentName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Hub-tinted mobile header gradient (Bold Flat Hub Colors)
  const mobileHubGradient =
    hubId === 'playground'
      ? isDark
        ? 'bg-gradient-to-r from-orange-950/70 via-amber-950/60 to-orange-950/70 border-orange-500/20'
        : 'bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-orange-200/60'
      : hubId === 'academy'
        ? isDark
          ? 'bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-indigo-950/70 border-indigo-500/20'
          : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-indigo-200/60'
        : isDark
          ? 'bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-emerald-950/70 border-emerald-500/20'
          : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200/60';

  return (
    <div className={`sticky top-0 z-10 border-b backdrop-blur-xl transition-colors duration-300 ${
      isDark
        ? 'bg-black/30 border-white/10'
        : 'bg-white/40 border-black/5'
    } md:bg-none`}>
      {/* Mobile header: hamburger | logo + name | streak + bell */}
      <div className={`md:hidden flex items-center gap-2 px-3 py-2.5 border-b-0 ${mobileHubGradient}`}>
        <SidebarTrigger className={`rounded-lg p-2 shrink-0 ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-slate-700 hover:bg-black/5'}`} />
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <HubLogo hubId={hubId} size="sm" />
          <span className={`text-sm font-bold truncate ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {studentName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StreakBadge isDark={isDark} />
          {user && <NotificationBell />}
        </div>
      </div>

      {/* Desktop / tablet header: full layout */}
      <div className="hidden md:flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger
            className={`rounded-lg p-2 shrink-0 transition-colors ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'}`}
            title="Toggle sidebar"
          />
          <Avatar className={`h-9 w-9 border ${isDark ? 'border-white/15' : 'border-black/10'}`}>
            <AvatarFallback className={`font-medium text-sm ${
              hubId === 'playground'
                ? isDark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-100 text-orange-700'
                : hubId === 'academy'
                  ? isDark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                  : isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="hidden sm:block">
            <h1 className={`text-sm font-semibold ${isDark ? 'text-white/90' : 'text-foreground'}`}>
              {studentName}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
                {t('sd.id')}: {studentId}
              </span>
              {hasProfile && studentProfile && (
                <Badge variant="secondary" className={`text-xs border-0 font-medium ${
                  hubId === 'playground'
                    ? isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                    : hubId === 'academy'
                      ? isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                      : isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  ⭐ {studentProfile.points || 0} XP
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StreakBadge isDark={isDark} />
          {user && <NotificationBell />}
          <ThemeModeToggle className={`${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-black/5'}`} />
        </div>
      </div>
    </div>
  );
};
