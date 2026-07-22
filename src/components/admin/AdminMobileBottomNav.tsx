import React from "react";
import { LayoutDashboard, Users, GraduationCap, CalendarDays, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminMobileTab =
  | "overview"
  | "students"
  | "teachers"
  | "schedule"
  | "settings";

interface AdminMobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: AdminMobileTab) => void;
  className?: string;
}

const ITEMS: { id: AdminMobileTab; icon: typeof Users; label: string }[] = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "students", icon: Users, label: "Students" },
  { id: "teachers", icon: GraduationCap, label: "Teachers" },
  { id: "schedule", icon: CalendarDays, label: "Schedule" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export const AdminMobileBottomNav: React.FC<AdminMobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 lg:hidden",
        "bg-card/90 backdrop-blur-xl border-t border-border/60",
        "shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.15)]",
        className
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Admin mobile navigation"
    >
      <ul className="grid grid-cols-5 gap-1 px-2 pt-2 pb-2">
        {ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onTabChange(id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full min-h-[52px] rounded-xl",
                  "transition-all duration-200 touch-manipulation select-none active:scale-95",
                  isActive
                    ? "text-primary bg-primary/10 ring-1 ring-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                <span className="text-[10px] font-semibold tracking-tight">
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AdminMobileBottomNav;
