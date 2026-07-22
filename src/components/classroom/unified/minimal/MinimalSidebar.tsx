import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Gift, Clock, MessageSquare, Sparkles, Disc3 } from "lucide-react";

export type MinimalTool = "rewards" | "timer" | "chat" | "wheel" | "ai";

interface MinimalSidebarProps {
  side?: "left" | "right";
  collapsedByDefault?: boolean;
  onOpenTool: (tool: MinimalTool) => void;
}

export function MinimalSidebar({ side = "left", onOpenTool }: MinimalSidebarProps) {
  const containerCls = cn(
    "pointer-events-auto fixed z-30 top-1/4 flex flex-col items-center gap-2 p-2 rounded-xl border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg",
    side === "left" ? "left-4" : "right-4"
  );

  return (
    <aside className={containerCls} aria-label="Classroom tools">
      <ToolButton icon={<Gift className="h-5 w-5" />} label="Rewards" onClick={() => onOpenTool("rewards")} />
      <ToolButton icon={<Clock className="h-5 w-5" />} label="Timer" onClick={() => onOpenTool("timer")} />
      <ToolButton icon={<MessageSquare className="h-5 w-5" />} label="Chat" onClick={() => onOpenTool("chat")} />
      <ToolButton icon={<Disc3 className="h-5 w-5" />} label="Wheel" onClick={() => onOpenTool("wheel")} />
      <ToolButton icon={<Sparkles className="h-5 w-5" />} label="AI" onClick={() => onOpenTool("ai")} />
    </aside>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="icon" className="w-10 h-10" onClick={onClick} title={label} aria-label={label}>
      {icon}
    </Button>
  );
}

