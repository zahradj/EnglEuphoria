import { supabase } from '@/integrations/supabase/client';
const isSupabaseConfigured = () => true; // Always configured in Engleuphoria deployments
import { AIContentRequest } from './types';

interface CurriculumLevel {
  level: string;
  weeks: number;
  lessonsPerWeek: number;
  totalLessons: number;
  totalPages: number;
  themes: string[];
}

const CURRICULUM_LEVELS: CurriculumLevel[] = [
  {
    level: 'A1',
    weeks: 12,
    lessonsPerWeek: 4,
    totalLessons: 48,
    totalPages: 960,
    themes: [
      'Introductions & Greetings', 'Family & Friends', 'Daily Routines', 'Food & Drinks',
      'Home & Housing', 'Shopping & Money', 'Transportation', 'Health & Body',
      'Work & Jobs', 'Hobbies & Interests', 'Weather & Seasons', 'Time & Dates'
    ]
  },
  {
    level: 'A2',
    weeks: 14,
    lessonsPerWeek: 4,
    totalLessons: 56,
    totalPages: 1120,
    themes: [
      'Personal Information', 'Travel & Holidays', 'Education & Learning', 'Technology',
      'Sports & Activities', 'Entertainment', 'Relationships', 'Clothing & Fashion',
      'City Life', 'Countries & Cultures', 'Past Experiences', 'Future Plans',
      'Opinions & Preferences', 'Problems & Solutions'
    ]
  },
  {
    level: 'B1',
    weeks: 16,
    lessonsPerWeek: 3,
    totalLessons: 48,
    totalPages: 960,
    themes: [
      'Career Development', 'Environmental Issues', 'Media & News', 'Social Issues',
      'Health & Lifestyle', 'Art & Culture', 'Business & Economy', 'Communication',
      'Innovation & Technology', 'Global Challenges', 'Personal Growth', 'Community',
      'Ethics & Values', 'Science & Discovery', 'Adventure & Risk', 'Traditions'
    ]
  },
  {
    level: 'B2',
    weeks: 18,
    lessonsPerWeek: 3,
    totalLessons: 54,
    totalPages: 1080,
    themes: [
      'Professional Communication', 'Leadership & Management', 'Critical Thinking',
      'Research & Analysis', 'Presentation Skills', 'Negotiation', 'Project Management',
      'Cross-cultural Communication', 'Innovation Strategies', 'Quality Management',
      'Risk Assessment', 'Team Dynamics', 'Change Management', 'Customer Relations',
      'Market Analysis', 'Strategic Planning', 'Performance Evaluation', 'Conflict Resolution'
    ]
  },
  {
    level: 'C1',
    weeks: 20,
    lessonsPerWeek: 2,
    totalLessons: 40,
    totalPages: 800,
    themes: [
      'Academic Writing', 'Research Methodology', 'Advanced Grammar', 'Literature Analysis',
      'Philosophical Discussions', 'Scientific Communication', 'Legal Language',
      'Political Discourse', 'Economic Theory', 'Advanced Presentation',
      'Thesis Development', 'Critical Analysis', 'Complex Argumentation',
      'Abstract Concepts', 'Advanced Vocabulary', 'Stylistic Variation',
      'Discourse Analysis', 'Advanced Listening', 'Professional Writing', 'Fluency Development'
    ]
  },
  {
    level: 'C2',
    weeks: 24,
    lessonsPerWeek: 2,
    totalLessons: 48,
    totalPages: 960,
    themes: [
      'Mastery of Nuance', 'Advanced Literature', 'Complex Academic Texts',
      'Professional Expertise', 'Cultural Sophistication', 'Advanced Rhetoric',
      'Specialized Terminology', 'Expert Communication', 'Advanced Discourse',
      'Precision & Accuracy', 'Cultural Fluency', 'Advanced Pragmatics',
      'Sociolinguistic Competence', 'Advanced Phonology', 'Stylistic Mastery',
      'Expert Reading', 'Advanced Writing', 'Fluent Speaking', 'Native-like Listening',
      'Cultural Integration', 'Advanced Grammar', 'Idiomatic Mastery', 'Register Variation', 'Advanced Pragmatics'
    ]
  }
];

export class BulkCurriculumService {
  private isGenerating = false;
  private progress = 0;
  private currentLevel = '';
  private currentLesson = 0;
  private totalLessons = 294;

  async generateFullCurriculum(
    onProgress?: (progress: number, level: string, lesson: number, total: number) => void
  ): Promise<void> {
    if (this.isGenerating) {
      throw new Error('Curriculum generation already in progress');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase configuration required for curriculum generation');
    }

    this.isGenerating = true;
    this.progress = 0;
    let completedLessons = 0;

    try {
      for (const level of CURRICULUM_LEVELS) {
        this.currentLevel = level.level;
        
        for (let week = 1; week <= level.weeks; week++) {
          for (let lessonInWeek = 1; lessonInWeek <= level.lessonsPerWeek; lessonInWeek++) {
            this.currentLesson = completedLessons + 1;
            
            const themeIndex = Math.floor((week - 1) / (level.weeks / level.themes.length));
            const theme = level.themes[themeIndex] || level.themes[0];
            
            await this.generateSingleLesson({
              level: level.level,
              theme,
              week,
              lessonInWeek,
              totalWeeks: level.weeks
            });

            completedLessons++;
            this.progress = (completedLessons / this.totalLessons) * 100;
            
            if (onProgress) {
              onProgress(this.progress, level.level, this.currentLesson, this.totalLessons);
            }

            // Add small delay to prevent overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    } finally {
      this.isGenerating = false;
    }
  }

  private async generateSingleLesson(params: {
    level: string;
    theme: string;
    week: number;
    lessonInWeek: number;
    totalWeeks: number;
  }): Promise<void> {
    const request: AIContentRequest = {
      type: 'lesson',
      topic: `${params.theme} - Week ${params.week}, Lesson ${params.lessonInWeek}`,
      level: params.level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
      duration: 30,
      objectives: this.generateLearningObjectives(params.level, params.theme),
      requirements: this.generateRequirements(params.level, params.week, params.totalWeeks)
    };

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          ...request,
          isBulkGeneration: true,
          curriculumContext: {
            level: params.level,
            week: params.week,
            totalWeeks: params.totalWeeks,
            theme: params.theme,
            lessonNumber: params.lessonInWeek
          }
        }
      });

      if (error) {
        console.error(`Failed to generate lesson for ${params.level} Week ${params.week}:`, error);
      }
    } catch (error) {
      console.error(`Error generating lesson for ${params.level} Week ${params.week}:`, error);
    }
  }

  private generateLearningObjectives(level: string, theme: string): string[] {
    const levelObjectives = {
      A1: [
        'Use basic vocabulary related to the topic',
        'Form simple sentences (5-8 words)',
        'Ask and answer basic questions',
        'Understand simple spoken instructions'
      ],
      A2: [
        'Express opinions using simple language',
        'Construct sentences with 8-12 words',
        'Participate in short conversations',
        'Use past and future tenses correctly'
      ],
      B1: [
        'Express complex ideas clearly',
        'Use sentences with 12-18 words',
        'Engage in detailed discussions',
        'Connect ideas with appropriate linking words'
      ],
      B2: [
        'Present arguments effectively',
        'Construct sentences with 18-22 words',
        'Lead conversations and discussions',
        'Use advanced grammatical structures'
      ],
      C1: [
        'Express subtle meanings and nuances',
        'Use sentences with 22-25 words naturally',
        'Engage in academic and professional discourse',
        'Demonstrate near-native fluency'
      ],
      C2: [
        'Communicate with native-like precision',
        'Use complex sentences (25+ words) effortlessly',
        'Master all registers and styles',
        'Demonstrate complete linguistic competence'
      ]
    };

    return levelObjectives[level as keyof typeof levelObjectives] || levelObjectives.A1;
  }

  private generateRequirements(level: string, week: number, totalWeeks: number): string {
    const progressPercentage = (week / totalWeeks) * 100;
    
    return `
    NEUROSCIENCE-ENHANCED LESSON REQUIREMENTS:
    
    1. COGNITIVE LOAD OPTIMIZATION:
    - Distribute content across 20 pages with optimal cognitive spacing
    - Use spaced repetition principles for vocabulary introduction
    - Apply dual coding theory with visual and textual elements
    
    2. MEMORY CONSOLIDATION:
    - Include retrieval practice every 3-4 pages
    - Use elaborative interrogation techniques
    - Implement interleaving of different skill areas
    
    3. ATTENTION & ENGAGEMENT:
    - Start with attention-grabbing authentic content
    - Use curiosity gaps to maintain engagement
    - Include movement-based activities for motor cortex activation
    
    4. SENTENCE CONSTRUCTION PROGRESSION:
    - Target ${level} complexity level (${this.getSentenceTargets(level)})
    - Progressive scaffolding from simple to complex structures
    - Include conversation practice with real-world scenarios
    
    5. CULTURAL & INTERNET INTEGRATION:
    - Reference current events and trending topics
    - Include authentic materials from native speakers
    - Connect to global cultural contexts
    
    6. ASSESSMENT & FEEDBACK:
    - Include immediate feedback mechanisms
    - Self-assessment opportunities
    - Clear progress indicators
    
    Progress Context: Week ${week}/${totalWeeks} (${progressPercentage.toFixed(0)}% through ${level} level)
    `;
  }

  private getSentenceTargets(level: string): string {
    const targets = {
      A1: '5-8 words, present simple, basic word order',
      A2: '8-12 words, past/future tenses, compound sentences',
      B1: '12-18 words, complex ideas, linking words',
      B2: '18-22 words, advanced structures, nuanced expression',
      C1: '22-25 words, sophisticated language, academic register',
      C2: '25+ words, native-like complexity, all registers'
    };
    
    return targets[level as keyof typeof targets] || targets.A1;
  }

  getGenerationStats() {
    return {
      isGenerating: this.isGenerating,
      progress: this.progress,
      currentLevel: this.currentLevel,
      currentLesson: this.currentLesson,
      totalLessons: this.totalLessons,
      levels: CURRICULUM_LEVELS
    };
  }

  async getGeneratedContent() {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('adaptive_content')
        .select('*')
        .eq('content_type', 'lesson')
        .eq('is_active', true)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching generated content:', error);
      return [];
    }
  }
}

export const bulkCurriculumService = new BulkCurriculumService();