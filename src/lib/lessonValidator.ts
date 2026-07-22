/**
 * Lesson Validation System
 * Validates AI-generated lesson content for completeness before saving
 */

// ===================== Types =====================

export interface ValidationError {
  code: string;
  field: string;
  message: string;
  severity: 'critical' | 'error';
  slideIndex?: number;
}

export interface ValidationWarning {
  code: string;
  field: string;
  message: string;
  slideIndex?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 completeness score
  slideCount: number;
  expectedSlideCount: number;
  phaseCoverage: {
    presentation: number;
    practice: number;
    production: number;
  };
}

export interface SlideData {
  id?: string;
  type?: string;
  title?: string;
  phase?: string;
  content?: any;
  teacherNotes?: string;
  vocabulary?: VocabularyItem[];
  grammar?: GrammarData;
  durationSeconds?: number;
}

export interface VocabularyItem {
  word?: string;
  ipa?: string;
  definition?: string;
  example?: string;
}

export interface GrammarData {
  rule?: string;
  pattern?: string;
  examples?: string[];
}

// ===================== Constants =====================

const MIN_SLIDES_BY_DURATION: Record<number, number> = {
  30: 15,
  45: 25,
  60: 35,
  90: 50,
};

const REQUIRED_SLIDE_FIELDS = ['id', 'type', 'title', 'phase', 'content'];
const PPP_PHASES = ['presentation', 'practice', 'production'];

// IPA validation pattern - allows broad /.../ or narrow [...] transcription
const IPA_PATTERN = /^\/[^\/]+\/$|^\[[^\]]+\]$/;

// Common IPA characters for basic validation
const COMMON_IPA_CHARS = /[æɑɒʌəɪʊeɛɔuiːˈˌŋθðʃʒtʃdʒ]/;

// ===================== Validation Functions =====================

/**
 * Validates IPA transcription format
 */
export function validateIPA(ipa: string | undefined | null): boolean {
  if (!ipa || typeof ipa !== 'string') return false;
  
  const trimmed = ipa.trim();
  
  // Check if wrapped in slashes or brackets
  if (!IPA_PATTERN.test(trimmed)) {
    // Also accept IPA without wrappers if it contains IPA characters
    return COMMON_IPA_CHARS.test(trimmed);
  }
  
  // Check that content exists between wrappers
  const inner = trimmed.slice(1, -1);
  return inner.length > 0;
}

/**
 * Validates a single vocabulary item
 */
export function validateVocabularyItem(
  item: VocabularyItem,
  slideIndex?: number
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const fieldPrefix = slideIndex !== undefined ? `slide[${slideIndex}].vocabulary` : 'vocabulary';

  if (!item.word?.trim()) {
    errors.push({
      code: 'VOCAB_MISSING_WORD',
      field: `${fieldPrefix}.word`,
      message: 'Vocabulary word is missing',
      severity: 'error',
      slideIndex,
    });
  }

  if (!item.ipa) {
    errors.push({
      code: 'VOCAB_MISSING_IPA',
      field: `${fieldPrefix}.ipa`,
      message: `IPA transcription missing for "${item.word || 'unknown'}"`,
      severity: 'error',
      slideIndex,
    });
  } else if (!validateIPA(item.ipa)) {
    errors.push({
      code: 'VOCAB_INVALID_IPA',
      field: `${fieldPrefix}.ipa`,
      message: `Invalid IPA format: "${item.ipa}" for word "${item.word || 'unknown'}"`,
      severity: 'error',
      slideIndex,
    });
  }

  if (!item.definition?.trim()) {
    warnings.push({
      code: 'VOCAB_MISSING_DEFINITION',
      field: `${fieldPrefix}.definition`,
      message: `Definition missing for "${item.word || 'unknown'}"`,
      slideIndex,
    });
  }

  if (!item.example?.trim()) {
    warnings.push({
      code: 'VOCAB_MISSING_EXAMPLE',
      field: `${fieldPrefix}.example`,
      message: `Example sentence missing for "${item.word || 'unknown'}"`,
      slideIndex,
    });
  }

  return { errors, warnings };
}

/**
 * Validates grammar data
 */
export function validateGrammar(
  grammar: GrammarData | undefined,
  slideIndex?: number
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const fieldPrefix = slideIndex !== undefined ? `slide[${slideIndex}].grammar` : 'grammar';

  if (!grammar) {
    return { errors, warnings };
  }

  if (!grammar.rule?.trim()) {
    warnings.push({
      code: 'GRAMMAR_MISSING_RULE',
      field: `${fieldPrefix}.rule`,
      message: 'Grammar rule explanation is missing',
      slideIndex,
    });
  }

  if (!grammar.pattern?.trim()) {
    warnings.push({
      code: 'GRAMMAR_MISSING_PATTERN',
      field: `${fieldPrefix}.pattern`,
      message: 'Grammar pattern is missing',
      slideIndex,
    });
  }

  if (!grammar.examples || grammar.examples.length === 0) {
    warnings.push({
      code: 'GRAMMAR_MISSING_EXAMPLES',
      field: `${fieldPrefix}.examples`,
      message: 'Grammar examples are missing',
      slideIndex,
    });
  }

  return { errors, warnings };
}

/**
 * Validates a single slide
 */
export function validateSlide(
  slide: SlideData,
  index: number
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  for (const field of REQUIRED_SLIDE_FIELDS) {
    const value = slide[field as keyof SlideData];
    if (value === undefined || value === null || value === '') {
      if (field === 'id' || field === 'type') {
        errors.push({
          code: `SLIDE_MISSING_${field.toUpperCase()}`,
          field: `slide[${index}].${field}`,
          message: `Slide ${index + 1} is missing required field: ${field}`,
          severity: 'critical',
          slideIndex: index,
        });
      } else {
        errors.push({
          code: `SLIDE_MISSING_${field.toUpperCase()}`,
          field: `slide[${index}].${field}`,
          message: `Slide ${index + 1} is missing: ${field}`,
          severity: 'error',
          slideIndex: index,
        });
      }
    }
  }

  // Validate phase
  if (slide.phase && !PPP_PHASES.includes(slide.phase.toLowerCase())) {
    warnings.push({
      code: 'SLIDE_INVALID_PHASE',
      field: `slide[${index}].phase`,
      message: `Slide ${index + 1} has invalid phase: "${slide.phase}"`,
      slideIndex: index,
    });
  }

  // Check teacher notes
  if (!slide.teacherNotes?.trim()) {
    warnings.push({
      code: 'SLIDE_MISSING_TEACHER_NOTES',
      field: `slide[${index}].teacherNotes`,
      message: `Slide ${index + 1} is missing teacher notes`,
      slideIndex: index,
    });
  }

  // Validate vocabulary items in slide
  if (slide.vocabulary && Array.isArray(slide.vocabulary)) {
    for (const vocabItem of slide.vocabulary) {
      const vocabValidation = validateVocabularyItem(vocabItem, index);
      errors.push(...vocabValidation.errors);
      warnings.push(...vocabValidation.warnings);
    }
  }

  // Also check vocabulary in content object
  if (slide.content?.vocabulary && Array.isArray(slide.content.vocabulary)) {
    for (const vocabItem of slide.content.vocabulary) {
      const vocabValidation = validateVocabularyItem(vocabItem, index);
      errors.push(...vocabValidation.errors);
      warnings.push(...vocabValidation.warnings);
    }
  }

  // Validate grammar
  if (slide.grammar) {
    const grammarValidation = validateGrammar(slide.grammar, index);
    errors.push(...grammarValidation.errors);
    warnings.push(...grammarValidation.warnings);
  }

  if (slide.content?.grammar) {
    const grammarValidation = validateGrammar(slide.content.grammar, index);
    errors.push(...grammarValidation.errors);
    warnings.push(...grammarValidation.warnings);
  }

  return { errors, warnings };
}

/**
 * Calculates PPP phase coverage from slides
 */
function calculatePhaseCoverage(slides: SlideData[]): {
  presentation: number;
  practice: number;
  production: number;
} {
  const phaseCounts = { presentation: 0, practice: 0, production: 0 };
  
  for (const slide of slides) {
    const phase = slide.phase?.toLowerCase();
    if (phase && phase in phaseCounts) {
      phaseCounts[phase as keyof typeof phaseCounts]++;
    }
  }

  const total = slides.length || 1;
  return {
    presentation: Math.round((phaseCounts.presentation / total) * 100),
    practice: Math.round((phaseCounts.practice / total) * 100),
    production: Math.round((phaseCounts.production / total) * 100),
  };
}

/**
 * Main validation function for a complete lesson
 */
export function validateLesson(
  lessonData: any,
  durationMinutes: number = 60
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const slides: SlideData[] = lessonData?.slides || [];
  const slideCount = slides.length;
  const expectedSlideCount = MIN_SLIDES_BY_DURATION[durationMinutes] || MIN_SLIDES_BY_DURATION[60];

  // Check slide count
  if (slideCount === 0) {
    errors.push({
      code: 'NO_SLIDES',
      field: 'slides',
      message: 'Lesson has no slides',
      severity: 'critical',
    });
  } else if (slideCount < expectedSlideCount) {
    errors.push({
      code: 'INSUFFICIENT_SLIDES',
      field: 'slides',
      message: `Expected at least ${expectedSlideCount} slides for ${durationMinutes}-minute lesson, got ${slideCount}`,
      severity: 'error',
    });
  }

  // Validate each slide
  for (let i = 0; i < slides.length; i++) {
    const slideValidation = validateSlide(slides[i], i);
    errors.push(...slideValidation.errors);
    warnings.push(...slideValidation.warnings);
  }

  // Check PPP phase coverage
  const phaseCoverage = calculatePhaseCoverage(slides);
  
  if (phaseCoverage.presentation === 0 && slideCount > 0) {
    errors.push({
      code: 'MISSING_PRESENTATION_PHASE',
      field: 'slides.phase',
      message: 'No slides found for Presentation phase',
      severity: 'error',
    });
  }
  
  if (phaseCoverage.practice === 0 && slideCount > 0) {
    errors.push({
      code: 'MISSING_PRACTICE_PHASE',
      field: 'slides.phase',
      message: 'No slides found for Practice phase',
      severity: 'error',
    });
  }
  
  if (phaseCoverage.production === 0 && slideCount > 0) {
    errors.push({
      code: 'MISSING_PRODUCTION_PHASE',
      field: 'slides.phase',
      message: 'No slides found for Production phase',
      severity: 'error',
    });
  }

  // Check lesson-level fields
  if (!lessonData?.title?.trim()) {
    errors.push({
      code: 'MISSING_TITLE',
      field: 'title',
      message: 'Lesson title is missing',
      severity: 'critical',
    });
  }

  if (!lessonData?.objectives || lessonData.objectives.length === 0) {
    warnings.push({
      code: 'MISSING_OBJECTIVES',
      field: 'objectives',
      message: 'Learning objectives are missing',
    });
  }

  // Also validate top-level vocabulary array if exists
  if (lessonData?.vocabulary && Array.isArray(lessonData.vocabulary)) {
    for (let i = 0; i < lessonData.vocabulary.length; i++) {
      const vocabValidation = validateVocabularyItem(lessonData.vocabulary[i]);
      errors.push(...vocabValidation.errors);
      warnings.push(...vocabValidation.warnings);
    }
  }

  // Calculate completeness score
  const criticalErrors = errors.filter(e => e.severity === 'critical').length;
  const regularErrors = errors.filter(e => e.severity === 'error').length;
  const warningCount = warnings.length;

  // Score calculation: start at 100, deduct for issues
  let score = 100;
  score -= criticalErrors * 25; // Critical errors heavily penalize
  score -= regularErrors * 10;  // Regular errors moderately penalize
  score -= warningCount * 2;    // Warnings lightly penalize

  // Bonus/penalty for slide count
  if (slideCount > 0) {
    const slideRatio = slideCount / expectedSlideCount;
    if (slideRatio < 0.5) score -= 20;
    else if (slideRatio < 0.8) score -= 10;
    else if (slideRatio >= 1) score += 5;
  }

  score = Math.max(0, Math.min(100, score));

  // Lesson is valid if no critical errors and score >= 50
  const isValid = criticalErrors === 0 && score >= 50;

  return {
    isValid,
    errors,
    warnings,
    score: Math.round(score),
    slideCount,
    expectedSlideCount,
    phaseCoverage,
  };
}

/**
 * Quick validation check for bulk operations
 * Returns true/false without full report
 */
export function quickValidateLesson(lessonData: any, durationMinutes: number = 60): boolean {
  const result = validateLesson(lessonData, durationMinutes);
  return result.isValid;
}

/**
 * Format validation result as human-readable summary
 */
export function formatValidationSummary(result: ValidationResult): string {
  const lines: string[] = [];
  
  lines.push(`Validation Score: ${result.score}%`);
  lines.push(`Slides: ${result.slideCount}/${result.expectedSlideCount} expected`);
  lines.push(`Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (result.errors.length > 0) {
    lines.push(`\nErrors (${result.errors.length}):`);
    for (const error of result.errors.slice(0, 5)) {
      lines.push(`  - [${error.severity.toUpperCase()}] ${error.message}`);
    }
    if (result.errors.length > 5) {
      lines.push(`  ... and ${result.errors.length - 5} more`);
    }
  }
  
  if (result.warnings.length > 0) {
    lines.push(`\nWarnings (${result.warnings.length}):`);
    for (const warning of result.warnings.slice(0, 3)) {
      lines.push(`  - ${warning.message}`);
    }
    if (result.warnings.length > 3) {
      lines.push(`  ... and ${result.warnings.length - 3} more`);
    }
  }
  
  return lines.join('\n');
}
