import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface ToolRailOverlayProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ToolRailOverlay({ title, onClose, children }: ToolRailOverlayProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(onClose, 200);
  };

  return (
    <>
      {/* Enhanced backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Enhanced overlay panel */}
      <div 
        className={`
          fixed inset-y-0 right-0 z-50 shadow-2xl transition-all duration-500 ease-out
          ${isMaximized ? 'w-96' : 'w-80'}
          ${isAnimating ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        `}
        style={{ 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
          borderLeft: '2px solid rgba(196, 217, 255, 0.6)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Ambient glow effect */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ 
            background: 'linear-gradient(180deg, rgba(196, 217, 255, 0.1) 0%, rgba(197, 186, 255, 0.05) 100%)' 
          }}
        />
        
        <div className="h-full flex flex-col relative z-10">
          {/* Enhanced header */}
          <div 
            className="flex items-center justify-between px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
            style={{ borderBottom: '1px solid rgba(196, 217, 255, 0.5)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h3>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-7 w-7 transition-all duration-300 hover:bg-blue-100/50 hover:scale-110"
              >
                {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose} 
                className="h-7 w-7 transition-all duration-300 hover:bg-red-100/50 hover:scale-110 hover:rotate-90"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced content area */}
          <div 
            className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
            style={{ 
              background: 'linear-gradient(180deg, rgba(232, 249, 255, 0.3) 0%, rgba(248, 250, 252, 0.1) 100%)' 
            }}
          >
            <div className="space-y-4 animate-fade-in">
              {children}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-16 left-2 w-0.5 h-8 bg-gradient-to-b from-blue-400/40 to-transparent rounded-full" />
          <div className="absolute bottom-16 right-2 w-0.5 h-6 bg-gradient-to-t from-purple-400/40 to-transparent rounded-full" />
        </div>
      </div>
    </>
  );
}