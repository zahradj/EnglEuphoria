
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  return (
    <>
      <div className={cn("absolute -z-10 inset-0 overflow-hidden", className)}>
        {/* Joyful background gradients */}
        <div className="absolute -z-10 top-1/4 left-1/4 w-[120%] h-[120%] opacity-30 rounded-full blur-3xl animate-gentle-pulse"
             style={{ background: 'var(--gradient-cool)' }}></div>
        <div className="absolute -z-10 bottom-1/3 right-1/4 w-[100%] h-[100%] opacity-25 rounded-full blur-3xl animate-gentle-pulse"
             style={{ background: 'var(--gradient-warm)', animationDelay: '1s' }}></div>
        <div className="absolute -z-10 top-1/2 left-1/2 w-[90%] h-[90%] opacity-20 rounded-full blur-3xl animate-gentle-pulse"
             style={{ background: 'var(--gradient-success)', animationDelay: '2s' }}></div>
        
        {/* Floating educational elements */}
        <div className="absolute top-20 right-[10%] w-16 h-16 rounded-full blur-sm animate-float-slow opacity-40"
             style={{ background: 'hsl(var(--joy-yellow))' }}></div>
        <div className="absolute bottom-32 left-[15%] w-12 h-12 rounded-full blur-sm animate-float-delayed opacity-35"
             style={{ background: 'hsl(var(--joy-purple))' }}></div>
        <div className="absolute top-1/3 right-[30%] w-8 h-8 rounded-full blur-sm animate-sparkle opacity-50"
             style={{ background: 'hsl(var(--joy-pink))' }}></div>
        <div className="absolute bottom-1/4 left-[40%] w-6 h-6 rounded-full blur-sm animate-sparkle opacity-45"
             style={{ background: 'hsl(var(--joy-teal))', animationDelay: '0.5s' }}></div>
        
        {/* Educational symbols floating */}
        <div className="absolute top-16 left-[20%] text-4xl opacity-20 animate-float-slow">📚</div>
        <div className="absolute bottom-20 right-[25%] text-3xl opacity-15 animate-float-delayed">⭐</div>
        <div className="absolute top-1/2 left-[10%] text-2xl opacity-10 animate-sparkle">🎓</div>
        <div className="absolute bottom-1/3 left-[60%] text-3xl opacity-15 animate-float-slow">🌟</div>
      </div>
    </>
  );
}
