import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Sparkles, Save, Pencil, Eye, Loader2, Video, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { handleAIResponse, showAIErrorToast } from '@/lib/aiErrorHandler';

type HubType = 'playground' | 'academy' | 'success';
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

const HUB_DEFAULT_CEFR: Record<HubType, CEFRLevel> = {
  playground: 'A1',
  academy: 'B1',
  success: 'C1',
};

interface LessonData {
  lesson_title?: string;
  target_grammar?: string;
  target_vocabulary?: string;
  video_url?: string;
  video_search_title?: string;
  warm_up?: string;
  presentation?: string;
  practice?: string;
  production?: string;
  homework?: string;
  teacher_notes?: string;
}

const HUB_CONFIG: Record<HubType, { label: string; color: string; bg: string; border: string; targetSystem: string; difficulty: string; duration: number }> = {
  playground: { label: 'Playground Hub', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', targetSystem: 'playground', difficulty: 'beginner', duration: 30 },
  academy: { label: 'Academy Hub', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', targetSystem: 'teens', difficulty: 'intermediate', duration: 60 },
  success: { label: 'Success Hub', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', targetSystem: 'adults', difficulty: 'advanced', duration: 60 },
};

export const AILessonArchitect: React.FC = () => {
  const { user } = useAuth();
  const userRole = (user as any)?.role;
  const [hub, setHub] = useState<HubType | ''>('');
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel | ''>('');
  const [topic, setTopic] = useState('');
  const [targetGrammar, setTargetGrammar] = useState('');
  const [targetVocabulary, setTargetVocabulary] = useState('');
  const [lessonPlan, setLessonPlan] = useState('');
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Only admin and content_creator can access AI lesson generation
  if (userRole !== 'admin' && userRole !== 'content_creator') {
    return null;
  }

  const handleGenerate = async () => {
    if (!hub || !topic.trim()) {
      toast.error('Please select a hub and enter a topic');
      return;
    }

    setIsGenerating(true);
    setLessonPlan('');
    setLessonData(null);
    setVideoUrl('');
    setIsEditing(false);

    try {
      const resolvedCefr = cefrLevel || HUB_DEFAULT_CEFR[hub as HubType];
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: { hub, topic, targetGrammar, targetVocabulary, cefr_level: resolvedCefr },
      });

      if (!handleAIResponse({ data, error, onRetry: handleGenerate, context: 'Lesson Architect' })) {
        setIsGenerating(false);
        return;
      }

      setLessonPlan(data.lessonPlan);

      if (data.lessonData) {
        setLessonData(data.lessonData);
        setVideoUrl(data.lessonData.video_url || '');
      }

      toast.success('Lesson plan generated with video & scaffolding!');
    } catch (err: any) {
      console.error('Generation error:', err);
      showAIErrorToast(err?.message || 'Failed to generate lesson plan', handleGenerate, 'Lesson Architect');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!hub || !lessonPlan || !user) return;

    const config = HUB_CONFIG[hub as HubType];
    setIsSaving(true);

    try {
      const contentPayload: Record<string, unknown> = {
        markdown: lessonPlan,
        generatedAt: new Date().toISOString(),
        hub,
        targetGrammar,
        targetVocabulary,
      };

      if (lessonData) {
        contentPayload.structuredData = lessonData;
      }

      const insertData: Record<string, unknown> = {
        title: lessonData?.lesson_title || `AI: ${topic.trim()}`,
        content: contentPayload,
        target_system: config.targetSystem,
        difficulty_level: config.difficulty,
        duration_minutes: config.duration,
        created_by: user.id,
        is_published: false,
        skills_focus: targetGrammar ? [targetGrammar] : [],
        video_url: videoUrl || null,
      };

      const { error } = await supabase.from('curriculum_lessons').insert(insertData as any);

      if (error) throw error;
      toast.success('Saved to Curriculum Library with video URL!');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save lesson');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          AI Lesson Architect
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate PPP-structured lesson plans with video songs, scaffolding &amp; minute-by-minute breakdowns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Hub Selection</label>
            <Select value={hub} onValueChange={(v) => setHub(v as HubType)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Choose a hub..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HUB_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <span className={cfg.color}>{cfg.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({cfg.duration} min)</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              CEFR Level
              {hub && !cefrLevel && (
                <span className="text-xs text-muted-foreground ml-2">
                  (default: {HUB_DEFAULT_CEFR[hub as HubType]})
                </span>
              )}
            </label>
            <Select value={cefrLevel} onValueChange={(v) => setCefrLevel(v as CEFRLevel)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Auto from hub, or pick a level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1 — Absolute Beginner (max 5-word sentences)</SelectItem>
                <SelectItem value="A2">A2 — Elementary (daily routines, simple past)</SelectItem>
                <SelectItem value="B1">B1 — Intermediate (opinions, conditionals)</SelectItem>
                <SelectItem value="B2">B2 — Upper-Intermediate (debates, abstracts)</SelectItem>
                <SelectItem value="C1">C1 — Advanced (idioms, nuance, register)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Lesson Topic *</label>
            <Input
              placeholder="e.g. School Supplies, Job Interview Prep..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={500}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Target Grammar / Structure</label>
            <Input
              placeholder="e.g. Present Perfect, Conditionals..."
              value={targetGrammar}
              onChange={(e) => setTargetGrammar(e.target.value)}
              maxLength={500}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Target Vocabulary</label>
            <Input
              placeholder="e.g. Office items, Travel phrases..."
              value={targetVocabulary}
              onChange={(e) => setTargetVocabulary(e.target.value)}
              maxLength={500}
              className="bg-background/50"
            />
          </div>

          {/* Video URL field - auto-populated by AI */}
          {videoUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Video className="h-4 w-4 text-red-400" />
                AI-Suggested Video URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="bg-background/50 flex-1"
                  placeholder="YouTube video URL..."
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(videoUrl, '_blank')}
                  title="Test video link"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              {lessonData?.video_search_title && (
                <p className="text-xs text-muted-foreground">
                  🔍 Search: "{lessonData.video_search_title}"
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !hub || !topic.trim()}
            className={`w-full h-12 text-base font-semibold relative overflow-hidden ${
              isGenerating
                ? 'animate-pulse bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%]'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
            } text-white border-0`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Lesson Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Lesson Plan
              </>
            )}
          </Button>
        </div>

        {/* Right: Output */}
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 flex flex-col min-h-[400px]">
          {!lessonPlan && !isGenerating ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Your AI-generated lesson plan will appear here.
            </div>
          ) : isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <Sparkles className="h-10 w-10 text-amber-400 animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                Crafting your PPP lesson plan with scaffolding &amp; video songs...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Generated Plan</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="gap-1"
                  >
                    {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save to Library
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto rounded-lg border border-border/30 bg-background/40 p-4">
                {isEditing ? (
                  <Textarea
                    value={lessonPlan}
                    onChange={(e) => setLessonPlan(e.target.value)}
                    className="min-h-[350px] h-full w-full resize-none border-0 bg-transparent focus-visible:ring-0 font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{lessonPlan}</ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
