import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { BulkLessonItem } from "@/hooks/useBulkGenerator";
import { SlidePreviewCarousel, LessonSlide } from "./SlidePreviewCarousel";
import { LessonValidationReport } from "@/components/admin/generator/LessonValidationReport";

interface BulkLessonPreviewProps {
  lesson: BulkLessonItem | null;
  onSave: () => void;
  isSaving?: boolean;
}

export const BulkLessonPreview = ({ lesson, onSave, isSaving }: BulkLessonPreviewProps) => {
  if (!lesson) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground py-12">
          <p>Select a generated lesson from the queue to preview</p>
        </CardContent>
      </Card>
    );
  }

  if (lesson.status === 'pending') {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground py-12">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Lesson pending generation</p>
        </CardContent>
      </Card>
    );
  }

  if (lesson.status === 'generating') {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating lesson...</p>
          <p className="text-lg font-medium mt-2">{lesson.topic}</p>
        </CardContent>
      </Card>
    );
  }

  if (lesson.status === 'failed') {
    return (
      <Card className="h-full flex items-center justify-center border-red-200">
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600 font-medium">Generation Failed</p>
          <p className="text-sm text-muted-foreground mt-2">{lesson.error}</p>
          {lesson.retryCount > 0 && (
            <Badge variant="outline" className="mt-2">
              Retry {lesson.retryCount}/2
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!lesson.generatedLesson) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground py-12">
          <p>No lesson content available</p>
        </CardContent>
      </Card>
    );
  }

  // Extract slides from the generated lesson
  const extractSlides = (): LessonSlide[] => {
    const data = lesson.generatedLesson;
    
    // If slides array exists directly
    if (data.slides && Array.isArray(data.slides)) {
      return data.slides;
    }

    // Build slides from PPP structure
    const slides: LessonSlide[] = [];

    // Title slide
    if (data.title) {
      slides.push({
        id: 'title-1',
        type: 'title',
        title: data.title,
        phase: 'presentation',
        phaseLabel: 'Introduction',
        content: {
          welcomeMessage: data.presentation?.introScreen?.welcomeMessage,
          objectives: data.presentation?.introScreen?.objectives,
          warmupQuestion: data.presentation?.introScreen?.warmUp,
        },
        teacherNotes: data.presentation?.introScreen?.teacherNotes || '',
        durationSeconds: 120,
      });
    }

    // Vocabulary slides from presentation
    if (data.presentation?.vocabularyScreens) {
      data.presentation.vocabularyScreens.forEach((vocab: any, idx: number) => {
        slides.push({
          id: `vocab-${idx + 1}`,
          type: 'vocabulary',
          title: `Vocabulary: ${vocab.word}`,
          phase: 'presentation',
          phaseLabel: 'Presentation',
          content: {
            word: vocab.word,
            ipa: vocab.ipa,
            definition: vocab.definition,
            exampleSentence: vocab.exampleSentence,
            imageKeyword: vocab.imageKeyword,
          },
          imageUrl: vocab.imageUrl,
          teacherNotes: vocab.teacherNotes || '',
          durationSeconds: 60,
        });
      });
    }

    // Grammar slides
    if (data.presentation?.grammarScreens) {
      data.presentation.grammarScreens.forEach((grammar: any, idx: number) => {
        slides.push({
          id: `grammar-${idx + 1}`,
          type: 'grammar',
          title: grammar.title || `Grammar Point ${idx + 1}`,
          phase: 'presentation',
          phaseLabel: 'Presentation',
          content: {
            rule: grammar.rule,
            pattern: grammar.pattern,
            examples: grammar.examples,
            commonMistakes: grammar.commonMistakes,
          },
          teacherNotes: grammar.teacherNotes || '',
          durationSeconds: 120,
        });
      });
    }

    // Practice activities
    if (data.practice?.activities) {
      data.practice.activities.forEach((activity: any, idx: number) => {
        const type = activity.type === 'quiz' ? 'quiz' 
          : activity.type === 'game' ? 'game' 
          : activity.type === 'dialogue' ? 'dialogue'
          : 'practice';

        slides.push({
          id: `practice-${idx + 1}`,
          type,
          title: activity.title || `Practice ${idx + 1}`,
          phase: 'practice',
          phaseLabel: 'Practice',
          content: {
            exercises: activity.exercises,
            dialogue: activity.dialogue,
            gameType: activity.gameType,
            instructions: activity.instructions,
            items: activity.items,
            quizQuestion: activity.question,
            quizOptions: activity.options,
          },
          teacherNotes: activity.teacherNotes || '',
          durationSeconds: activity.durationSeconds || 180,
        });
      });
    }

    // Production activities
    if (data.production?.activities) {
      data.production.activities.forEach((activity: any, idx: number) => {
        slides.push({
          id: `production-${idx + 1}`,
          type: activity.type === 'speaking' ? 'speaking' : 'production',
          title: activity.title || `Production ${idx + 1}`,
          phase: 'production',
          phaseLabel: 'Production',
          content: {
            scenario: activity.scenario,
            prompt: activity.prompt,
            targetOutput: activity.targetOutput,
            sentenceStarters: activity.sentenceStarters,
            peerReviewInstructions: activity.peerReview,
          },
          teacherNotes: activity.teacherNotes || '',
          durationSeconds: activity.durationSeconds || 180,
        });
      });
    }

    // Summary slide
    if (data.production?.summary || data.summary) {
      const summary = data.production?.summary || data.summary;
      slides.push({
        id: 'summary-1',
        type: 'summary',
        title: 'Lesson Summary',
        phase: 'production',
        phaseLabel: 'Wrap-up',
        content: {
          keyVocabulary: summary.keyVocabulary,
          grammarReminder: summary.grammarReminder,
          homework: summary.homework,
        },
        teacherNotes: summary.teacherNotes || '',
        durationSeconds: 120,
      });
    }

    return slides;
  };

  const slides = extractSlides();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {lesson.generatedLesson.title || lesson.topic}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{lesson.levelName || lesson.level}</Badge>
              <Badge variant="outline">{lesson.cefrLevel}</Badge>
              <Badge variant="outline">{lesson.durationMinutes}min</Badge>
              {lesson.status === 'saved' && (
                <Badge className="bg-purple-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
            </CardDescription>
          </div>
          {lesson.status === 'completed' && (
            <Button onClick={onSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Lesson'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
        {/* Validation Report */}
        {lesson.validation && (
          <div className="shrink-0">
            <LessonValidationReport 
              result={lesson.validation} 
            />
          </div>
        )}

        {/* Slide Preview */}
        {slides.length > 0 ? (
          <div className="flex-1 overflow-auto">
            <SlidePreviewCarousel slides={slides} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>No slides available for preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
