import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Loader2, Zap, MessageSquare, Video, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { convertSingleAISlide, AISlideSchema } from './utils/convertAISlideSchema';
import { handleAIResponse, showAIErrorToast } from '@/lib/aiErrorHandler';
import type { Slide } from './types';

interface InsertAISlideButtonProps {
  index: number;
  hub: string;
  topic: string;
  previousSlide?: Slide | null;
  onInsertSlide: (index: number, slide: Slide) => void;
}

const PRESETS = [
  {
    id: 'quiz',
    label: '⚡ Quick Quiz',
    icon: Zap,
    prompt: 'Create a 3-question multiple choice quiz based on the previous slide. Include correct answers marked clearly.',
  },
  {
    id: 'speaking',
    label: '🗣️ Speaking',
    icon: MessageSquare,
    prompt: 'Create an interactive discussion question with Key Vocabulary hints for the student to practice speaking.',
  },
  {
    id: 'video',
    label: '📺 Video Break',
    icon: Video,
    prompt: 'Find and embed a 2-3 minute YouTube video related to the current topic. Make it engaging and educational.',
  },
  {
    id: 'concept',
    label: '🧠 Concept Check',
    icon: Brain,
    prompt: 'Create a True or False or Fill-in-the-blanks slide to verify student understanding of the material so far.',
  },
];

export const InsertAISlideButton: React.FC<InsertAISlideButtonProps> = ({
  index,
  hub,
  topic,
  previousSlide,
  onInsertSlide,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const generateSlide = async (prompt: string, presetId?: string) => {
    setIsGenerating(true);
    if (presetId) setActivePreset(presetId);

    try {
      const previousContent = previousSlide ? {
        title: previousSlide.title,
        teacherNotes: previousSlide.teacherNotes,
        keywords: previousSlide.keywords,
      } : undefined;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          hub,
          topic: topic || 'General English',
          mode: 'single_slide',
          prompt,
          previousSlideContent: previousContent,
        },
      });

      if (!handleAIResponse({ data, error, onRetry: () => generateSlide(prompt, presetId), context: 'Slide Injection' })) {
        return;
      }

      const aiSlide: AISlideSchema = data?.slide;
      if (!aiSlide) {
        showAIErrorToast('No slide returned', () => generateSlide(prompt, presetId), 'Slide Injection');
        return;
      }

      const newSlide = convertSingleAISlide(aiSlide, index);
      onInsertSlide(index, newSlide);
      setIsOpen(false);
      setCustomPrompt('');
      toast({ title: '✨ Slide Injected!', description: `New slide added at position ${index + 1}` });
    } catch (err: any) {
      console.error('Slide injection error:', err);
      showAIErrorToast(err?.message || 'Slide injection failed', () => generateSlide(prompt, presetId), 'Slide Injection');
    } finally {
      setIsGenerating(false);
      setActivePreset(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-full h-4 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group"
          title="Insert AI Slide"
        >
          <div className="flex items-center gap-0.5 bg-primary/10 hover:bg-primary/20 rounded-full px-1.5 py-0.5 transition-colors">
            <Plus className="h-2 w-2 text-primary" />
            <span className="text-[7px] font-semibold text-primary">AI</span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="center"
        className="w-72 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl p-3"
      >
        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quick Presets</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                className="h-8 text-[10px] gap-1 justify-start"
                disabled={isGenerating}
                onClick={() => generateSlide(preset.prompt, preset.id)}
              >
                {isGenerating && activePreset === preset.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <preset.icon className="h-3 w-3" />
                )}
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="border-t border-border pt-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Custom Prompt</p>
            <div className="flex gap-1.5">
              <Input
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="What kind of slide?"
                className="h-7 text-[10px] flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customPrompt.trim()) generateSlide(customPrompt.trim());
                }}
              />
              <Button
                size="sm"
                className="h-7 text-[10px] px-2"
                disabled={isGenerating || !customPrompt.trim()}
                onClick={() => generateSlide(customPrompt.trim())}
              >
                {isGenerating && !activePreset ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
