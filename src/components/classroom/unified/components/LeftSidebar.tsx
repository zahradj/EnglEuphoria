import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Link, 
  Award, 
  MessageCircle, 
  Library,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface LeftSidebarProps {
  onToolSelect: (tool: string) => void;
  selectedTool?: string;
}

export function LeftSidebar({ onToolSelect, selectedTool }: LeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tools = [
    { id: 'embed', icon: Link, label: 'Embed Link', color: 'hsl(var(--classroom-primary))', description: 'Share external content' },
    { id: 'awards', icon: Award, label: 'Give Awards', color: 'hsl(var(--classroom-secondary))', description: 'Reward students' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', color: 'hsl(var(--classroom-accent))', description: 'Real-time messaging' },
    { id: 'library', icon: Library, label: 'Library', color: 'hsl(var(--classroom-success))', description: 'Access lessons library' }
  ];

  return (
    <TooltipProvider>
      <Card 
        className={`
          h-full bg-classroom-card backdrop-blur-sm border-r-2 border-[hsl(var(--classroom-border))]
          transition-all duration-500 ease-in-out relative overflow-hidden
          shadow-xl hover:shadow-2xl
          ${isCollapsed ? 'w-16' : 'w-20'}
        `}
      >
        {/* Enhanced ambient glow effect */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-500"
          style={{ 
            background: 'linear-gradient(180deg, hsl(var(--classroom-primary) / 0.1) 0%, hsl(var(--classroom-accent) / 0.05) 100%)' 
          }}
        />

        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--classroom-primary)/0.15)] via-transparent to-[hsl(var(--classroom-accent)/0.15)] opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Enhanced collapse toggle */}
        <div className="absolute top-4 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0 rounded-full hover:bg-[hsl(var(--classroom-primary)/0.1)] transition-all duration-300 hover:scale-110"
          >
            {isCollapsed ? (
              <ChevronRight size={12} style={{ color: 'hsl(var(--classroom-primary))' }} />
            ) : (
              <ChevronLeft size={12} style={{ color: 'hsl(var(--classroom-primary))' }} />
            )}
          </Button>
        </div>

        {/* Enhanced tool buttons */}
        <div className="flex flex-col gap-4 p-4 pt-12">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            
            return (
              <Tooltip key={tool.id} delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Enhanced ambient glow for selected/hover */}
                    <div 
                      className={`
                        absolute -inset-3 rounded-xl blur opacity-0 transition-all duration-500
                        ${isSelected ? 'opacity-60 scale-110' : 'group-hover:opacity-40 group-hover:scale-105'}
                      `}
                      style={{ 
                        background: `linear-gradient(135deg, ${tool.color}60, ${tool.color}30)` 
                      }}
                    />
                    
                    <Button
                      variant="ghost"
                      className={`
                        relative h-12 w-12 rounded-xl transition-all duration-500 
                        border border-transparent backdrop-blur-sm group overflow-hidden
                        animate-fade-in
                        ${isSelected 
                          ? 'shadow-xl scale-110 border-2' 
                          : 'hover:shadow-lg hover:scale-105'
                        }
                      `}
                        style={{
                        background: isSelected 
                          ? `linear-gradient(135deg, ${tool.color}20, ${tool.color}10)`
                          : 'hsl(var(--classroom-background))',
                        borderColor: isSelected 
                          ? tool.color 
                          : 'hsl(var(--classroom-border))'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${tool.color}25, ${tool.color}12)`;
                          e.currentTarget.style.borderColor = tool.color;
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'hsl(var(--classroom-background))';
                          e.currentTarget.style.borderColor = 'hsl(var(--classroom-border))';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                      onClick={() => {
                        onToolSelect(tool.id);
                      }}
                    >
                      {/* Enhanced animated background shimmer */}
                      <div 
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
                        style={{ 
                          background: `linear-gradient(90deg, transparent 0%, ${tool.color}30 50%, transparent 100%)` 
                        }}
                      />
                      
                      {/* Enhanced floating particles */}
                      <div 
                        className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 animate-float transition-opacity duration-500"
                        style={{ backgroundColor: `${tool.color}80` }}
                      />
                      <div 
                        className="absolute bottom-1 left-1 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 animate-float animation-delay-300 transition-opacity duration-500"
                        style={{ backgroundColor: `${tool.color}90` }}
                      />
                      <div 
                        className="absolute top-1/2 left-1/2 w-0.5 h-0.5 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"
                        style={{ backgroundColor: `${tool.color}70` }}
                      />
                      
                      <Icon 
                        size={20} 
                        className={`
                          relative z-10 transition-all duration-300 
                          ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                        `}
                        style={{ 
                          color: isSelected ? tool.color : '#64748B' 
                        }}
                      />
                      
                      {/* Enhanced selection indicator */}
                      {isSelected && (
                        <div 
                          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-1.5 h-8 rounded-l-full animate-pulse"
                          style={{ backgroundColor: tool.color }}
                        />
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className="bg-classroom-card backdrop-blur-sm border border-classroom-border shadow-xl rounded-xl p-3 animate-fade-in"
                  sideOffset={12}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm" style={{ color: tool.color }}>
                      {tool.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {tool.description}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[hsl(var(--classroom-primary)/0.6)] to-transparent animate-pulse" />
        <div className="absolute top-12 left-1 w-0.5 h-12 rounded-full bg-gradient-to-b from-[hsl(var(--classroom-primary)/0.6)] to-transparent" />
        <div className="absolute bottom-20 right-1 w-0.5 h-8 rounded-full bg-gradient-to-t from-[hsl(var(--classroom-accent)/0.4)] to-transparent" />
      </Card>
    </TooltipProvider>
  );
}