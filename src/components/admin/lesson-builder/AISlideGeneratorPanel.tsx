import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { convertAISlidesToCanvasSlides, AISlideSchema } from './utils/convertAISlideSchema';
import { handleAIResponse, showAIErrorToast } from '@/lib/aiErrorHandler';
import type { Slide } from './types';
import { cn } from '@/lib/utils';

type HubType = 'playground' | 'academy' | 'success';

interface AISlideGeneratorPanelProps {
  onSlidesGenerated: (slides: Slide[], title: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const HUB_BADGES: Record<HubType, { label: string; colorClass: string }> = {
  playground: { label: '🎨 Playground', colorClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  academy: { label: '📚 Academy', colorClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  success: { label: '💼 Success', colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

export const AISlideGeneratorPanel: React.FC<AISlideGeneratorPanelProps> = ({
  onSlidesGenerated,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { toast } = useToast();
  const [hub, setHub] = useState<HubType>('playground');
  const [topic, setTopic] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [targetGrammar, setTargetGrammar] = useState('');
  const [targetVocabulary, setTargetVocabulary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Topic required', description: 'Enter a lesson topic.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          hub,
          topic: topic.trim(),
          targetGrammar: targetGrammar.trim() || undefined,
          targetVocabulary: targetVocabulary.trim() || undefined,
          studentAge: studentAge.trim() || undefined,
          mode: 'full_deck',
        },
      });

      if (!handleAIResponse({ data, error, onRetry: handleGenerate, context: 'Magic Deck' })) {
        setIsGenerating(false);
        return;
      }

      const aiSlides: AISlideSchema[] = data?.slides || [];
      if (aiSlides.length === 0) {
        showAIErrorToast('AI returned empty slides array', handleGenerate, 'Magic Deck');
        setIsGenerating(false);
        return;
      }

      const canvasSlides = convertAISlidesToCanvasSlides(aiSlides);
      const title = data?.lesson_title || topic.trim();
      onSlidesGenerated(canvasSlides, title);

      toast({ title: '✨ Magic Deck Generated!', description: `Created ${canvasSlides.length} slides for "${title}"` });
    } catch (err: any) {
      console.error('Generation error:', err);
      showAIErrorToast(err?.message || 'Unknown error', handleGenerate, 'Magic Deck');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-10 bg-card/80 backdrop-blur-xl border-r border-border flex flex-col items-center pt-3 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleCollapse}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="mt-3 flex flex-col items-center gap-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[8px] text-muted-foreground font-medium" style={{ writingMode: 'vertical-rl' }}>
            AI Architect
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-card/80 backdrop-blur-xl border-r border-border flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">AI Slide Architect</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleCollapse}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Hub Selection */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Hub</label>
          <Select value={hub} onValueChange={(v) => setHub(v as HubType)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(HUB_BADGES).map(([key, { label, colorClass }]) => (
                <SelectItem key={key} value={key}>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded border', colorClass)}>{label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Topic</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Present Continuous"
            className="h-8 text-xs"
          />
        </div>

        {/* Student Age */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Student Age / Level</label>
          <Input
            value={studentAge}
            onChange={(e) => setStudentAge(e.target.value)}
            placeholder="e.g. 14 years old, B1"
            className="h-8 text-xs"
          />
        </div>

        {/* Target Grammar */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Grammar Focus</label>
          <Input
            value={targetGrammar}
            onChange={(e) => setTargetGrammar(e.target.value)}
            placeholder="e.g. Present Perfect"
            className="h-8 text-xs"
          />
        </div>

        {/* Target Vocabulary */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Vocabulary Focus</label>
          <Input
            value={targetVocabulary}
            onChange={(e) => setTargetVocabulary(e.target.value)}
            placeholder="e.g. travel, airport, luggage"
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="p-3 border-t border-border">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className={cn(
            'w-full h-9 text-xs font-semibold gap-1.5 transition-all',
            isGenerating && 'animate-pulse'
          )}
          style={{
            background: isGenerating
              ? undefined
              : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))',
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating Magic Deck...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Generate Magic Deck
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
