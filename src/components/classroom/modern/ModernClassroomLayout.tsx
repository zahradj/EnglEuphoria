import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

interface ModernClassroomLayoutProps {
  topBar: ReactNode;
  leftPanel?: ReactNode;
  centerContent: ReactNode;
  rightSidebar?: ReactNode;
  bottomToolbar: ReactNode;
  showLeftPanel?: boolean;
  showRightSidebar?: boolean;
  className?: string;
}

export function ModernClassroomLayout({
  topBar,
  leftPanel,
  centerContent,
  rightSidebar,
  bottomToolbar,
  showLeftPanel = true,
  showRightSidebar = true,
  className
}: ModernClassroomLayoutProps) {
  return (
    <div className={cn(
      "min-h-dvh bg-gradient-to-br from-lesson-purple/10 via-background to-lesson-blue/10",
      "relative overflow-hidden",
      className
    )}>
      {/* Vibrant Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large gradient orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-lesson-purple/30 via-lesson-pink/20 to-transparent rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-lesson-blue/25 via-lesson-teal/20 to-transparent rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-lesson-orange/20 via-lesson-lime/15 to-transparent rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-success/15 via-accent/10 to-transparent rounded-full blur-3xl animate-pulse-fun" />
        
        {/* Smaller accent orbs */}
        <div className="absolute top-20 right-1/4 w-40 h-40 bg-lesson-pink/20 rounded-full blur-2xl animate-bounce-gentle" />
        <div className="absolute bottom-40 right-1/3 w-32 h-32 bg-lesson-teal/25 rounded-full blur-2xl animate-float" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-lesson-lime/20 rounded-full blur-2xl animate-float-slow" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),transparent_50%)]" />
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 h-dvh grid grid-rows-[60px_1fr_70px] gap-0">
        {/* Top Bar */}
        <div className="border-b border-border/50 backdrop-blur-sm bg-surface/80">
          {topBar}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-4 p-4 overflow-hidden">
          {/* Center Content - Takes priority */}
          <div className={cn(
            "overflow-hidden",
            showRightSidebar ? "col-span-9" : "col-span-12"
          )}>
            <GlassCard variant="strong" className="h-full p-6 border-2 border-primary/10 shadow-glow">
              {centerContent}
            </GlassCard>
          </div>

          {/* Right Sidebar - Chat/Dictionary/Rewards */}
          {showRightSidebar && rightSidebar && (
            <div className="col-span-3 overflow-y-auto animate-slide-in">
              <GlassCard className="h-full p-4 border-l-2 border-primary/20">
                {rightSidebar}
              </GlassCard>
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="relative">
          {bottomToolbar}
        </div>
      </div>
    </div>
  );
}
