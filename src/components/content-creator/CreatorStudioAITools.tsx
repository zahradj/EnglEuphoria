import React, { useState } from 'react';
import { Wand2, HelpCircle, BookOpen, Loader2, RefreshCw, Image, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatorStudioAIToolsProps {
  content: string;
  level: string;
  track: string;
  title: string;
  onContentChange: (content: string) => void;
  onCoverImageChange: (url: string) => void;
}

const INFORMAL_WORDS = ['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'y\'all', 'ain\'t', 'dude', 'awesome', 'cool', 'stuff', 'things', 'like', 'totally', 'super', 'lol', 'omg'];
const FORMAL_WORDS = ['furthermore', 'moreover', 'nevertheless', 'consequently', 'henceforth', 'whereby', 'thereof', 'herein', 'pursuant', 'notwithstanding'];

export const CreatorStudioAITools: React.FC<CreatorStudioAIToolsProps> = ({
  content,
  level,
  track,
  title,
  onContentChange,
  onCoverImageChange,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!content.trim()) { toast.error('Write some content first'); return; }
    setLoading('quiz');
    try {
      const { data, error } = await supabase.functions.invoke('quiz-generator', {
        body: { topic: content.slice(0, 500), level, systemType: track, questionCount: 5 },
      });
      if (error) throw error;
      toast.success('Quiz generated! Check the Quiz Generator tab.');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(null);
    }
  };

  const handleExtractVocabulary = async () => {
    if (!content.trim()) { toast.error('Write some content first'); return; }
    setLoading('vocab');
    try {
      const { data, error } = await supabase.functions.invoke('curriculum-expert-agent', {
        body: {
          prompt: `Extract key vocabulary from this ${level} level lesson content. Return a JSON array of objects with "word", "definition", and "example" fields:\n\n${content.slice(0, 2000)}`,
          mode: 'vocabulary_extraction',
        },
      });
      if (error) throw error;
      toast.success('Vocabulary extracted!');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to extract vocabulary');
    } finally {
      setLoading(null);
    }
  };

  const handleRefine = async () => {
    if (!content.trim()) { toast.error('Write some content first'); return; }
    setLoading('refine');
    try {
      const { data, error } = await supabase.functions.invoke('studio-ai-copilot', {
        body: { mode: 'refine', content, level },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onContentChange(data.content);
      toast.success(`Content refined to ${level} level!`);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to refine content');
    } finally {
      setLoading(null);
    }
  };

  const handleCoverImage = async () => {
    if (!title.trim()) { toast.error('Add a title first'); return; }
    setLoading('cover');
    try {
      const { data, error } = await supabase.functions.invoke('studio-ai-copilot', {
        body: { mode: 'cover-image', title, track },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onCoverImageChange(data.coverImageUrl);
      toast.success('Cover image generated!');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate cover image');
    } finally {
      setLoading(null);
    }
  };

  const handleToneCheck = () => {
    if (!content.trim()) { toast.error('Write some content first'); return; }
    const words = content.toLowerCase().split(/\s+/);
    const issues: string[] = [];

    if (track === 'adults') {
      const found = INFORMAL_WORDS.filter(w => words.includes(w));
      if (found.length > 0) {
        issues.push(`Informal words found: ${found.join(', ')}`);
      }
    } else if (track === 'kids') {
      const found = FORMAL_WORDS.filter(w => words.includes(w));
      if (found.length > 0) {
        issues.push(`Overly formal words: ${found.join(', ')}`);
      }
    }

    if (issues.length === 0) {
      toast.success(`Tone is well-matched for ${track === 'kids' ? 'Playground' : track === 'adults' ? 'Professional' : 'Academy'}! ✅`);
    } else {
      toast.warning(issues.join('. ') + '. Consider using AI Refine to fix.');
    }
    setOpen(false);
  };

  const handleGenerateActivities = async () => {
    if (!content.trim()) { toast.error('Write some content first'); return; }
    setLoading('activities');
    try {
      const { data, error } = await supabase.functions.invoke('ai-activity-generator', {
        body: { content: content.slice(0, 3000), level, activityTypes: ['matching', 'fill-blank', 'quiz'], customInstructions: '' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Generated ${data.activities?.length || 0} interactive activities!`);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate activities');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Wand2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-56 p-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1">AI Magic Tools</p>

          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleRefine} disabled={!!loading}>
            {loading === 'refine' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            AI Refine to {level}
          </Button>

          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleCoverImage} disabled={!!loading}>
            {loading === 'cover' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
            Generate Cover Image
          </Button>

          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleToneCheck} disabled={!!loading}>
            <AlertTriangle className="h-4 w-4" />
            Tone Check
          </Button>

          <div className="border-t border-border my-1" />

          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleGenerateQuiz} disabled={!!loading}>
            {loading === 'quiz' ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
            Generate Quiz
          </Button>

          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleExtractVocabulary} disabled={!!loading}>
            {loading === 'vocab' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            Extract Vocabulary
          </Button>

          <div className="border-t border-border my-1" />

          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleGenerateActivities} disabled={!!loading}>
            {loading === 'activities' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate Activities
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
