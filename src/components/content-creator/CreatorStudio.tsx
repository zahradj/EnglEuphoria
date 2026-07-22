import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreatorStudioPreview } from './CreatorStudioPreview';
import { CreatorStudioAITools } from './CreatorStudioAITools';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Save, Send, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';

const TRACKS = [
  { value: 'kids', label: 'Playground', emoji: '🎮' },
  { value: 'teens', label: 'Academy', emoji: '🎓' },
  { value: 'adults', label: 'Professional', emoji: '💼' },
] as const;

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export const CreatorStudio: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [track, setTrack] = useState<string>('teens');
  const [level, setLevel] = useState<string>('B1');
  const [saving, setSaving] = useState(false);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Enter a topic to generate a lesson');
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('studio-ai-copilot', {
        body: { mode: 'generate', track, level, topic },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setTitle(data.title || topic);
      setContent(data.content || '');
      toast.success('Lesson generated! Review and edit below.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate lesson');
    } finally {
      setGenerating(false);
    }
  };

  const handleSetContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleSetCoverImage = useCallback((url: string) => {
    setCoverImageUrl(url);
  }, []);

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        content: { markdown: content } as any,
        target_system: track,
        difficulty_level: level,
        is_published: publish,
        created_by: user?.id,
        ai_metadata: {
          coverImageUrl,
          generatedFrom: topic || null,
        } as any,
        language: 'en',
      };

      const { error } = await supabase.from('curriculum_lessons').insert(payload);
      if (error) throw error;

      toast.success(publish ? 'Lesson published!' : 'Draft saved!');
      setTitle('');
      setContent('');
      setTopic('');
      setCoverImageUrl(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* AI Generation Bar */}
      <div className={cn(
        'flex items-center gap-3 p-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-opacity duration-300',
        focusMode && 'opacity-30 hover:opacity-100'
      )}>
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        <Input
          placeholder="Enter a topic (e.g., Business Negotiations, Past Tense Adventures)…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !generating && handleGenerate()}
          className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm"
        />
        <Button
          onClick={handleGenerate}
          disabled={generating || !topic.trim()}
          size="sm"
          className="shrink-0 gap-2"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate Lesson
        </Button>
      </div>

      {/* Split screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* LEFT: Editor */}
        <div className="flex flex-col gap-4 overflow-auto">
          <div className={cn(
            'flex items-center gap-3 transition-opacity duration-300',
            focusMode && 'opacity-30 hover:opacity-100'
          )}>
            <Input
              placeholder="Lesson Title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold h-12 bg-card border-border flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFocusMode(!focusMode)}
              className="shrink-0"
              title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            >
              {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {/* Track pills + Level */}
          <div className={cn(
            'flex items-center gap-3 transition-opacity duration-300',
            focusMode && 'opacity-30 hover:opacity-100'
          )}>
            <div className="flex gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTrack(t.value)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                    track === t.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-transparent hover:bg-accent'
                  )}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-28 bg-card">
                <SelectValue placeholder="CEFR" />
              </SelectTrigger>
              <SelectContent>
                {CEFR_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Markdown editor */}
          <Textarea
            placeholder="Write your lesson content in Markdown…&#10;&#10;# Introduction&#10;Welcome to this lesson on…&#10;&#10;## Key Vocabulary&#10;- **word** — definition&#10;&#10;## Practice&#10;1. Exercise one…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={cn(
              'flex-1 min-h-[300px] resize-none bg-card border-border font-mono text-sm leading-relaxed transition-all duration-300',
              focusMode && 'bg-background shadow-xl border-primary/20 ring-1 ring-primary/10'
            )}
          />
        </div>

        {/* RIGHT: Live Preview */}
        <div className={cn(
          'relative min-h-0 transition-opacity duration-300',
          focusMode && 'opacity-40 hover:opacity-100'
        )}>
          <CreatorStudioPreview
            title={title}
            content={content}
            track={track}
            level={level}
            coverImageUrl={coverImageUrl}
          />

          {/* Floating AI Magic Wand */}
          <div className="absolute bottom-4 right-4">
            <CreatorStudioAITools
              content={content}
              level={level}
              track={track}
              title={title}
              onContentChange={handleSetContent}
              onCoverImageChange={handleSetCoverImage}
            />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className={cn(
        'flex items-center justify-end gap-3 pt-2 border-t border-border transition-opacity duration-300',
        focusMode && 'opacity-30 hover:opacity-100'
      )}>
        <Button
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Draft
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Publish
        </Button>
      </div>
    </div>
  );
};
