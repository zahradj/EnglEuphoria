import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Users, GraduationCap, Wand2, Loader2, Check, ArrowRight, Image, AlertTriangle, Save, Mic, MicOff, Zap, Video, Brain, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateTopicPackWithAI, buildPPPLessonFromPack } from './generatePPPLesson';
import { WizardFormData, PPPLessonPlan, GeneratedSlide, HubType } from './types';
import { Slide, CanvasElementData } from '../types';
import { HUB_CONFIGS, resolveHub } from './hubConfig';
import { generateLessonImages } from '@/services/lessonImageService';
import { saveToLibrary } from '@/services/lessonLibraryService';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { convertAISlidesToCanvasSlides, AISlideSchema } from '../utils/convertAISlideSchema';
import { handleAIResponse, showAIErrorToast } from '@/lib/aiErrorHandler';

/** Context injected from the curriculum selection to pre-fill the Wizard */
export interface WizardLessonContext {
  unitNumber?: number;
  lessonNumber?: number;
  cycleType?: string;
  phonicsTarget?: string;
  grammarTarget?: string;
  vocabularyList?: string[];
  skillsFocus?: string[];
  hintsDisabled?: boolean;
  highSupport?: boolean;
  topic?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  ageGroup?: 'kids' | 'teens' | 'adults';
  wizardScript?: string;
  // ─── Media Generation Hooks ─────────────────────────────────
  audioEngine?: 'elevenlabs' | 'none';
  videoEngine?: 'ai_video' | 'none';
  unitTheme?: string;
  shouldGenerateSong?: boolean;
  shouldGenerateAudio?: boolean;
}

interface AILessonWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLessonGenerated: (slides: Slide[], title: string, level: string, ageGroup: string, rawSlides?: GeneratedSlide[], hub?: HubType, homeworkPack?: import('@/coherence/types').HomeworkPack | null) => void;
  /** Pre-filled context from the selected curriculum lesson */
  lessonContext?: WizardLessonContext | null;
}

const generationSteps = [
  { id: 1, label: 'Sending prompt to AI...', icon: BookOpen },
  { id: 2, label: 'AI generating vocabulary & activities...', icon: GraduationCap },
  { id: 3, label: 'Building slide structure...', icon: Users },
  { id: 4, label: 'Generating media prompts...', icon: Sparkles },
  { id: 5, label: 'Finalizing lesson plan...', icon: Check },
];

export function AILessonWizard({ open, onOpenChange, onLessonGenerated, lessonContext }: AILessonWizardProps) {
  const [wizardMode, setWizardMode] = useState<'ppp' | 'magic'>('ppp');
  const [formData, setFormData] = useState<WizardFormData>({
    topic: '',
    level: 'beginner',
    ageGroup: 'kids',
  });
  const [lessonPrompt, setLessonPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<PPPLessonPlan | null>(null);
  const [magicDeckSlides, setMagicDeckSlides] = useState<Slide[] | null>(null);
  const [magicDeckTitle, setMagicDeckTitle] = useState('');
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageProgress, setImageProgress] = useState({ completed: 0, total: 0, current: '' });
  const [imageCount, setImageCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [activeListening, setActiveListening] = useState<'topic' | 'notes' | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Magic Deck form state
  const [magicGrammar, setMagicGrammar] = useState('');
  const [magicVocabulary, setMagicVocabulary] = useState('');
  const [magicAge, setMagicAge] = useState('');
  const [magicLessonPrompt, setMagicLessonPrompt] = useState('');

  // ─── Auto-Fill from Curriculum Context ──────────────────────
  React.useEffect(() => {
    if (!open || !lessonContext) return;

    // Pre-fill topic
    if (lessonContext.topic) {
      setFormData(prev => ({
        ...prev,
        topic: lessonContext.topic!,
        level: lessonContext.level || prev.level,
        ageGroup: lessonContext.ageGroup || prev.ageGroup,
      }));
    }

    // Build a rich lesson prompt from the injected DNA
    const parts: string[] = [];
    if (lessonContext.unitNumber != null && lessonContext.lessonNumber != null) {
      parts.push(`Unit ${lessonContext.unitNumber}, Lesson ${lessonContext.lessonNumber}.`);
    }
    if (lessonContext.cycleType) {
      parts.push(`Cycle type: ${lessonContext.cycleType}.`);
    }
    if (lessonContext.phonicsTarget) {
      parts.push(`Phonics focus: ${lessonContext.phonicsTarget}.`);
    }
    if (lessonContext.grammarTarget) {
      parts.push(`Grammar goal: ${lessonContext.grammarTarget}.`);
    }
    if (lessonContext.vocabularyList?.length) {
      parts.push(`Vocabulary: ${lessonContext.vocabularyList.join(', ')}.`);
    }
    if (lessonContext.skillsFocus?.length) {
      parts.push(`Skills: ${lessonContext.skillsFocus.join(', ')}.`);
    }
    if (lessonContext.hintsDisabled) {
      parts.push('QUIZ MODE: No hints, no scaffolding. Clinical assessment only. No ElevenLabs audio hints.');
    }
    if (lessonContext.highSupport) {
      parts.push('REVIEW MODE: High support. Wizard hints active. Review all vocabulary from previous lessons.');
    }
    if (lessonContext.wizardScript) {
      parts.push(lessonContext.wizardScript);
    }
    // Media engine directives
    if (lessonContext.audioEngine === 'elevenlabs') {
      parts.push('AUDIO ENGINE: ElevenLabs TTS will auto-generate phonics & vocabulary audio.');
    }
    if (lessonContext.shouldGenerateSong) {
      parts.push('SONG ENGINE: AI Music will generate a phonics song for this lesson.');
    }
    if (lessonContext.audioEngine === 'none') {
      parts.push('AUDIO DISABLED: Quiz mode — no audio hints will be generated.');
    }

    if (parts.length > 0) {
      setLessonPrompt(parts.join(' '));
      setMagicLessonPrompt(parts.join(' '));
    }

    // Auto-fill Magic Deck fields from curriculum context
    if (lessonContext.grammarTarget) setMagicGrammar(lessonContext.grammarTarget);
    if (lessonContext.vocabularyList?.length) setMagicVocabulary(lessonContext.vocabularyList.join(', '));
  }, [open, lessonContext]);

  const startListening = useCallback((target: 'topic' | 'notes') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Not supported', description: 'Speech recognition is not available in this browser.', variant: 'destructive' });
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (target === 'topic') {
        setFormData(prev => ({ ...prev, topic: prev.topic ? `${prev.topic} ${transcript}` : transcript }));
      } else {
        setLessonPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
      }
    };

    recognition.onend = () => {
      setActiveListening(null);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setActiveListening(null);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setActiveListening(target);
    recognition.start();
  }, [toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setActiveListening(null);
  }, []);

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return;

    setIsGenerating(true);
    setCurrentStep(0);

    try {
      // Step 1: Send to AI
      setCurrentStep(1);
      const hub = HUB_CONFIGS[resolveHub(formData.ageGroup)];

      // Step 2: AI generates content
      setCurrentStep(2);
      const topicPack = await generateTopicPackWithAI(
        formData.topic,
        lessonPrompt.trim() || undefined,
        formData.level,
        formData.ageGroup,
        hub
      );

      // Step 3: Build slides
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 4: Media prompts
      setCurrentStep(4);
      const plan = buildPPPLessonFromPack({ ...formData, lessonPrompt: lessonPrompt.trim() || undefined }, topicPack);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 5: Finalize
      setCurrentStep(5);
      setGeneratedPlan(plan);
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      console.error('Generation failed:', err);
      toast({
        title: 'Generation Failed',
        description: err instanceof Error ? err.message : 'Could not generate lesson content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Magic Deck Generation (Gemini multimedia slides) ──────
  const handleGenerateMagicDeck = async () => {
    if (!formData.topic.trim()) return;

    setIsGenerating(true);
    setCurrentStep(0);

    try {
      setCurrentStep(1);
      const hubMap: Record<string, string> = { kids: 'playground', teens: 'academy', adults: 'success' };
      const hub = hubMap[formData.ageGroup] || 'playground';
      // Map the wizard's CEFR-style level (e.g. "A1", "B2") straight through; fallback to hub default.
      const cefrFromForm = (formData as any).level && /^(A1|A2|B1|B2|C1)$/.test((formData as any).level)
        ? (formData as any).level
        : undefined;

      setCurrentStep(2);
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          hub,
          cefr_level: cefrFromForm,
          topic: formData.topic.trim(),
          targetGrammar: magicGrammar.trim() || undefined,
          targetVocabulary: magicVocabulary.trim() || undefined,
          studentAge: magicAge.trim() || undefined,
          lessonPrompt: magicLessonPrompt.trim() || undefined,
          mode: 'full_deck',
        },
      });

      if (!handleAIResponse({ data, error, onRetry: () => handleGenerateMagicDeck(), context: 'Magic Deck' })) {
        setIsGenerating(false);
        return;
      }

      setCurrentStep(3);
      const aiSlides: AISlideSchema[] = data?.slides || [];
      if (aiSlides.length === 0) {
        showAIErrorToast('AI returned no slides', () => handleGenerateMagicDeck(), 'Magic Deck');
        setIsGenerating(false);
        return;
      }

      setCurrentStep(4);
      const canvasSlides = convertAISlidesToCanvasSlides(aiSlides);
      const title = data?.lesson_title || formData.topic.trim();

      setCurrentStep(5);
      setMagicDeckSlides(canvasSlides);
      setMagicDeckTitle(title);

      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      console.error('Magic Deck generation failed:', err);
      toast({
        title: 'Generation Failed',
        description: err instanceof Error ? err.message : 'Could not generate Magic Deck.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyMagicDeck = () => {
    if (!magicDeckSlides) return;

    const levelMap: Record<string, string> = { beginner: 'A1', intermediate: 'B1', advanced: 'C1' };
    const ageGroupMap: Record<string, string> = { kids: '6-8', teens: '12-15', adults: '18+' };

    onLessonGenerated(
      magicDeckSlides,
      magicDeckTitle,
      levelMap[formData.level] || 'A1',
      ageGroupMap[formData.ageGroup] || '6-8',
    );

    resetState();
    onOpenChange(false);
  };

  const resetState = () => {
    setGeneratedPlan(null);
    setMagicDeckSlides(null);
    setMagicDeckTitle('');
    setFormData({ topic: '', level: 'beginner', ageGroup: 'kids' });
    setLessonPrompt('');
    setMagicGrammar('');
    setMagicVocabulary('');
    setMagicAge('');
    setMagicLessonPrompt('');
    setImageCount(0);
  };
  const handleGenerateImages = async () => {
    if (!generatedPlan) return;

    setIsGeneratingImages(true);
    setImageProgress({ completed: 0, total: 0, current: 'Starting...' });

    try {
      // Collect slides that have media prompts — include activities for AI images
      const slidesForImages = generatedPlan.slides
        .filter(s => s.mediaPrompt)
        .slice(0, 12); // Allow up to 12 images

      const imageMap = await generateLessonImages(
        slidesForImages.map(s => ({ id: s.id, mediaPrompt: s.mediaPrompt!, mediaType: s.mediaType })),
        (completed, total, current) => {
          setImageProgress({ completed, total, current });
        }
      );

      // Apply generated images back to the plan
      const updatedSlides = generatedPlan.slides.map(slide => {
        const aiImage = imageMap.get(slide.id);
        if (aiImage) {
          return { ...slide, imageUrl: aiImage };
        }
        return slide;
      });

      setGeneratedPlan({ ...generatedPlan, slides: updatedSlides });
      setImageCount(imageMap.size);

      toast({
        title: '🎨 Images Generated!',
        description: `${imageMap.size} AI images created for your lesson.`,
      });
    } catch (err) {
      console.error('Image generation failed:', err);
      toast({
        title: 'Image Generation Issue',
        description: 'Some images could not be generated. You can still use the lesson.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleApplyLesson = () => {
    if (!generatedPlan) return;

    const hubConfig = HUB_CONFIGS[generatedPlan.lessonMeta.hub];
    const colors = hubConfig.colorPalette;

    const editorSlides: Slide[] = generatedPlan.slides.map((gs, index) => {
      const els: CanvasElementData[] = [];
      let z = 1;

      const txt = (x: number, y: number, w: number, h: number, text: string, fontSize: number, color: string, bold = false, align: 'left' | 'center' = 'left'): CanvasElementData => ({
        id: uuidv4(), elementType: 'text', x, y, width: w, height: h, rotation: 0, zIndex: z++,
        content: { text, fontSize, bold, italic: false, align, color },
      });

      const shape = (x: number, y: number, w: number, h: number, fill: string, opacity = 0.5): CanvasElementData => ({
        id: uuidv4(), elementType: 'shape', x, y, width: w, height: h, rotation: 0, zIndex: z++,
        content: { shape: 'rounded', fill, opacity },
      });

      const pip = (x: number, y: number, anim = 'idle'): CanvasElementData => ({
        id: uuidv4(), elementType: 'character', x, y, width: 200, height: 240, rotation: 0, zIndex: z++,
        content: { name: 'pip', animation: anim, src: '/pip-mascot.png', speechBubble: '' },
      });

      const img = (x: number, y: number, w: number, h: number, src: string, alt: string): CanvasElementData => ({
        id: uuidv4(), elementType: 'image', x, y, width: w, height: h, rotation: 0, zIndex: z++,
        content: { src, alt },
      });

      const slideTypeColors: Record<string, string> = {
        hook: '#ef4444', warmup: '#f59e0b', vocabulary: colors.accent,
        core_concept: colors.primary, dialogue: '#0891b2', activity: '#059669',
        game: '#dc2626', speaking: '#d946ef', creative: '#ec4899',
        summary: '#0284c7', review: '#0284c7', goodbye: '#f97316',
      };
      const badgeColor = slideTypeColors[gs.slideType] || colors.primary;
      els.push(shape(40, 30, 300, 42, badgeColor, 0.9));
      els.push(txt(55, 36, 280, 32, gs.phaseLabel, 16, '#ffffff', true));

      els.push(shape(1600, 30, 260, 36, colors.primary, 0.7));
      els.push(txt(1615, 35, 230, 28, `${hubConfig.emoji} ${hubConfig.label}`, 13, '#ffffff', true));

      els.push(txt(120, 90, 1680, 70, gs.title, hubConfig.hub === 'professional' ? 36 : 42, colors.text, true, 'center'));

      if (gs.imageUrl && gs.type !== 'matching') {
        els.push(img(1200, 200, 600, 400, gs.imageUrl, gs.imageKeywords || gs.title));
      }

      switch (gs.type) {
        case 'title': {
          if (gs.content?.prompt) {
            els.push(shape(120, 200, 1000, 400, colors.highlight, 0.5));
            const lines = gs.content.prompt.split('\n').filter(Boolean);
            lines.forEach((line: string, i: number) => {
              els.push(txt(160, 220 + i * 48, 920, 44, line, hubConfig.hub === 'professional' ? 20 : 24, colors.text));
            });
          }
          if (hubConfig.mascot) els.push(pip(1500, 620, 'wave'));
          break;
        }
        case 'vocabulary': {
          els.push(shape(100, 180, 1000, 500, colors.highlight, 0.4));
          els.push(txt(140, 200, 920, 80, gs.content?.word || '', 72, colors.primary, true, 'center'));
          els.push(txt(140, 310, 920, 50, gs.content?.definition || '', 26, colors.text, false, 'center'));
          if (gs.content?.sentence) {
            els.push(shape(200, 400, 800, 60, colors.secondary + '33', 0.4));
            els.push(txt(220, 408, 760, 50, `"${gs.content.sentence}"`, 22, colors.accent, false, 'center'));
          }
          els.push(shape(140, 490, 200, 30, colors.secondary, 0.3));
          els.push(txt(150, 494, 180, 24, `📷 ${gs.mediaType}`, 12, colors.text));
          if (hubConfig.mascot) els.push(pip(140, 550, 'jump'));
          break;
        }
        case 'fill-blank': {
          els.push(shape(100, 200, 1000, 300, colors.highlight, 0.5));
          els.push(txt(160, 220, 880, 40, 'Complete the sentence:', 22, colors.primary, true));
          els.push(txt(160, 290, 880, 60, gs.content?.sentence || '', 36, colors.text, true, 'center'));
          els.push(shape(160, 380, 880, 50, colors.secondary + '33', 0.6));
          els.push(txt(180, 388, 840, 40, `Answer: ${gs.content?.blankWord || ''}`, 20, colors.accent));
          if (gs.activityType) {
            els.push(shape(160, 450, 200, 30, colors.primary, 0.3));
            els.push(txt(170, 454, 180, 24, `🎯 ${gs.activityType}`, 12, '#ffffff'));
          }
          break;
        }
        case 'drag-drop': {
          els.push(shape(100, 180, 1720, 580, colors.highlight, 0.3));
          els.push(txt(160, 200, 600, 40, '🎯 Drag each word to its match!', 24, colors.primary, true));
          const items = gs.content?.dragItems || [];
          items.forEach((item: any, i: number) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            els.push(shape(160 + col * 450, 280 + row * 140, 180, 50, colors.primary, 0.7));
            els.push(txt(170 + col * 450, 290 + row * 140, 160, 40, item.text, 22, '#ffffff', true, 'center'));
            els.push(shape(370 + col * 450, 280 + row * 140, 220, 50, colors.secondary + '33', 0.5));
            els.push(txt(380 + col * 450, 290 + row * 140, 200, 40, item.target, 16, colors.text, false, 'center'));
          });
          if (hubConfig.mascot) els.push(pip(1550, 620, 'bounce'));
          break;
        }
        case 'matching': {
          els.push(shape(100, 180, 1720, 580, colors.highlight, 0.3));
          els.push(txt(160, 200, 400, 40, hubConfig.hub === 'playground' ? 'Match the pictures! 🎨' : 'Match the terms!', 22, colors.primary, true));
          const pairs = gs.content?.matchPairs || [];
          pairs.forEach((p: any, i: number) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            els.push(shape(160 + col * 450, 280 + row * 200, 400, 160, colors.highlight, 0.7));
            els.push(txt(180 + col * 450, 300 + row * 200, 360, 50, p.word, 28, colors.primary, true, 'center'));
            if (p.image) {
              els.push(img(1060 + col * 350, 280 + row * 200, 300, 160, p.image, p.word));
            }
          });
          if (hubConfig.mascot) els.push(pip(1550, 620, 'jump'));
          break;
        }
        case 'roleplay': {
          els.push(shape(100, 200, 1000, 480, colors.highlight, 0.4));
          if (gs.content?.prompt) {
            const lines = gs.content.prompt.split('\n').filter(Boolean);
            lines.forEach((line: string, i: number) => {
              const isDialogue = line.includes(':');
              els.push(txt(160, 230 + i * 42, 920, 40, line, isDialogue ? 22 : 20, isDialogue ? colors.text : colors.accent, isDialogue));
            });
          }
          if (gs.content?.caseStudy) {
            els.push(shape(120, 550, 960, 80, colors.secondary + '22', 0.5));
            els.push(txt(140, 558, 920, 60, `📋 ${gs.content.caseStudy}`, 16, colors.text));
          }
          if (hubConfig.mascot) els.push(pip(1500, 550, 'wave'));
          break;
        }
        case 'quiz': {
          els.push(shape(100, 200, 1000, 500, colors.highlight, 0.5));
          els.push(txt(160, 220, 880, 50, gs.content?.quizQuestion || '', 28, colors.primary, true));
          const opts = gs.content?.quizOptions || [];
          const optColors = [colors.highlight, colors.secondary + '33', colors.primary + '22', colors.accent + '22'];
          opts.forEach((opt: any, i: number) => {
            els.push(shape(180, 300 + i * 80, 860, 65, optColors[i % 4], 0.6));
            els.push(txt(220, 312 + i * 80, 780, 45, `${String.fromCharCode(65 + i)}. ${opt.text}`, 22, colors.text, false));
          });
          break;
        }
        default: {
          if (gs.content?.prompt) {
            els.push(shape(100, 200, 1000, 400, colors.highlight, 0.4));
            const lines = gs.content.prompt.split('\n').filter(Boolean);
            lines.forEach((line: string, i: number) => {
              els.push(txt(160, 230 + i * 42, 920, 40, line, 22, colors.text));
            });
          }
          if (hubConfig.mascot) els.push(pip(1500, 600, 'idle'));
          break;
        }
      }

      if (gs.animation && gs.animation !== 'none') {
        els.push(shape(1640, 750, 200, 28, colors.secondary, 0.3));
        els.push(txt(1650, 753, 180, 24, `✨ ${gs.animation}`, 11, colors.text));
      }

      const editorSlide: Slide = {
        id: gs.id,
        order: index,
        type: gs.type === 'quiz' ? 'quiz' : 'image',
        imageUrl: gs.imageUrl,
        title: gs.title,
        teacherNotes: gs.teacherNotes,
        keywords: gs.keywords,
        canvasElements: els,
      };

      if (gs.type === 'quiz' && gs.content?.quizQuestion) {
        editorSlide.quizQuestion = gs.content.quizQuestion;
        editorSlide.quizOptions = gs.content.quizOptions?.map((opt: any) => ({
          id: uuidv4(), text: opt.text, isCorrect: opt.isCorrect,
        }));
      }

      return editorSlide;
    });

    const levelMap: Record<string, string> = { beginner: 'A1', intermediate: 'B1', advanced: 'C1' };
    const ageGroupMap: Record<string, string> = { kids: '6-8', teens: '12-15', adults: '18+' };

    onLessonGenerated(
      editorSlides,
      generatedPlan.lessonMeta.title,
      levelMap[formData.level] || 'A1',
      ageGroupMap[formData.ageGroup] || '6-8',
      generatedPlan.slides,
      generatedPlan.lessonMeta.hub
    );

    setGeneratedPlan(null);
    setFormData({ topic: '', level: 'beginner', ageGroup: 'kids' });
    setLessonPrompt('');
    setImageCount(0);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isGenerating && !isGeneratingImages) {
      resetState();
      onOpenChange(false);
    }
  };

  const currentHub = HUB_CONFIGS[resolveHub(formData.ageGroup)];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            AI Lesson Wizard
          </DialogTitle>
          <DialogDescription>
            Generate a hub-adaptive PPP lesson with AI-generated images and interactive slides.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!isGenerating && !generatedPlan && !magicDeckSlides && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              {/* ─── Mode Tabs ─── */}
              <Tabs value={wizardMode} onValueChange={(v) => setWizardMode(v as 'ppp' | 'magic')} className="w-full">
                <TabsList className="w-full grid grid-cols-2 h-10">
                  <TabsTrigger value="ppp" className="text-xs gap-1.5">
                    <Wand2 className="h-3.5 w-3.5" /> PPP Wizard
                  </TabsTrigger>
                  <TabsTrigger value="magic" className="text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> ✨ Magic Deck
                  </TabsTrigger>
                </TabsList>

                {/* ─── SHARED: Context Banner ─── */}
                {lessonContext && lessonContext.unitNumber != null && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1 mt-3">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Context Loaded — Unit {lessonContext.unitNumber}, Lesson {lessonContext.lessonNumber}
                      {lessonContext.cycleType && <span className="ml-1 text-muted-foreground">({lessonContext.cycleType})</span>}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lessonContext.phonicsTarget && (
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">🔤 {lessonContext.phonicsTarget}</span>
                      )}
                      {lessonContext.grammarTarget && (
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">📐 {lessonContext.grammarTarget}</span>
                      )}
                      {lessonContext.hintsDisabled && (
                        <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">🧪 Quiz Mode</span>
                      )}
                      {lessonContext.highSupport && (
                        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">🛡️ Review Mode</span>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── SHARED: Topic + Level + Hub ─── */}
                <div className="space-y-3 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-medium">Lesson Topic</Label>
                    <div className="relative">
                      <Input
                        id="topic"
                        placeholder="e.g., Hello Pip, Zoo Animals, Business Negotiations"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="h-12 text-base pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute right-1 top-1 h-10 w-10 rounded-lg transition-colors ${activeListening === 'topic' ? 'bg-destructive/10 text-destructive animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={() => activeListening === 'topic' ? stopListening() : startListening('topic')}
                      >
                        {activeListening === 'topic' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Student Level</Label>
                      <Select value={formData.level} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setFormData({ ...formData, level: value })}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner"><div className="flex items-center gap-2"><span className="text-green-500">●</span> Beginner (A1-A2)</div></SelectItem>
                          <SelectItem value="intermediate"><div className="flex items-center gap-2"><span className="text-yellow-500">●</span> Intermediate (B1-B2)</div></SelectItem>
                          <SelectItem value="advanced"><div className="flex items-center gap-2"><span className="text-red-500">●</span> Advanced (C1-C2)</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Target Hub</Label>
                      <Select value={formData.ageGroup} onValueChange={(value: 'kids' | 'teens' | 'adults') => setFormData({ ...formData, ageGroup: value })}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select hub" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kids">🛝 Playground — Kids</SelectItem>
                          <SelectItem value="teens">🏫 Academy — Teens</SelectItem>
                          <SelectItem value="adults">🏢 Professional — Adults</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* ─── PPP WIZARD TAB ─── */}
                <TabsContent value="ppp" className="space-y-4 mt-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Lesson Prompt <span className="text-muted-foreground font-normal">(describe what the lesson should teach)</span></Label>
                    <div className="relative">
                      <Textarea
                        placeholder="e.g., Teach students how to order food at a restaurant..."
                        value={lessonPrompt}
                        onChange={(e) => setLessonPrompt(e.target.value)}
                        className="min-h-[100px] text-sm resize-none pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute right-1 top-1 h-8 w-8 rounded-lg transition-colors ${activeListening === 'notes' ? 'bg-destructive/10 text-destructive animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={() => activeListening === 'notes' ? stopListening() : startListening('notes')}
                      >
                        {activeListening === 'notes' ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {/* Hub Preview Card */}
                  <div className="rounded-xl border p-4 text-sm" style={{ 
                    borderColor: currentHub.colorPalette.primary + '44',
                    background: currentHub.colorPalette.highlight + '33',
                  }}>
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      {currentHub.emoji} {currentHub.label}
                    </div>
                    <p className="text-muted-foreground text-xs mb-3">{currentHub.tone}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-background/80 border">📷 {currentHub.mediaType}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-background/80 border">✨ {currentHub.defaultAnimation}</span>
                      {currentHub.permittedActivities.slice(0, 2).map(a => (
                        <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-background/80 border">🎯 {a.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!formData.topic.trim()}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    ✨ Generate {currentHub.label} Lesson
                  </Button>
                </TabsContent>

                {/* ─── MAGIC DECK TAB ─── */}
                <TabsContent value="magic" className="space-y-4 mt-3">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">✨ Magic Deck</strong> generates a complete multimedia slide deck with video songs, vocabulary images, grammar presentations, and interactive activities — all powered by Gemini AI.
                    </p>
                  </div>

                  {formData.ageGroup === 'kids' && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
                      <span className="text-base leading-none">🛝</span>
                      <p className="text-xs text-foreground">
                        <strong>Playground reminder:</strong> Students are <strong>4 to 9 years old</strong>. Use ultra-simple language, lots of visuals, songs, and short sentences. Avoid abstract grammar terminology.
                      </p>
                    </div>
                  )}

                  {/* Lesson Prompt — auto-filled from curriculum context, just like PPP */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      Lesson Prompt
                      {magicLessonPrompt && lessonContext && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">
                          AUTO-FILLED
                        </span>
                      )}
                    </Label>
                    <Textarea
                      placeholder="Describe the lesson context, objectives, scaffolding, or any specific instructions for the AI..."
                      value={magicLessonPrompt}
                      onChange={(e) => setMagicLessonPrompt(e.target.value)}
                      className="min-h-[90px] text-sm resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Auto-filled from the selected curriculum lesson — edit freely to steer the AI.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Grammar Focus <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      placeholder="e.g., Present Perfect, Comparatives"
                      value={magicGrammar}
                      onChange={(e) => setMagicGrammar(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vocabulary Focus <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      placeholder="e.g., travel, airport, luggage, boarding pass"
                      value={magicVocabulary}
                      onChange={(e) => setMagicVocabulary(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Student Age / Level <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      placeholder={formData.ageGroup === 'kids' ? 'e.g., 6 years old, A1 level' : 'e.g., 14 years old, B1 level'}
                      value={magicAge}
                      onChange={(e) => setMagicAge(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateMagicDeck}
                    disabled={!formData.topic.trim()}
                    className="w-full h-14 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                    }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    ✨ Generate Magic Deck
                  </Button>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8"
            >
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4"
                >
                  <Wand2 className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold">Creating {currentHub.label} Lesson</h3>
                <p className="text-sm text-muted-foreground">Topic: {formData.topic}</p>
              </div>

              <div className="space-y-3">
                {generationSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isComplete = currentStep > step.id;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive ? 'bg-purple-100 dark:bg-purple-900/30'
                          : isComplete ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        isActive ? 'bg-purple-500 text-white'
                          : isComplete ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isActive ? <Loader2 className="h-4 w-4 animate-spin" />
                          : isComplete ? <Check className="h-4 w-4" />
                          : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={`text-sm ${
                        isActive ? 'text-purple-700 dark:text-purple-300 font-medium'
                          : isComplete ? 'text-green-700 dark:text-green-300'
                          : 'text-muted-foreground'
                      }`}>{step.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Image Generation Progress */}
          {isGeneratingImages && (
            <motion.div
              key="images"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8"
            >
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4"
                >
                  <Image className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold">Generating AI Images</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {imageProgress.completed} / {imageProgress.total} images
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${imageProgress.total > 0 ? (imageProgress.completed / imageProgress.total) * 100 : 0}%` }}
                  transition={{ type: 'spring', stiffness: 30 }}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center truncate px-4">
                {imageProgress.current}
              </p>
            </motion.div>
          )}

          {generatedPlan && !isGenerating && !isGeneratingImages && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4"
                >
                  <Check className="h-8 w-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Lesson Generated!</h3>
                <p className="text-muted-foreground">
                  {generatedPlan.slides.length} slides for "{generatedPlan.topic}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {HUB_CONFIGS[generatedPlan.lessonMeta.hub].emoji} {generatedPlan.lessonMeta.hub.toUpperCase()} • {generatedPlan.lessonMeta.level} • {generatedPlan.lessonMeta.estimatedMinutes} min
                </p>
              </div>

              {/* Slide preview strip */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
                {generatedPlan.slides.slice(0, 8).map((slide, i) => (
                  <div key={slide.id} className="shrink-0 w-20 rounded-lg overflow-hidden border bg-muted/30">
                    {slide.imageUrl && !slide.imageUrl.includes('picsum') ? (
                      <img src={slide.imageUrl} alt="" className="w-full h-12 object-cover" />
                    ) : (
                      <div className="w-full h-12 flex items-center justify-center text-lg bg-muted/50">
                        {slide.slideType === 'hook' ? '🎬' : slide.slideType === 'vocabulary' ? '📝' : slide.slideType === 'activity' ? '🎮' : '📋'}
                      </div>
                    )}
                    <div className="px-1.5 py-1 text-[9px] text-muted-foreground truncate">
                      {slide.phaseLabel}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium mb-3">Lesson Structure:</h4>
                <div className="space-y-2 text-sm">
                  {['presentation', 'practice', 'production'].map((phase) => {
                    const phaseSlides = generatedPlan.slides.filter(s => s.phase === phase);
                    const emoji = phase === 'presentation' ? '📖' : phase === 'practice' ? '✏️' : '🎤';
                    return (
                      <div key={phase} className="flex items-center justify-between">
                        <span className="capitalize text-muted-foreground">{emoji} {phase}</span>
                        <span className="font-medium">{phaseSlides.length} slides</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Images Section */}
              <div className="rounded-lg border border-dashed p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">AI-Generated Images</span>
                  </div>
                  {imageCount > 0 && (
                    <span className="text-xs text-green-600 font-medium">{imageCount} generated ✓</span>
                  )}
                </div>
                {imageCount === 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Generate Professional Flat 2.0 vector illustrations — clean, 2D, no 3D effects.
                    </p>
                   <Button
                      onClick={handleGenerateImages}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Generate Flat 2.0 Vectors
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    ✨ {imageCount} contextual illustrations added to your slides.
                  </p>
                )}
              </div>

              <div className="bg-muted/30 rounded-lg p-3 mb-6 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Media type:</span>
                  <span>📷 {HUB_CONFIGS[generatedPlan.lessonMeta.hub].mediaType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Animation:</span>
                  <span>✨ {HUB_CONFIGS[generatedPlan.lessonMeta.hub].defaultAnimation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Activities:</span>
                  <span>{HUB_CONFIGS[generatedPlan.lessonMeta.hub].permittedActivities.map(a => a.replace(/_/g, ' ')).join(', ')}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    if (!generatedPlan) return;
                    setIsSaving(true);
                    try {
                      const thumbnail = generatedPlan.slides.find(s => s.imageUrl)?.imageUrl || undefined;
                      await saveToLibrary(
                        generatedPlan.topic,
                        generatedPlan.lessonMeta.hub,
                        generatedPlan.lessonMeta.level,
                        generatedPlan.slides,
                        thumbnail
                      );
                      toast({ title: '📚 Saved to Library!', description: 'Lesson is now available in the Library Hub.' });
                    } catch (err) {
                      console.error(err);
                      toast({ title: 'Save Failed', description: 'Could not save to library.', variant: 'destructive' });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save to Library
                </Button>
                <Button
                  onClick={handleApplyLesson}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Open in Editor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Magic Deck Success View ─── */}
          {magicDeckSlides && !isGenerating && (
            <motion.div
              key="magic-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="inline-flex p-4 rounded-full bg-primary/10 mb-4"
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">✨ Magic Deck Ready!</h3>
                <p className="text-muted-foreground">
                  {magicDeckSlides.length} multimedia slides for "{magicDeckTitle}"
                </p>
              </div>

              {/* Slide preview strip */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
                {magicDeckSlides.map((slide, i) => (
                  <div key={slide.id} className="shrink-0 w-20 rounded-lg overflow-hidden border bg-muted/30">
                    <div className="w-full h-12 flex items-center justify-center text-lg bg-muted/50">
                      {slide.type === 'video' ? '📺' : slide.type === 'quiz' ? '🎮' : '📋'}
                    </div>
                    <div className="px-1.5 py-1 text-[9px] text-muted-foreground truncate">
                      {slide.title || `Slide ${i + 1}`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium mb-3">Slide Types:</h4>
                <div className="space-y-1.5 text-sm">
                  {['video', 'image', 'quiz'].map(type => {
                    const count = magicDeckSlides.filter(s => s.type === type).length;
                    if (count === 0) return null;
                    const emoji = type === 'video' ? '📺' : type === 'quiz' ? '🎮' : '🖼️';
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-muted-foreground capitalize">{emoji} {type}</span>
                        <span className="font-medium">{count} slides</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mb-4">
                Videos, images, and activities are auto-embedded. You can edit everything in the canvas.
              </p>

              <Button
                onClick={handleApplyMagicDeck}
                className="w-full h-12"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
              >
                Open in Editor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
