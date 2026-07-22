// Lesson Content Validator - Ensures generated lessons are complete and classroom-ready

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalSlides: number;
    vocabularyWords: number;
    grammarExercises: number;
    interactiveActivities: number;
    missingFields: number;
  };
}

export function validateLessonContent(lessonData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    totalSlides: 0,
    vocabularyWords: 0,
    grammarExercises: 0,
    interactiveActivities: 0,
    missingFields: 0,
  };

  // Check basic structure
  if (!lessonData || typeof lessonData !== 'object') {
    errors.push('Invalid lesson data structure');
    return { isValid: false, errors, warnings, stats };
  }

  // Check required top-level fields
  const requiredFields = ['title', 'topic', 'cefr_level', 'slides'];
  for (const field of requiredFields) {
    if (!lessonData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate slides array
  if (!Array.isArray(lessonData.slides)) {
    errors.push('Slides must be an array');
    return { isValid: false, errors, warnings, stats };
  }

  stats.totalSlides = lessonData.slides.length;

  // Check slide count
  if (lessonData.slides.length < 15) {
    warnings.push(`Only ${lessonData.slides.length} slides generated (recommended: 22-25)`);
  }

  // Validate each slide
  lessonData.slides.forEach((slide: any, index: number) => {
    const slideNum = index + 1;

    // Check required slide fields
    if (!slide.id) {
      errors.push(`Slide ${slideNum}: Missing 'id' field`);
      stats.missingFields++;
    }
    if (!slide.type) {
      errors.push(`Slide ${slideNum}: Missing 'type' field`);
      stats.missingFields++;
    }
    if (!slide.prompt && !slide.title) {
      errors.push(`Slide ${slideNum}: Missing 'prompt' or 'title' field`);
      stats.missingFields++;
    }

    // Validate vocabulary slides
    if (slide.type === 'vocabulary_preview' || slide.type === 'vocabulary') {
      if (!slide.words || !Array.isArray(slide.words)) {
        errors.push(`Slide ${slideNum}: Vocabulary slide missing 'words' array`);
      } else {
        stats.vocabularyWords += slide.words.length;
        
        slide.words.forEach((word: any, wordIndex: number) => {
          // Check all required vocabulary fields
          if (!word.word) {
            errors.push(`Slide ${slideNum}, Word ${wordIndex + 1}: Missing 'word' field`);
            stats.missingFields++;
          }
          if (!word.pronunciation) {
            errors.push(`Slide ${slideNum}, Word ${wordIndex + 1}: Missing 'pronunciation' (IPA format)`);
            stats.missingFields++;
          }
          if (!word.partOfSpeech) {
            warnings.push(`Slide ${slideNum}, Word ${wordIndex + 1}: Missing 'partOfSpeech' field`);
            stats.missingFields++;
          }
          if (!word.definition) {
            errors.push(`Slide ${slideNum}, Word ${wordIndex + 1}: Missing 'definition' field`);
            stats.missingFields++;
          }
          if (!word.examples || !Array.isArray(word.examples) || word.examples.length < 2) {
            errors.push(`Slide ${slideNum}, Word ${wordIndex + 1}: Need at least 2 example sentences`);
            stats.missingFields++;
          }
          if (!word.imagePrompt) {
            errors.push(`Slide ${slideNum}, Word ${wordIndex + 1}: Missing 'imagePrompt' for image generation`);
            stats.missingFields++;
          } else if (word.imagePrompt.length < 20) {
            warnings.push(`Slide ${slideNum}, Word ${wordIndex + 1}: Image prompt too short (${word.imagePrompt.length} chars, minimum 20)`);
          }
          if (!word.relatedWords || word.relatedWords.length === 0) {
            warnings.push(`Slide ${slideNum}, Word ${wordIndex + 1}: Missing 'relatedWords' field`);
          }
        });
      }
    }

    // Validate grammar slides
    if (slide.type === 'grammar_focus' || slide.type === 'target_language') {
      if (!slide.pattern && !slide.rule) {
        errors.push(`Slide ${slideNum}: Grammar slide missing 'pattern' or 'rule'`);
        stats.missingFields++;
      }
      if (!slide.examples || !Array.isArray(slide.examples) || slide.examples.length < 3) {
        errors.push(`Slide ${slideNum}: Grammar slide needs at least 3 examples`);
        stats.missingFields++;
      }
      if (slide.exercises && Array.isArray(slide.exercises)) {
        stats.grammarExercises += slide.exercises.length;
        
        slide.exercises.forEach((exercise: any, exIndex: number) => {
          if (!exercise.type) {
            errors.push(`Slide ${slideNum}, Exercise ${exIndex + 1}: Missing 'type' field`);
            stats.missingFields++;
          }
          if (!exercise.correctAnswer && exercise.correctAnswer !== 0) {
            errors.push(`Slide ${slideNum}, Exercise ${exIndex + 1}: Missing 'correctAnswer'`);
            stats.missingFields++;
          }
          if (!exercise.feedback) {
            errors.push(`Slide ${slideNum}, Exercise ${exIndex + 1}: Missing 'feedback' message`);
            stats.missingFields++;
          }
        });
      } else {
        warnings.push(`Slide ${slideNum}: Grammar slide missing 'exercises' array`);
      }
    }

    // Validate interactive activity slides
    const interactiveTypes = [
      'drag_drop',
      'matching_pairs',
      'multiple_choice_quiz',
      'sentence_builder',
      'listen_and_choose',
      'accuracy_mcq',
      'picture_choice'
    ];
    
    if (interactiveTypes.includes(slide.type)) {
      stats.interactiveActivities++;
      
      if (!slide.activityType && slide.type !== 'accuracy_mcq') {
        warnings.push(`Slide ${slideNum}: Interactive slide missing 'activityType'`);
      }

      // Validate drag-drop activities
      if (slide.type === 'drag_drop') {
        if (!slide.items || !Array.isArray(slide.items)) {
          errors.push(`Slide ${slideNum}: Drag-drop activity missing 'items' array`);
          stats.missingFields++;
        }
        if (!slide.zones || !Array.isArray(slide.zones)) {
          errors.push(`Slide ${slideNum}: Drag-drop activity missing 'zones' array`);
          stats.missingFields++;
        }
      }

      // Validate matching pairs
      if (slide.type === 'matching_pairs') {
        if (!slide.pairs || !Array.isArray(slide.pairs)) {
          errors.push(`Slide ${slideNum}: Matching activity missing 'pairs' array`);
          stats.missingFields++;
        }
      }

      // Validate quizzes
      if (slide.type === 'multiple_choice_quiz' || slide.type === 'accuracy_mcq') {
        if (slide.questions) {
          slide.questions.forEach((q: any, qIndex: number) => {
            if (!q.options || q.options.length < 3) {
              errors.push(`Slide ${slideNum}, Question ${qIndex + 1}: Need at least 3 options`);
            }
            if (q.correctAnswer === undefined) {
              errors.push(`Slide ${slideNum}, Question ${qIndex + 1}: Missing 'correctAnswer'`);
            }
          });
        } else if (slide.options) {
          // Single question format
          if (slide.options.length < 3) {
            errors.push(`Slide ${slideNum}: Need at least 3 options`);
          }
          if (slide.correctAnswer === undefined && !slide.options.some((opt: any) => opt.correct)) {
            errors.push(`Slide ${slideNum}: Missing 'correctAnswer'`);
          }
        }
      }
    }

    // Check image prompts
    if (slide.media && slide.media.imagePrompt) {
      if (slide.media.imagePrompt.length < 20) {
        warnings.push(`Slide ${slideNum}: Image prompt too short (${slide.media.imagePrompt.length} chars, recommended: 25+)`);
      }
    }
  });

  // Final validation summary
  const isValid = errors.length === 0;

  if (warnings.length > 0) {
    console.warn(`Lesson validation completed with ${warnings.length} warnings`);
  }

  return {
    isValid,
    errors,
    warnings,
    stats,
  };
}

export function printValidationReport(result: ValidationResult): void {
  
  if (result.errors.length > 0) {
    console.error(`\n❌ ERRORS (${result.errors.length}):`);
    result.errors.forEach((error, i) => {
      console.error(`  ${i + 1}. ${error}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.warn(`\n⚠️  WARNINGS (${result.warnings.length}):`);
    result.warnings.forEach((warning, i) => {
      console.warn(`  ${i + 1}. ${warning}`);
    });
  }
  
}
