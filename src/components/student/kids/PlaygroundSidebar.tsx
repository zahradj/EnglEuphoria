import React from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, PawPrint, Trophy, Settings } from 'lucide-react';
import { GameButton } from './GameButton';

interface PlaygroundSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  { id: 'home', icon: Home, label: 'Home', variant: 'orange' as const },
  { id: 'learn', icon: BookOpen, label: 'Learn', variant: 'green' as const },
  { id: 'pet', icon: PawPrint, label: 'My Pet', variant: 'orange' as const },
  { id: 'badges', icon: Trophy, label: 'Badges', variant: 'orange' as const },
  { id: 'settings', icon: Settings, label: 'Settings', variant: 'purple' as const },
];

export const PlaygroundSidebar: React.FC<PlaygroundSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex flex-col w-20 lg:w-24 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-3 gap-3"
    >
      {sidebarItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
          >
            <GameButton
              onClick={() => onTabChange(item.id)}
              variant={isActive ? item.variant : 'orange'}
              size="sm"
              className={`w-full flex flex-col items-center justify-center p-3 ${
                !isActive ? 'opacity-60 !bg-gray-200 !shadow-none' : ''
              }`}
            >
              <Icon className="w-7 h-7 lg:w-8 lg:h-8" />
            </GameButton>

            {/* Sparkle for active */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-yellow-300 rounded-full shadow-lg mx-auto mt-1"
              />
            )}
          </motion.div>
        );
      })}
    </motion.aside>
  );
};
