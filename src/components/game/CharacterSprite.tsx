import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CharacterSpriteProps {
  name: string;
  emotion: 'happy' | 'excited' | 'encouraging' | 'celebrating' | 'neutral';
  position?: 'left' | 'right' | 'center';
  size?: 'small' | 'medium' | 'large';
  dialogue?: string;
  showDialogue?: boolean;
  className?: string;
}

const characterEmojis: Record<string, Record<string, string>> = {
  'Parrot Pete': {
    happy: '🦜',
    excited: '🦜✨',
    encouraging: '🦜💪',
    celebrating: '🦜🎉',
    neutral: '🦜'
  },
  'Grandma Rose': {
    happy: '👵😊',
    excited: '👵✨',
    encouraging: '👵❤️',
    celebrating: '👵🎊',
    neutral: '👵'
  },
  'Zookeeper Zara': {
    happy: '👩‍🦰😄',
    excited: '👩‍🦰🌟',
    encouraging: '👩‍🦰👍',
    celebrating: '👩‍🦰🎈',
    neutral: '👩‍🦰'
  },
  'Chef Carlo': {
    happy: '👨‍🍳😊',
    excited: '👨‍🍳✨',
    encouraging: '👨‍🍳🔥',
    celebrating: '👨‍🍳🏆',
    neutral: '👨‍🍳'
  },
  'Clocky': {
    happy: '⏰😊',
    excited: '⏰⚡',
    encouraging: '⏰💫',
    celebrating: '⏰🎯',
    neutral: '⏰'
  }
};

const emotionAnimations = {
  happy: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
  },
  excited: {
    scale: [1, 1.2, 1],
    y: [0, -10, 0],
    transition: { duration: 0.4, repeat: Infinity, repeatDelay: 1 }
  },
  encouraging: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }
  },
  celebrating: {
    rotate: [0, -15, 15, -10, 10, 0],
    scale: [1, 1.3, 1.3, 1],
    transition: { duration: 1, repeat: Infinity, repeatDelay: 0.5 }
  },
  neutral: {
    scale: 1,
    transition: { duration: 0.3 }
  }
};

const positionClasses = {
  left: 'left-4',
  right: 'right-4',
  center: 'left-1/2 -translate-x-1/2'
};

const sizeClasses = {
  small: 'text-4xl',
  medium: 'text-6xl',
  large: 'text-8xl'
};

export function CharacterSprite({
  name,
  emotion,
  position = 'left',
  size = 'medium',
  dialogue,
  showDialogue = false,
  className
}: CharacterSpriteProps) {
  const characterEmoji = characterEmojis[name]?.[emotion] || characterEmojis[name]?.neutral || '🎭';

  return (
    <div className={cn('fixed bottom-4 z-30', positionClasses[position], className)}>
      <motion.div
        className={cn('relative', sizeClasses[size])}
        animate={emotionAnimations[emotion]}
      >
        {characterEmoji}
      </motion.div>

      <AnimatePresence>
        {showDialogue && dialogue && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-background border-2 border-primary rounded-2xl px-4 py-2 shadow-lg">
              <div className="text-sm font-medium text-foreground max-w-xs">
                {dialogue}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="w-3 h-3 bg-background border-r-2 border-b-2 border-primary rotate-45"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
