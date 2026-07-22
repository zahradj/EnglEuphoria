import React from "react";
import { Button } from "@/components/ui/button";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function ToolButton({ icon, label, onClick }: ToolButtonProps) {
  return (
    <div className="relative group">
      {/* Ambient glow effect */}
      <div className="absolute -inset-1 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, rgba(196, 217, 255, 0.4) 0%, rgba(232, 249, 255, 0.3) 50%, rgba(196, 217, 255, 0.4) 100%)' }}></div>
      
      <Button
        variant="ghost"
        className="relative w-full justify-start gap-3 h-12 text-sm transition-all duration-300 rounded-xl group overflow-hidden shadow-sm hover:shadow-lg backdrop-blur-sm"
        style={{
          background: 'linear-gradient(90deg, rgba(232, 249, 255, 0.6) 0%, rgba(196, 217, 255, 0.4) 100%)',
          border: '1px solid rgba(196, 217, 255, 0.5)',
          color: '#4F46E5'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(90deg, rgba(196, 217, 255, 0.6) 0%, rgba(197, 186, 255, 0.5) 100%)';
          e.currentTarget.style.borderColor = 'rgba(196, 217, 255, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(90deg, rgba(232, 249, 255, 0.6) 0%, rgba(196, 217, 255, 0.4) 100%)';
          e.currentTarget.style.borderColor = 'rgba(196, 217, 255, 0.5)';
        }}
        onClick={onClick}
      >
        {/* Animated background shimmer */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(196, 217, 255, 0.3) 50%, transparent 100%)' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-1 right-2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 animate-float transition-opacity duration-300" style={{ backgroundColor: 'rgba(196, 217, 255, 0.6)' }}></div>
        <div className="absolute bottom-2 right-4 w-0.5 h-0.5 rounded-full opacity-0 group-hover:opacity-100 animate-float animation-delay-300 transition-opacity duration-300" style={{ backgroundColor: 'rgba(197, 186, 255, 0.7)' }}></div>
        
        <div className="transition-all duration-300 relative z-10 group-hover:scale-110" style={{ color: '#4F46E5' }}>
          {icon}
        </div>
        <span className="truncate font-medium relative z-10 transition-all duration-300 group-hover:translate-x-1" style={{ color: '#4F46E5' }}>{label}</span>
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(225deg, rgba(196, 217, 255, 0.4) 0%, transparent 100%)' }}></div>
      </Button>
    </div>
  );
}