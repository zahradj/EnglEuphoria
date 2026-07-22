import React from 'react';
import { motion } from 'framer-motion';
import { ConstellationStar } from '@/types/constellation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StarProps {
  star: ConstellationStar;
  onClick?: () => void;
}

export const Star = ({ star, onClick }: StarProps) => {
  const brightness = star.brightness / 100;
  const scale = star.size === 'large' ? 1.5 : star.size === 'medium' ? 1.2 : 1;
  const glowIntensity = brightness * 20;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="absolute cursor-pointer"
            style={{
              left: `${star.position.x}%`,
              top: `${star.position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [scale, scale * 1.1, scale],
              opacity: star.isActive ? brightness : 0.3,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{ scale: scale * 1.2 }}
            onClick={onClick}
          >
            <div
              className="relative"
              style={{
                filter: `drop-shadow(0 0 ${glowIntensity}px ${star.color})`,
              }}
            >
              <span className="text-5xl" style={{ color: star.color }}>
                {star.icon}
              </span>
              {star.brightness < 100 && (
                <motion.div
                  className="absolute inset-0 bg-black/40 rounded-full"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-semibold">{star.name}</div>
            <div className="text-muted-foreground">{star.description}</div>
            <div className="mt-1">
              Brightness: <span className="font-medium">{Math.round(star.brightness)}%</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
