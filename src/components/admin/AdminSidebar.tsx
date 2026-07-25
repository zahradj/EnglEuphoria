import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminPendingCounts } from "@/hooks/useAdminPendingCounts";
import {
  LayoutDashboard, Activity, Users, FileText, TrendingUp, CreditCard, Settings,
  LogOut, Calendar, GraduationCap, Radio, Video, Mail, Briefcase, Inbox,
  BarChart3, Gift, Megaphone, LifeBuoy,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { signOut } = useAuth();
  const { profileApprovals, applications, pendingBonuses, atRiskTeachers } = useAdminPendingCounts();

  const topItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "super-control", label: "Super Control Center", icon: Activity },
  ];

  type SidebarItem = { id: string; label: string; icon: typeof Users; badge?: number; href?: string };
  type SidebarSection = { label: string; items: SidebarItem[] };

  const sections: SidebarSection[] = [
    {
      label: "Teachers",
      items: [
        { id: "hiring-pipeline", label: "Hiring Pipeline", icon: Users },
        { id: "recruitment-pipeline", label: "Recruitment Pipeline", icon: FileText },
        { id: "teacher-applications", label: "Applications & Interviews", icon: FileText, badge: applications },
        { id: "interviews", label: "Interviews", icon: Video },
        { id: "profile-review", label: "Profile Approvals", icon: FileText, badge: profileApprovals },
        { id: "teachers", label: "Active Teachers", icon: GraduationCap },
        { id: "staff-operations", label: "Staff Operations", icon: Briefcase },
      ],
    },
    {
      label: "Students",
      items: [
        { id: "students", label: "Students", icon: Users },
        { id: "users", label: "User Manager", icon: Users },
      ],
    },
    {
      label: "Operations",
      items: [
        { id: "schedule", label: "Schedule", icon: Calendar },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "analytics", label: "Analytics", icon: TrendingUp },
      ],
    },
    {
      label: "Communications",
      items: [
        { id: "communications", label: "Communications", icon: Radio },
        { id: "inbox", label: "Contact Inbox", icon: Inbox },
        { id: "tech-support", label: "Tech Support", icon: LifeBuoy },
        { id: "email-log", label: "Email Log", icon: Mail },
      ],
    },
    {
      label: "Marketing",
      items: [
        { id: "marketing", label: "Marketing", icon: Megaphone },
      ],
    },
    {
      label: "Performance",
      items: [
        { id: "teacher-kpi-ext", label: "Teacher KPI", icon: BarChart3, href: "/admin/teacher-kpi", badge: atRiskTeachers },
        { id: "bonus-queue-ext", label: "Bonus Queue", icon: Gift, href: "/admin/bonus-queue", badge: pendingBonuses },
      ],
    },
    {
      label: "System",
      items: [
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  const renderItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const hasBadge = !!item.badge && item.badge > 0;
    const inner = (
      <>
        {hasBadge && !isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-amber-500 animate-pulse" />
        )}
        <Icon className={`h-4 w-4 mr-3 ${hasBadge && !isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
        <span className="flex-1 text-left">{item.label}</span>
        {hasBadge ? (
          <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold animate-pulse">
            {item.badge! > 99 ? '99+' : item.badge}
          </span>
        ) : null}
      </>
    );
    const className = `w-full justify-start transition-all relative ${
      isActive
        ? 'bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20'
        : hasBadge
          ? 'text-foreground font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 ring-1 ring-amber-300/60'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`;
    if (item.href) {
      return (
        <Button key={item.id} variant="ghost" className={className} asChild>
          <Link to={item.href}>{inner}</Link>
        </Button>
      );
    }
    return (
      <Button key={item.id} variant="ghost" className={className} onClick={() => onTabChange(item.id)}>
        {inner}
      </Button>
    );
  };

  return (
    <aside className="w-64 bg-card/80 backdrop-blur-xl border-r border-border/50 h-full overflow-y-auto">
      <div className="p-4">
        {/* Branded Header */}
        <div className="mb-6 px-2 pb-4 border-b border-border/50">
          <Logo size="small" />
          <p className="text-xs text-muted-foreground mt-1 font-medium">Control Tower — Master Admin</p>
        </div>

        <div className="space-y-1">
          {topItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {sections.map((section) => (
          <div key={section.label} className="mt-4 pt-4 border-t border-border/50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2 font-semibold">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(renderItem)}
            </div>
          </div>
        ))}

        <div className="mt-8 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
};

