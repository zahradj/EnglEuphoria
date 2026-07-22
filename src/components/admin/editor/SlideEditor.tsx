import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Sparkles, Loader2, Image as ImageIcon, Volume2, Play } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Pip the Fox voice (Playground/kids) — matches the placement test.
const PIP_VOICE_ID = 'kPtEHAvRnjUJFv7SK9WI';
// Cartoon-friendly fallbacks per character key for variety in Playground.
const KIDS_CHARACTER_VOICES: Record<string, string> = {
  pip: 'kPtEHAvRnjUJFv7SK9WI',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  charlie: 'IKne3meq5aSn9XLyUdCD',
  daisy: 'XB0fDUnXU5powFXDhCwa',
};
import { LessonSlide } from './LessonEditorPage';

interface SlideEditorProps {
  slide: LessonSlide;
  onUpdate: (slide: LessonSlide) => void;
  system: string;
}

const SLIDE_TYPES = [
  { value: 'title', label: 'Title Slide' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'practice', label: 'Practice' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'dialogue', label: 'Dialogue' },
  { value: 'speaking', label: 'Speaking' },
  { value: 'game', label: 'Game' },
  { value: 'production', label: 'Production' },
  { value: 'summary', label: 'Summary' },
  { value: 'content', label: 'Content' },
];

export const SlideEditor: React.FC<SlideEditorProps> = ({ slide, onUpdate, system }) => {
  const isKids = system === 'kids';
  const defaultVoiceId = isKids ? PIP_VOICE_ID : undefined;
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const updateField = (field: string, value: any) => {
    onUpdate({ ...slide, [field]: value });
  };

  const updateContent = (key: string, value: any) => {
    onUpdate({
      ...slide,
      content: { ...slide.content, [key]: value },
    });
  };

  // ---- AI helpers (shared by vocab cards + content slides) ----
  const generateImage = async (keyword: string, key: string): Promise<string | null> => {
    if (!keyword?.trim()) { toast.error('Add a keyword first'); return null; }
    setBusyKey(key);
    try {
      const prompt = isKids
        ? `Flat 2D cartoon illustration of "${keyword}", bright colors, thick outlines, child-friendly, white background, no text`
        : `Flat 2D educational illustration of "${keyword}", clean vector style, professional, white background, no text`;
      const { data, error } = await supabase.functions.invoke('ai-image-generation', {
        body: { prompt, style: isKids ? 'cartoon' : 'educational' },
      });
      if (error) throw error;
      const url = (data as any)?.imageUrl || (data as any)?.url;
      if (!url) throw new Error('No image URL returned');
      toast.success('🎨 Image generated');
      return url;
    } catch (e: any) {
      toast.error(e?.message || 'Image generation failed');
      return null;
    } finally {
      setBusyKey(null);
    }
  };

  const generateAudio = async (text: string, key: string, voiceKey?: string): Promise<string | null> => {
    if (!text?.trim()) { toast.error('Add some text first'); return null; }
    setBusyKey(key);
    try {
      const voiceId = (voiceKey && KIDS_CHARACTER_VOICES[voiceKey]) || defaultVoiceId;
      const { data, error } = await supabase.functions.invoke('generate-elevenlabs-audio', {
        body: { text, voiceId },
      });
      if (error) throw error;
      const blob = data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      try { await new Audio(url).play(); } catch { /* noop */ }
      toast.success(isKids ? '🦊 Pip recorded it!' : '🔊 Audio generated');
      return url;
    } catch (e: any) {
      toast.error(e?.message || 'Audio generation failed');
      return null;
    } finally {
      setBusyKey(null);
    }
  };

  const renderVocabularyEditor = () => {
    const words = slide.content?.words || [];


    const addWord = () => {
      updateContent('words', [...words, { word: '', ipa: '', definition: '', example: '' }]);
    };

    const updateWord = (index: number, field: string, value: string) => {
      const newWords = [...words];
      newWords[index] = { ...newWords[index], [field]: value };
      updateContent('words', newWords);
    };

    const removeWord = (index: number) => {
      updateContent('words', words.filter((_: any, i: number) => i !== index));
    };

    const generateAllImages = async () => {
      const next = [...words];
      for (let i = 0; i < next.length; i++) {
        const w = next[i];
        if (w.imageUrl || !w.word) continue;
        const url = await generateImage(w.word, `bulk-img-${i}`);
        if (url) {
          next[i] = { ...next[i], imageUrl: url };
          updateContent('words', [...next]);
        }
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Vocabulary Words</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateAllImages}
              disabled={!!busyKey || words.length === 0}
              className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-300 text-violet-700"
            >
              {busyKey?.startsWith('bulk-img') ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4 mr-1" />
              )}
              Generate All Images
            </Button>
            <Button variant="outline" size="sm" onClick={addWord}>
              <Plus className="h-4 w-4 mr-1" /> Add Word
            </Button>
          </div>
        </div>
        {words.map((word: any, index: number) => (
          <Card key={index} className="relative">
            <CardContent className="pt-4 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Word</Label>
                <Input
                  value={word.word || ''}
                  onChange={(e) => updateWord(index, 'word', e.target.value)}
                  placeholder="e.g., beautiful"
                />
              </div>
              <div>
                <Label className="text-xs">IPA Pronunciation</Label>
                <Input
                  value={word.ipa || ''}
                  onChange={(e) => updateWord(index, 'ipa', e.target.value)}
                  placeholder="e.g., /ˈbjuːtɪfəl/"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Definition</Label>
                <Input
                  value={word.definition || ''}
                  onChange={(e) => updateWord(index, 'definition', e.target.value)}
                  placeholder="Definition..."
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Example Sentence</Label>
                <Input
                  value={word.example || ''}
                  onChange={(e) => updateWord(index, 'example', e.target.value)}
                  placeholder="Example sentence..."
                />
              </div>

              {/* AI media row */}
              <div className="col-span-2 flex flex-wrap items-center gap-2 border-t pt-3">
                {word.imageUrl ? (
                  <img
                    src={word.imageUrl}
                    alt={word.word}
                    className="h-12 w-12 rounded object-cover border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded border border-dashed flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busyKey === `img-${index}`}
                  onClick={async () => {
                    const url = await generateImage(word.word || word.example || '', `img-${index}`);
                    if (url) updateWord(index, 'imageUrl', url);
                  }}
                >
                  {busyKey === `img-${index}` ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3 w-3 mr-1" />
                  )}
                  {word.imageUrl ? 'Regenerate Image' : 'Generate Image'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busyKey === `aud-${index}`}
                  onClick={async () => {
                    const phrase = word.example || word.word || '';
                    const url = await generateAudio(phrase, `aud-${index}`);
                    if (url) updateWord(index, 'audioUrl', url);
                  }}
                  className={isKids ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300 text-orange-700' : ''}
                >
                  {busyKey === `aud-${index}` ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Volume2 className="h-3 w-3 mr-1" />
                  )}
                  {isKids ? '🦊 Pip Voice' : 'Generate Audio'}
                </Button>

                {word.audioUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { try { new Audio(word.audioUrl).play(); } catch { /* */ } }}
                  >
                    <Play className="h-3 w-3 mr-1" /> Preview
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeWord(index)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>

            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderGrammarEditor = () => (
    <div className="space-y-4">
      <div>
        <Label>Grammar Rule/Pattern</Label>
        <Input
          value={slide.content?.rule || ''}
          onChange={(e) => updateContent('rule', e.target.value)}
          placeholder="e.g., Present Perfect: have/has + past participle"
        />
      </div>
      <div>
        <Label>Explanation</Label>
        <Textarea
          value={slide.content?.explanation || ''}
          onChange={(e) => updateContent('explanation', e.target.value)}
          placeholder="Explain the grammar rule..."
          rows={3}
        />
      </div>
      <div>
        <Label>Examples (one per line)</Label>
        <Textarea
          value={slide.content?.examples?.join('\n') || ''}
          onChange={(e) => updateContent('examples', e.target.value.split('\n').filter(Boolean))}
          placeholder="I have eaten breakfast.&#10;She has finished her homework."
          rows={4}
        />
      </div>
      <div>
        <Label>Common Mistakes (one per line)</Label>
        <Textarea
          value={slide.content?.mistakes?.join('\n') || ''}
          onChange={(e) => updateContent('mistakes', e.target.value.split('\n').filter(Boolean))}
          placeholder="❌ I have eat → ✓ I have eaten"
          rows={3}
        />
      </div>
    </div>
  );

  const renderQuizEditor = () => {
    const questions = slide.content?.questions || [];

    const addQuestion = () => {
      updateContent('questions', [
        ...questions,
        { question: '', options: ['', '', '', ''], correctIndex: 0, xp: 10 },
      ]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
      const newQuestions = [...questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      updateContent('questions', newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
      const newQuestions = [...questions];
      newQuestions[qIndex].options[oIndex] = value;
      updateContent('questions', newQuestions);
    };

    const removeQuestion = (index: number) => {
      updateContent('questions', questions.filter((_: any, i: number) => i !== index));
    };

    const [aiBusy, setAiBusy] = React.useState(false);

    const generateWithAI = async () => {
      setAiBusy(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-quiz-questions', {
          body: {
            activityType: 'multiple_choice',
            count: 1,
            existing: questions,
            lessonContext: slide.title || '',
          },
        });
        if (error) throw error;
        const items = (data as any)?.items || [];
        if (!items.length) throw new Error('AI returned no items');
        const mapped = items.map((it: any) => ({
          question: it.question || '',
          options: Array.isArray(it.options) && it.options.length ? it.options : ['', '', '', ''],
          correctIndex: typeof it.correctIndex === 'number' ? it.correctIndex : 0,
          xp: 10,
        }));
        updateContent('questions', [...questions, ...mapped]);
        toast.success(`✨ Added ${mapped.length} AI question${mapped.length > 1 ? 's' : ''}`);
      } catch (e: any) {
        if (String(e?.message || '').includes('402')) toast.error('Out of AI credits — add more in Workspace → Usage.');
        else toast.error(e?.message || 'AI generation failed');
      } finally {
        setAiBusy(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-base font-semibold">Quiz Questions</Label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generateWithAI} disabled={aiBusy} className="bg-gradient-to-br from-fuchsia-50 to-orange-50 border-fuchsia-300 text-fuchsia-700 hover:from-fuchsia-100">
              {aiBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
              Add with AI
            </Button>
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-1" /> Add Question
            </Button>
          </div>
        </div>
        {questions.map((q: any, qIndex: number) => (
          <Card key={qIndex} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Question {qIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Question Text</Label>
                <Input
                  value={q.question || ''}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="Enter the question..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(q.options || ['', '', '', '']).map((opt: string, oIndex: number) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctIndex === oIndex}
                      onChange={() => updateQuestion(qIndex, 'correctIndex', oIndex)}
                      className="w-4 h-4"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className={q.correctIndex === oIndex ? 'border-green-500' : ''}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-xs">XP Reward</Label>
                  <Input
                    type="number"
                    value={q.xp || 10}
                    onChange={(e) => updateQuestion(qIndex, 'xp', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeQuestion(qIndex)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPracticeEditor = () => {
    const exercises = slide.content?.exercises || [];

    const addExercise = () => {
      updateContent('exercises', [
        ...exercises,
        { type: 'fill-in-blank', instruction: '', sentence: '', answer: '' },
      ]);
    };

    const updateExercise = (index: number, field: string, value: any) => {
      const newExercises = [...exercises];
      newExercises[index] = { ...newExercises[index], [field]: value };
      updateContent('exercises', newExercises);
    };

    const removeExercise = (index: number) => {
      updateContent('exercises', exercises.filter((_: any, i: number) => i !== index));
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Practice Exercises</Label>
          <Button variant="outline" size="sm" onClick={addExercise}>
            <Plus className="h-4 w-4 mr-1" /> Add Exercise
          </Button>
        </div>
        {exercises.map((ex: any, index: number) => (
          <Card key={index} className="relative">
            <CardContent className="pt-4 space-y-3">
              <div>
                <Label className="text-xs">Exercise Type</Label>
                <Select
                  value={ex.type || 'fill-in-blank'}
                  onValueChange={(v) => updateExercise(index, 'type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="matching">Matching</SelectItem>
                    <SelectItem value="reorder">Reorder Words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Instruction</Label>
                <Input
                  value={ex.instruction || ''}
                  onChange={(e) => updateExercise(index, 'instruction', e.target.value)}
                  placeholder="e.g., Fill in the blank with the correct word"
                />
              </div>
              <div>
                <Label className="text-xs">Sentence/Question</Label>
                <Input
                  value={ex.sentence || ''}
                  onChange={(e) => updateExercise(index, 'sentence', e.target.value)}
                  placeholder="e.g., I ___ (go) to school yesterday."
                />
              </div>
              <div>
                <Label className="text-xs">Answer</Label>
                <Input
                  value={ex.answer || ''}
                  onChange={(e) => updateExercise(index, 'answer', e.target.value)}
                  placeholder="e.g., went"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeExercise(index)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderContentEditor = () => (
    <div className="space-y-4">
      <div>
        <Label>Main Text Content</Label>
        <Textarea
          value={slide.content?.text || ''}
          onChange={(e) => updateContent('text', e.target.value)}
          placeholder="Enter the main content for this slide..."
          rows={6}
        />
      </div>
      <div>
        <Label>Speaker Notes (optional)</Label>
        <Textarea
          value={slide.content?.notes || ''}
          onChange={(e) => updateContent('notes', e.target.value)}
          placeholder="Notes for the teacher..."
          rows={3}
        />
      </div>
      <div>
        <Label>Image Keyword (for AI generation)</Label>
        <Input
          value={slide.content?.imageKeyword || ''}
          onChange={(e) => updateContent('imageKeyword', e.target.value)}
          placeholder="e.g., happy students learning"
        />
      </div>

      {/* Slide-level media generators */}
      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        {slide.content?.imageUrl ? (
          <img
            src={slide.content.imageUrl}
            alt={slide.title}
            className="h-16 w-16 rounded object-cover border"
          />
        ) : (
          <div className="h-16 w-16 rounded border border-dashed flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busyKey === 'slide-img'}
          onClick={async () => {
            const kw = slide.content?.imageKeyword || slide.title || slide.content?.text?.slice(0, 60) || '';
            const url = await generateImage(kw, 'slide-img');
            if (url) updateContent('imageUrl', url);
          }}
        >
          {busyKey === 'slide-img' ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <ImageIcon className="h-3 w-3 mr-1" />
          )}
          {slide.content?.imageUrl ? 'Regenerate Image' : 'Generate Image'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busyKey === 'slide-aud'}
          onClick={async () => {
            const text = slide.content?.text || slide.title || '';
            const url = await generateAudio(text, 'slide-aud');
            if (url) updateContent('audioUrl', url);
          }}
          className={isKids ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300 text-orange-700' : ''}
        >
          {busyKey === 'slide-aud' ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Volume2 className="h-3 w-3 mr-1" />
          )}
          {isKids ? '🦊 Generate Pip Voice' : 'Generate Audio'}
        </Button>
        {slide.content?.audioUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { try { new Audio(slide.content.audioUrl).play(); } catch { /* */ } }}
          >
            <Play className="h-3 w-3 mr-1" /> Preview
          </Button>
        )}
      </div>
    </div>
  );


  const renderTypeSpecificEditor = () => {
    switch (slide.slide_type) {
      case 'vocabulary':
        return renderVocabularyEditor();
      case 'grammar':
        return renderGrammarEditor();
      case 'quiz':
        return renderQuizEditor();
      case 'practice':
        return renderPracticeEditor();
      default:
        return renderContentEditor();
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Slide Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Slide Title</Label>
          <Input
            value={slide.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Enter slide title..."
          />
        </div>
        <div>
          <Label>Slide Type</Label>
          <Select
            value={slide.slide_type}
            onValueChange={(v) => updateField('slide_type', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLIDE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Type-Specific Content Editor */}
      <div className="border-t pt-6">
        {renderTypeSpecificEditor()}
      </div>
    </div>
  );
};
