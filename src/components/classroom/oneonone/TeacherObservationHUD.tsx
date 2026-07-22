import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Eye, Mic, Brain, Ear, AlertTriangle, CheckCircle2,
  Send, RotateCcw, Sparkles, Clock, Lightbulb,
  BookOpen, PenTool, Languages,
} from 'lucide-react';

// Pedagogical quick-tap tags
const PEDAGOGICAL_TAGS = [
  { id: 'phonetic-high', label: 'Phonetic Accuracy High', icon: Mic, color: '#2E7D32', category: 'positive' },
  { id: 'vocab-strong', label: 'Vocabulary Strong', icon: Brain, color: '#2E7D32', category: 'positive' },
  { id: 'listening-good', label: 'Good Listening', icon: Ear, color: '#2E7D32', category: 'positive' },
  { id: 'engaged', label: 'High Engagement', icon: Eye, color: '#2E7D32', category: 'positive' },
  // Practice Layer — Phonics
  { id: 'phonics-accurate', label: 'Phonics Accurate', icon: Mic, color: '#2E7D32', category: 'layer-phonics' },
  { id: 'phonics-needs-work', label: 'Phonics Needs Work', icon: Mic, color: '#EF5350', category: 'layer-phonics' },
  // Practice Layer — Vocabulary
  { id: 'vocabulary-connected', label: 'Vocab Connected', icon: BookOpen, color: '#2E7D32', category: 'layer-vocab' },
  { id: 'vocabulary-gap', label: 'Vocab Gap', icon: BookOpen, color: '#EF5350', category: 'layer-vocab' },
  // Practice Layer — Grammar
  { id: 'grammar-understood', label: 'Grammar Understood', icon: Languages, color: '#2E7D32', category: 'layer-grammar' },
  { id: 'grammar-confused', label: 'Grammar Confused', icon: Languages, color: '#EF5350', category: 'layer-grammar' },
  // Corrections
  { id: 'tongue-placement', label: 'Tongue Placement Issue', icon: AlertTriangle, color: '#EF5350', category: 'correction' },
  { id: 'needs-memory', label: 'Needs Memory Reinforcement', icon: Brain, color: '#F59E0B', category: 'correction' },
  { id: 'phonetic-low', label: 'Phonetic Accuracy Low', icon: Mic, color: '#EF5350', category: 'correction' },
  { id: 'distracted', label: 'Low Focus / Distracted', icon: Eye, color: '#F59E0B', category: 'correction' },
  { id: 'retry-needed', label: 'Retry Phase Needed', icon: RotateCcw, color: '#EF5350', category: 'action' },
] as const;

interface ObservationEntry {
  tagId: string;
  label: string;
  timestamp: string;
  category: string;
}

interface TeacherObservationHUDProps {
  sessionId: string;
  studentId: string;
  studentName: string;
  currentPhase?: string;
  currentPhoneme?: string;
  onRetryPhase?: () => void;
}

export const TeacherObservationHUD: React.FC<TeacherObservationHUDProps> = ({
  sessionId,
  studentId,
  studentName,
  currentPhase,
  currentPhoneme,
  onRetryPhase,
}) => {
  const [observations, setObservations] = useState<ObservationEntry[]>([]);
  const [freeNote, setFreeNote] = useState('');
  const [saving, setSaving] = useState(false);

  const addTag = useCallback((tag: typeof PEDAGOGICAL_TAGS[number]) => {
    const entry: ObservationEntry = {
      tagId: tag.id,
      label: tag.label,
      timestamp: new Date().toISOString(),
      category: tag.category,
    };
    setObservations(prev => [entry, ...prev]);
    toast.success(`Tagged: ${tag.label}`);
  }, []);

  const saveObservations = useCallback(async () => {
    setSaving(true);
    try {
      // Save to session context
      const { error } = await supabase
        .from('classroom_sessions')
        .update({
          session_context: {
            teacher_observations: observations,
            teacher_free_note: freeNote,
            observation_saved_at: new Date().toISOString(),
          },
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Also record in mistake history for the feedback loop
      if (observations.some(o => o.category === 'correction')) {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('mistake_history')
          .eq('user_id', studentId)
          .single();

        const currentHistory = (profile?.mistake_history as any[] | null) || [];
        const correctionObs = observations.filter(o => o.category === 'correction');

        const newMistakes = correctionObs.map(obs => ({
          word: currentPhoneme || 'general',
          context: `Teacher observation: ${obs.label}`,
          timestamp: obs.timestamp,
          error_type: obs.tagId.includes('phonetic') ? 'pronunciation' : 'vocabulary',
          correct_answer: '',
          student_answer: '',
        }));

        await supabase
          .from('student_profiles')
          .update({
            mistake_history: [...newMistakes, ...currentHistory].slice(0, 50),
          })
          .eq('user_id', studentId);
      }

      toast.success('Observations saved to diagnostic profile');
    } catch (err) {
      console.error('Save observations error:', err);
      toast.error('Failed to save observations');
    } finally {
      setSaving(false);
    }
  }, [observations, freeNote, sessionId, studentId, currentPhoneme]);

  return (
    <Card className="border border-[#6B21A8]/10 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Professional Observation
          </CardTitle>
          {currentPhase && (
            <Badge variant="outline" className="text-[10px] border-[#6B21A8]/20 text-[#6B21A8]">
              Phase: {currentPhase}
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Quick-tap tags for {studentName} — synced to Success Hub
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick-tap tags */}
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Positive</p>
          <div className="flex flex-wrap gap-1.5">
            {PEDAGOGICAL_TAGS.filter(t => t.category === 'positive').map(tag => {
              const Icon = tag.icon;
              return (
                <Button
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] gap-1 px-2"
                  style={{ borderColor: `${tag.color}30`, color: tag.color }}
                  onClick={() => addTag(tag)}
                >
                  <Icon className="h-3 w-3" />
                  {tag.label}
                </Button>
              );
            })}
          </div>

          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-2">Practice Layers</p>
          <div className="flex flex-wrap gap-1.5">
            {PEDAGOGICAL_TAGS.filter(t => t.category.startsWith('layer-')).map(tag => {
              const Icon = tag.icon;
              return (
                <Button
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] gap-1 px-2"
                  style={{ borderColor: `${tag.color}30`, color: tag.color }}
                  onClick={() => addTag(tag)}
                >
                  <Icon className="h-3 w-3" />
                  {tag.label}
                </Button>
              );
            })}
          </div>

          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-2">Corrections</p>
          <div className="flex flex-wrap gap-1.5">
            {PEDAGOGICAL_TAGS.filter(t => t.category === 'correction').map(tag => {
              const Icon = tag.icon;
              return (
                <Button
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] gap-1 px-2"
                  style={{ borderColor: `${tag.color}30`, color: tag.color }}
                  onClick={() => addTag(tag)}
                >
                  <Icon className="h-3 w-3" />
                  {tag.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Hint Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
          onClick={async () => {
            const channel = supabase.channel(`hint-${sessionId}`);
            await channel.subscribe();
            await channel.send({
              type: 'broadcast',
              event: 'grammar-hint',
              payload: { active: true, timestamp: new Date().toISOString() },
            });
            supabase.removeChannel(channel);
            toast.success('Hint sent — correct block is glowing on student screen');
          }}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          Send Grammar Hint
        </Button>

        {/* Free-form note */}
        <Textarea
          placeholder="Professional notes (e.g., 'Student confused /l/ with /r/, needs mirror practice')..."
          value={freeNote}
          onChange={e => setFreeNote(e.target.value)}
          className="text-xs min-h-[60px] resize-none"
        />

        {/* Observation log */}
        {observations.length > 0 && (
          <ScrollArea className="h-24">
            <div className="space-y-1">
              {observations.map((obs, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    {new Date(obs.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      obs.category === 'positive'
                        ? 'border-[#2E7D32]/20 text-[#2E7D32]'
                        : 'border-[#EF5350]/20 text-[#EF5350]'
                    }`}
                  >
                    {obs.label}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={saveObservations}
            disabled={saving || (observations.length === 0 && !freeNote)}
            className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white gap-1 flex-1"
          >
            <Send className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save to Profile'}
          </Button>
          {onRetryPhase && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetryPhase}
              className="border-[#EF5350]/30 text-[#EF5350] hover:bg-[#EF5350]/5 gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry Phase
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
