
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  delay?: '300' | '500' | '700' | '900' | '1100' | '1300' | string;
  animationType?: 'fade' | 'bounce' | 'scale' | 'none';
}

export function AnimatedButton({
  children,
  className,
  delay = '0',
  animationType = 'bounce',
  ...props
}: AnimatedButtonProps) {
  const getAnimationClass = () => {
    switch (animationType) {
      case 'fade':
        return delay === '0' ? 'animate-fade-in' : `animate-fade-in animation-delay-${delay}`;
      case 'bounce':
        return 'animate-bounce-light';
      case 'scale':
        return delay === '0' ? 'animate-scale-in' : `animate-scale-in animation-delay-${delay}`;
      case 'none':
        return '';
      default:
        return 'animate-bounce-light';
    }
  };

  return (
    <Button 
      className={cn(getAnimationClass(), "transition-all hover:scale-105", className)} 
      {...props}
    >
      {children}
    </Button>
  );
}
