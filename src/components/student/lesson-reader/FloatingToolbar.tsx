import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Type, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeMode } from '@/hooks/useThemeMode';
import { ttsService } from '@/services/ttsService';
import { cn } from '@/lib/utils';

interface FloatingToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  content: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  fontSize,
  onFontSizeChange,
  content,
}) => {
  const { resolvedTheme, toggleTheme } = useThemeMode();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleListen = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      // Strip markdown and take first 500 chars for TTS
      const plainText = content
        .replace(/[#*`\->\[\]()!]/g, '')
        .replace(/\n+/g, '. ')
        .slice(0, 500);
      const audioUrl = await ttsService.generateSpeech(plainText);
      await ttsService.playAudio(audioUrl);
    } catch (e) {
      console.error('TTS failed:', e);
    } finally {
      setIsPlaying(false);
    }
  };

  const cycleFontSize = () => {
    const sizes = [16, 18, 20, 22];
    const currentIdx = sizes.indexOf(fontSize);
    onFontSizeChange(sizes[(currentIdx + 1) % sizes.length]);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 100 }}
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 px-4 py-2.5 rounded-2xl',
        'border border-border/40 backdrop-blur-xl bg-card/70 shadow-2xl'
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleListen}
        disabled={isPlaying}
        className="rounded-xl gap-1.5"
      >
        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        <span className="text-xs">Listen</span>
      </Button>

      <div className="w-px h-6 bg-border/40" />

      <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-xl gap-1.5">
        {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span className="text-xs">Theme</span>
      </Button>

      <div className="w-px h-6 bg-border/40" />

      <Button variant="ghost" size="sm" onClick={cycleFontSize} className="rounded-xl gap-1.5">
        <Type className="w-4 h-4" />
        <span className="text-xs">{fontSize}px</span>
      </Button>
    </motion.div>
  );
};
