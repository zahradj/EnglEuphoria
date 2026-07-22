import { Pen, Presentation, MessageCircle, Book, Star, Link, Settings } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface QuickAccessToolbarProps {
  onWhiteboardClick: () => void;
  onSlidesClick: () => void;
  onChatClick: () => void;
  onDictionaryClick: () => void;
  onRewardsClick: () => void;
  onEmbedClick: () => void;
  onSettingsClick: () => void;
  unreadChatCount?: number;
  activeView?: "whiteboard" | "slides" | "chat" | "dictionary" | "rewards" | "embed";
}

export function QuickAccessToolbar({
  onWhiteboardClick,
  onSlidesClick,
  onChatClick,
  onDictionaryClick,
  onRewardsClick,
  onEmbedClick,
  onSettingsClick,
  unreadChatCount = 0,
  activeView
}: QuickAccessToolbarProps) {
  const tools = [
    {
      id: "whiteboard",
      icon: Pen,
      label: "Whiteboard",
      onClick: onWhiteboardClick,
      badge: null
    },
    {
      id: "slides",
      icon: Presentation,
      label: "Slides",
      onClick: onSlidesClick,
      badge: null
    },
    {
      id: "chat",
      icon: MessageCircle,
      label: "Chat",
      onClick: onChatClick,
      badge: unreadChatCount > 0 ? unreadChatCount : null
    },
    {
      id: "dictionary",
      icon: Book,
      label: "Dictionary",
      onClick: onDictionaryClick,
      badge: null
    },
    {
      id: "rewards",
      icon: Star,
      label: "Rewards",
      onClick: onRewardsClick,
      badge: null
    },
    {
      id: "embed",
      icon: Link,
      label: "Embed",
      onClick: onEmbedClick,
      badge: null
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      onClick: onSettingsClick,
      badge: null
    }
  ];

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4">
      <div className="glass-strong rounded-2xl px-5 py-4 shadow-glow border-2 border-primary/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeView === tool.id;
            
            return (
              <div key={tool.id} className="relative">
                <GlassButton
                  size="lg"
                  variant={isActive ? "primary" : "default"}
                  onClick={tool.onClick}
                  className={cn(
                    "w-14 h-14 p-0 flex items-center justify-center relative group transition-all duration-300",
                    isActive && "bg-gradient-to-br from-primary/30 to-accent/20 glow-primary scale-110 border-2 border-primary/50",
                    !isActive && "hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/5 hover:scale-105"
                  )}
                  glow={isActive}
                  aria-label={tool.label}
                >
                  <Icon className={cn(
                    "w-6 h-6 transition-all duration-300 group-hover:scale-125",
                    isActive ? "text-primary drop-shadow-lg" : "text-foreground/80 group-hover:text-foreground"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl animate-pulse-fun" />
                  )}
                </GlassButton>

                {/* Badge for notifications */}
                {tool.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {tool.badge > 9 ? "9+" : tool.badge}
                  </Badge>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform group-hover:translate-y-0 translate-y-2">
                  <div className="glass-strong px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                    {tool.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
