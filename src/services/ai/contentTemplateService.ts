
export interface ContentTemplate {
  type: string;
  template: string;
}

export class ContentTemplateService {
  private templates: Record<string, string> = {
    'worksheet': `# {{topic}} Worksheet - {{level}} Level

## Exercise 1: Vocabulary
Fill in the blanks with words related to {{topic}}:
1. The _____ is very important for {{topic}}.
2. When we talk about {{topic}}, we should remember _____.

## Exercise 2: Multiple Choice
1. What is most important about {{topic}}?
   a) Option A  b) Option B  c) Option C

## Answer Key
1. [Answer], 2. [Answer] | 1. c`,

    'quiz': `# {{topic}} Quiz - {{level}} Level

1. True/False: {{topic}} is important in daily life.
2. What is the main purpose of {{topic}}?
3. Give an example of {{topic}} in your life.

## Answers
1. True, 2. [Main purpose], 3. [Example]`,

    'flashcards': `# {{topic}} Flashcards - {{level}} Level

**Card 1:** Basic | Definition: Fundamental concept
**Card 2:** Important | Definition: Having great value
**Card 3:** Useful | Definition: Helpful and practical

*Study these cards daily for best results!*`,

    'activity': `# {{topic}} Activity - {{level}} Level

## Materials: Paper, pencils
## Time: {{duration}} minutes

1. Warm-up (5 min): Discuss {{topic}}
2. Main activity (10 min): Practice exercises
3. Wrap-up (5 min): Review key points`,

    'lesson_plan': `# {{topic}} Lesson Plan - {{level}} Level

## Objectives
- Understand basic concepts of {{topic}}
- Use vocabulary related to {{topic}}

## Activities ({{duration}} min)
1. Introduction (10 min)
2. Main lesson (30 min)
3. Practice (15 min)
4. Review (5 min)`
  };

  private estimatedTimes: Record<string, number> = {
    'flashcards': 3000,
    'quiz': 5000,
    'worksheet': 8000,
    'activity': 12000,
    'lesson_plan': 15000
  };

  getTemplate(type: string): string {
    return this.templates[type] || `# {{topic}} Content - {{level}} Level\n\nBasic content about {{topic}}.`;
  }

  generateFromTemplate(type: string, variables: Record<string, string | number>): string {
    let template = this.getTemplate(type);
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, String(value));
    });

    return template;
  }

  getEstimatedGenerationTime(type: string): number {
    return this.estimatedTimes[type] || 10000;
  }
}

export const contentTemplateService = new ContentTemplateService();
