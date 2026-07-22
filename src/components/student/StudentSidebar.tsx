import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge } from "@/components/ui/badge";
import { HubLogo } from '@/components/student/HubLogo';
import {
  Home,
  PlayCircle,
  BookMarked,
  BookOpen,
  Gamepad2,
  Route as RouteIcon,
  Volume2,
  BookText,
  Archive,
  Target,
  Award,
  Sparkles,
  LogOut,
  UserCircle,
  CreditCard,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useThemeMode } from '@/hooks/useThemeMode';

// Hub-specific color maps — bolder, more saturated
const HUB_ICON_COLORS: Record<string, {
  active: string;
  activeBg: string;
  iconDefault: string;
  glowColor: string;
}> = {
  playground: {
    active: 'text-orange-600 dark:text-orange-300',
    activeBg: 'bg-orange-100/80 dark:bg-orange-500/15 border-orange-400/50 dark:border-orange-400/30',
    iconDefault: 'text-orange-500/70 dark:text-orange-400/50',
    glowColor: 'shadow-[0_0_12px_rgba(254,106,47,0.25)] dark:shadow-[0_0_12px_rgba(254,175,21,0.2)]',
  },
  academy: {
    active: 'text-indigo-700 dark:text-indigo-300',
    activeBg: 'bg-indigo-100/80 dark:bg-indigo-500/15 border-indigo-400/50 dark:border-indigo-400/30',
    iconDefault: 'text-indigo-500/70 dark:text-indigo-400/50',
    glowColor: 'shadow-[0_0_12px_rgba(23,78,166,0.25)] dark:shadow-[0_0_12px_rgba(183,94,237,0.2)]',
  },
  professional: {
    active: 'text-emerald-700 dark:text-emerald-300',
    activeBg: 'bg-emerald-100/80 dark:bg-emerald-500/15 border-emerald-400/50 dark:border-emerald-400/30',
    iconDefault: 'text-emerald-500/70 dark:text-emerald-400/50',
    glowColor: 'shadow-[0_0_12px_rgba(13,101,45,0.25)] dark:shadow-[0_0_12px_rgba(61,211,155,0.2)]',
  },
};

interface StudentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasProfile?: boolean;
  onLogout?: () => void;
}

type NavItem = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; href?: string };
type NavGroup = { id: string; label: string; items: NavItem[] };

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { studentLevel } = useStudentLevel();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  const hubKey = studentLevel || 'playground';
  const hubColors = HUB_ICON_COLORS[hubKey] || HUB_ICON_COLORS.playground;
  const hubId = hubKey as 'playground' | 'academy' | 'professional';

  const newBadge = t('sd.badge.new');

  const groups: NavGroup[] = [
    {
      id: 'main',
      label: t('sd.group.main', 'Main Menu'),
      items: [
        { id: 'dashboard', label: t('sd.menu.dashboard'), icon: Home },
        { id: 'lessons', label: t('sd.menu.lessons', 'My Lessons'), icon: PlayCircle },
        { id: 'homework', label: t('sd.menu.homework', 'Homework'), icon: BookMarked },
        { id: 'books', label: t('sd.menu.books', 'My Books'), icon: BookOpen, href: '/library' },
        { id: 'games', label: t('sd.menu.games', 'Games'), icon: Gamepad2 },
      ],
    },
    {
      id: 'learning-lab',
      label: t('sd.group.learningLab', 'Learning Lab'),
      items: [
        { id: 'learning-path', label: t('sd.menu.learningPath', 'My Learning Path'), icon: RouteIcon, badge: newBadge },
        { id: 'sounds', label: t('sd.menu.sounds', 'Map of Sounds'), icon: Volume2, badge: newBadge },
        { id: 'vocabulary', label: t('sd.menu.vocabulary', 'Vocabulary Vault'), icon: Archive, badge: newBadge },
        { id: 'grammar', label: t('sd.menu.grammar', 'Grammar Journal'), icon: BookText, badge: newBadge },
      ],
    },
    {
      id: 'achievements',
      label: t('sd.group.achievements', 'Achievements'),
      items: [
        { id: 'milestones', label: t('sd.menu.milestones', 'Mastery Milestones'), icon: Target, badge: newBadge },
        ...(hubKey === 'professional'
          ? [{ id: 'skill-map', label: t('sd.menu.skillMap', 'Skill Map'), icon: Sparkles, badge: newBadge }]
          : []),
        { id: 'certificates', label: t('sd.menu.certificates', 'Certificates'), icon: Award },
      ],
    },
    {
      id: 'account',
      label: t('sd.group.account', 'Account'),
      items: [
        { id: 'profile', label: t('sd.menu.profile', 'My Profile'), icon: UserCircle },
        { id: 'billing', label: t('sd.menu.billing', 'Buy Lessons'), icon: CreditCard },
        { id: 'settings', label: t('sd.menu.settings', 'Settings'), icon: SettingsIcon },
      ],
    },
  ];

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className={`border-r transition-colors duration-300 ${
      isDark
        ? 'bg-slate-900 md:bg-black/30 md:backdrop-blur-xl border-white/10 md:border-white/8'
        : 'bg-white md:bg-white/50 md:backdrop-blur-xl border-slate-200 md:border-black/5'
    }`}>
      <SidebarContent className={isDark ? 'text-slate-100' : 'text-slate-700'}>
        {/* Brand / Logo header — circle-only when collapsed, full wordmark when expanded */}
        <div className={`${isCollapsed ? 'px-2 py-3 mx-1 mt-2 flex justify-center' : 'px-4 py-4 mx-2 mt-2'} rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/3'}`}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`${isCollapsed ? 'inline-flex' : 'block w-full text-left'} focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg`}
            aria-label="Go to dashboard"
          >
            <HubLogo hubId={hubId} size="sm" compact={isCollapsed} />
          </button>
        </div>

        {groups.map((group, idx) => (
          <SidebarGroup key={group.id}>
            {!isCollapsed && (
              <SidebarGroupLabel className={`px-4 mt-3 mb-1 text-xs uppercase tracking-wider font-semibold ${
                isDark ? 'text-white/40' : 'text-muted-foreground/70'
              }`}>
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => item.href ? navigate(item.href) : setActiveTab(item.id)}
                        className={`
                          relative px-4 py-3 mx-2 my-0.5 rounded-xl transition-all duration-200 font-medium border
                          ${isActive
                            ? `${hubColors.activeBg} ${hubColors.glowColor}`
                            : `border-transparent ${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white/90' : 'text-muted-foreground hover:bg-black/5 hover:text-foreground'}`
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 transition-colors ${isActive ? hubColors.active : hubColors.iconDefault}`} />
                        {!isCollapsed && (
                          <>
                            <span className={`flex-1 font-medium ${isActive ? hubColors.active : ''}`}>{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className={`ml-auto text-[10px] font-medium border-0 ${
                                  isDark ? 'bg-white/10 text-white/70' : 'bg-black/5 text-foreground/70'
                                }`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {idx < groups.length - 1 && (
              <SidebarSeparator className={`my-2 ${isDark ? 'bg-white/8' : 'bg-black/8'}`} />
            )}
          </SidebarGroup>
        ))}

        {/* Logout Section */}
        {onLogout && (
          <>
            <SidebarSeparator className={`my-2 ${isDark ? 'bg-white/8' : 'bg-black/8'}`} />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={onLogout}
                      className={`mx-2 px-4 py-3 rounded-xl font-medium border border-transparent transition-all duration-200 ${
                        isDark
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20'
                          : 'text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                      }`}
                    >
                      <LogOut className="h-5 w-5" />
                      {!isCollapsed && <span>{t('sd.menu.logout')}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
