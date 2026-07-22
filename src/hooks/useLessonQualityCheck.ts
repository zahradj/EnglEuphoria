import { useMemo } from 'react';

export interface QualityIssue {
  slideIndex: number;
  slideTitle?: string;
  slideType: string;
  severity: 'error' | 'warning' | 'info';
  category: 'content' | 'ipa' | 'quiz' | 'structure' | 'accessibility';
  message: string;
  field?: string;
}

export interface QualityReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: QualityIssue[];
  summary: {
    totalSlides: number;
    slidesWithIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  breakdown: {
    content: number;
    ipa: number;
    quiz: number;
    structure: number;
    accessibility: number;
  };
}

interface LessonSlide {
  id?: string;
  type?: string;
  screenType?: string;
  title?: string;
  content?: any;
  phase?: string;
  teacherNotes?: string;
}

function getSlideType(slide: LessonSlide): string {
  return slide.type || slide.screenType || 'unknown';
}

function checkVocabularySlide(slide: LessonSlide, index: number): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const words = slide.content?.words || [];

  if (words.length === 0) {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'error',
      category: 'content',
      message: 'Vocabulary slide has no words defined',
    });
    return issues;
  }

  words.forEach((word: any, wordIdx: number) => {
    if (!word.word || word.word.trim() === '') {
      issues.push({
        slideIndex: index,
        slideTitle: slide.title,
        slideType: getSlideType(slide),
        severity: 'error',
        category: 'content',
        message: `Word ${wordIdx + 1} is missing the word text`,
        field: `words[${wordIdx}].word`,
      });
    }

    if (!word.ipa || word.ipa.trim() === '') {
      issues.push({
        slideIndex: index,
        slideTitle: slide.title,
        slideType: getSlideType(slide),
        severity: 'warning',
        category: 'ipa',
        message: `"${word.word || `Word ${wordIdx + 1}`}" is missing IPA transcription`,
        field: `words[${wordIdx}].ipa`,
      });
    }

    if (!word.definition || word.definition.trim() === '') {
      issues.push({
        slideIndex: index,
        slideTitle: slide.title,
        slideType: getSlideType(slide),
        severity: 'warning',
        category: 'content',
        message: `"${word.word || `Word ${wordIdx + 1}`}" is missing definition`,
        field: `words[${wordIdx}].definition`,
      });
    }

    if (!word.example || word.example.trim() === '') {
      issues.push({
        slideIndex: index,
        slideTitle: slide.title,
        slideType: getSlideType(slide),
        severity: 'info',
        category: 'content',
        message: `"${word.word || `Word ${wordIdx + 1}`}" is missing example sentence`,
        field: `words[${wordIdx}].example`,
      });
    }
  });

  return issues;
}

function checkQuizSlide(slide: LessonSlide, index: number): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const options = slide.content?.options || [];
  const question = slide.content?.question;

  if (!question || question.trim() === '') {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'error',
      category: 'quiz',
      message: 'Quiz slide is missing the question',
      field: 'question',
    });
  }

  if (options.length === 0) {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'error',
      category: 'quiz',
      message: 'Quiz has no answer options',
      field: 'options',
    });
    return issues;
  }

  if (options.length < 2) {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'error',
      category: 'quiz',
      message: 'Quiz needs at least 2 answer options',
      field: 'options',
    });
  }

  const correctOptions = options.filter((opt: any) => opt.isCorrect === true);
  if (correctOptions.length === 0) {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'error',
      category: 'quiz',
      message: 'Quiz has no correct answer marked',
      field: 'options',
    });
  }

  if (correctOptions.length > 1) {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'warning',
      category: 'quiz',
      message: 'Quiz has multiple correct answers marked (ensure this is intentional)',
      field: 'options',
    });
  }

  options.forEach((opt: any, optIdx: number) => {
    if (!opt.text || opt.text.trim() === '') {
      issues.push({
        slideIndex: index,
        slideTitle: slide.title,
        slideType: getSlideType(slide),
        severity: 'error',
        category: 'quiz',
        message: `Option ${optIdx + 1} is missing text`,
        field: `options[${optIdx}].text`,
      });
    }
  });

  return issues;
}

function checkGrammarSlide(slide: LessonSlide, index: number): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (!slide.content?.rule && !slide.content?.explanation) {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'error',
      category: 'content',
      message: 'Grammar slide is missing rule or explanation',
    });
  }

  if (!slide.content?.examples || slide.content.examples.length === 0) {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'warning',
      category: 'content',
      message: 'Grammar slide has no examples',
    });
  }

  return issues;
}

function checkDialogueSlide(slide: LessonSlide, index: number): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lines = slide.content?.lines || [];

  if (lines.length === 0) {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'error',
      category: 'content',
      message: 'Dialogue slide has no dialogue lines',
    });
    return issues;
  }

  lines.forEach((line: any, lineIdx: number) => {
    if (!line.speaker) {
      issues.push({
        slideIndex: index,
        slideTitle: slide.title,
        slideType: getSlideType(slide),
        severity: 'warning',
        category: 'content',
        message: `Dialogue line ${lineIdx + 1} is missing speaker name`,
        field: `lines[${lineIdx}].speaker`,
      });
    }
    if (!line.text) {
      issues.push({
        slideIndex: index,
        slideTitle: slide.title,
        slideType: getSlideType(slide),
        severity: 'error',
        category: 'content',
        message: `Dialogue line ${lineIdx + 1} is missing text`,
        field: `lines[${lineIdx}].text`,
      });
    }
  });

  return issues;
}

function checkGeneralSlide(slide: LessonSlide, index: number): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (!slide.title || slide.title.trim() === '') {
    issues.push({
      slideIndex: index,
      slideTitle: slide.title,
      slideType: getSlideType(slide),
      severity: 'info',
      category: 'accessibility',
      message: 'Slide is missing a title',
    });
  }

  return issues;
}

function checkStructure(slides: LessonSlide[]): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (slides.length === 0) {
    issues.push({
      slideIndex: -1,
      slideType: 'lesson',
      severity: 'error',
      category: 'structure',
      message: 'Lesson has no slides',
    });
    return issues;
  }

  if (slides.length < 5) {
    issues.push({
      slideIndex: -1,
      slideType: 'lesson',
      severity: 'warning',
      category: 'structure',
      message: `Lesson only has ${slides.length} slides (recommended: 10-25)`,
    });
  }

  const slideTypes = slides.map(s => getSlideType(s).toLowerCase());
  
  const hasIntro = slideTypes.some(t => 
    ['title', 'warmup', 'introduction'].includes(t)
  );
  if (!hasIntro) {
    issues.push({
      slideIndex: -1,
      slideType: 'lesson',
      severity: 'warning',
      category: 'structure',
      message: 'Lesson is missing a title/introduction slide',
    });
  }

  const hasSummary = slideTypes.some(t => 
    ['summary', 'conclusion', 'review'].includes(t)
  );
  if (!hasSummary) {
    issues.push({
      slideIndex: -1,
      slideType: 'lesson',
      severity: 'info',
      category: 'structure',
      message: 'Lesson is missing a summary/conclusion slide',
    });
  }

  const hasQuiz = slideTypes.some(t => 
    ['quiz', 'assessment', 'question'].includes(t)
  );
  if (!hasQuiz) {
    issues.push({
      slideIndex: -1,
      slideType: 'lesson',
      severity: 'info',
      category: 'structure',
      message: 'Lesson has no quiz or assessment slides',
    });
  }

  return issues;
}

export function useLessonQualityCheck(slides: LessonSlide[]): QualityReport {
  return useMemo(() => {
    const issues: QualityIssue[] = [];

    // Check overall structure
    issues.push(...checkStructure(slides));

    // Check each slide
    slides.forEach((slide, index) => {
      const type = getSlideType(slide).toLowerCase();

      // General checks for all slides
      issues.push(...checkGeneralSlide(slide, index));

      // Type-specific checks
      if (type === 'vocabulary') {
        issues.push(...checkVocabularySlide(slide, index));
      } else if (['quiz', 'assessment', 'question'].includes(type)) {
        issues.push(...checkQuizSlide(slide, index));
      } else if (type === 'grammar' || type === 'grammar_focus') {
        issues.push(...checkGrammarSlide(slide, index));
      } else if (type === 'dialogue') {
        issues.push(...checkDialogueSlide(slide, index));
      }
    });

    // Calculate summary
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    const slidesWithIssues = new Set(
      issues.filter(i => i.slideIndex >= 0).map(i => i.slideIndex)
    ).size;

    // Calculate category breakdown
    const breakdown = {
      content: issues.filter(i => i.category === 'content').length,
      ipa: issues.filter(i => i.category === 'ipa').length,
      quiz: issues.filter(i => i.category === 'quiz').length,
      structure: issues.filter(i => i.category === 'structure').length,
      accessibility: issues.filter(i => i.category === 'accessibility').length,
    };

    // Calculate score (100 - deductions)
    const deductions = (errorCount * 10) + (warningCount * 3) + (infoCount * 1);
    const rawScore = Math.max(0, 100 - deductions);
    const score = Math.round(rawScore);

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      score,
      grade,
      issues,
      summary: {
        totalSlides: slides.length,
        slidesWithIssues,
        errorCount,
        warningCount,
        infoCount,
      },
      breakdown,
    };
  }, [slides]);
}
