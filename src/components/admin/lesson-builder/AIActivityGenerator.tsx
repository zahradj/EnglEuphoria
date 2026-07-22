import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { CanvasElementData } from './types';

interface AIActivityGeneratorProps {
  lessonContent: string;
  level: string;
  onActivitiesGenerated: (elements: CanvasElementData[]) => void;
}

const ACTIVITY_TYPES = [
  { id: 'matching', label: 'Matching Pairs', desc: 'Connect related items' },
  { id: 'fill-blank', label: 'Fill in the Blank', desc: 'Complete sentences' },
  { id: 'quiz', label: 'Multiple Choice Quiz', desc: 'Select correct answers' },
  { id: 'sorting', label: 'Sorting / Ordering', desc: 'Put items in order' },
];

export const AIActivityGenerator: React.FC<AIActivityGeneratorProps> = ({
  lessonContent, level, onActivitiesGenerated
}) => {
  const [open, setOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['matching', 'fill-blank']);
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleType = (id: string) => {
    setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (!lessonContent.trim()) { toast.error('No lesson content to generate from'); return; }
    if (selectedTypes.length === 0) { toast.error('Select at least one activity type'); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-activity-generator', {
        body: {
          content: lessonContent.slice(0, 3000),
          level,
          activityTypes: selectedTypes,
          customInstructions,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const activities: CanvasElementData[] = (data.activities || []).map((act: any, i: number) => ({
        id: uuidv4(),
        elementType: act.type as any,
        x: 100,
        y: 100 + i * 350,
        width: 600,
        height: 300,
        rotation: 0,
        zIndex: i + 1,
        content: act.content,
      }));

      onActivitiesGenerated(activities);
      toast.success(`Generated ${activities.length} activities!`);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate activities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Activities
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Interactive Activities
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Activity Types</Label>
            {ACTIVITY_TYPES.map(type => (
              <div key={type.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <Checkbox
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={() => toggleType(type.id)}
                />
                <div>
                  <p className="text-sm font-medium">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Label className="text-sm">Custom Instructions (optional)</Label>
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g., Focus on past tense verbs..."
              className="mt-1 min-h-[60px]"
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate Activities
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
