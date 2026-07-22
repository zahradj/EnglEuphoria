import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Lightbulb, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PowerUpType = 'time_freeze' | 'hint' | 'double_points' | 'shield';

interface PowerUp {
  type: PowerUpType;
  icon: React.ReactNode;
  label: string;
  description: string;
  available: boolean;
  cooldown?: number;
}

interface PowerUpSystemProps {
  powerUps: PowerUp[];
  onActivate: (type: PowerUpType) => void;
  className?: string;
}

const powerUpIcons: Record<PowerUpType, React.ReactNode> = {
  time_freeze: <Clock className="h-5 w-5" />,
  hint: <Lightbulb className="h-5 w-5" />,
  double_points: <Zap className="h-5 w-5" />,
  shield: <Shield className="h-5 w-5" />
};

const powerUpColors: Record<PowerUpType, string> = {
  time_freeze: 'from-blue-500 to-cyan-500',
  hint: 'from-yellow-500 to-amber-500',
  double_points: 'from-purple-500 to-pink-500',
  shield: 'from-green-500 to-emerald-500'
};

export function PowerUpSystem({ powerUps, onActivate, className }: PowerUpSystemProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {powerUps.map((powerUp) => (
        <motion.div
          key={powerUp.type}
          whileHover={powerUp.available ? { scale: 1.1 } : {}}
          whileTap={powerUp.available ? { scale: 0.95 } : {}}
        >
          <Button
            variant="outline"
            size="icon"
            disabled={!powerUp.available}
            onClick={() => onActivate(powerUp.type)}
            className={cn(
              'relative rounded-full w-12 h-12 border-2',
              powerUp.available 
                ? `bg-gradient-to-br ${powerUpColors[powerUp.type]} text-white border-white hover:opacity-90` 
                : 'opacity-50 cursor-not-allowed'
            )}
            title={`${powerUp.label}: ${powerUp.description}`}
          >
            {powerUpIcons[powerUp.type]}
            {powerUp.cooldown && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-xs font-bold">
                {powerUp.cooldown}s
              </div>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
