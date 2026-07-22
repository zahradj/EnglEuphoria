import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Volume2, Pen, MessageCircle } from 'lucide-react';

interface LessonCycleData {
  title: string;
  cycle_type?: string | null;
  phonics_focus?: string | null;
  vocabulary_list?: any[];
  grammar_pattern?: string | null;
  skills_focus?: string[];
  content?: {
    objectives?: string[];
    warmUp?: string;
    presentation?: string;
    controlledPractice?: string;
    freerPractice?: string;
    homework?: string;
    teacherTips?: string;
    realWorldMission?: string;
    scriptedIntro?: string;
    interactiveActivity?: string;
  };
}

interface LessonCyclePreviewProps {
  lesson: LessonCycleData;
}

const CYCLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  discovery: {
    label: 'Discovery',
    icon: <Volume2 className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    description: 'Phonics + 5 Nouns · Listening & Reading',
  },
  ladder: {
    label: 'The Ladder',
    icon: <Pen className="h-4 w-4" />,
    color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    description: 'Verbs + Adjectives · Writing & Grammar',
  },
  bridge: {
    label: 'The Bridge',
    icon: <MessageCircle className="h-4 w-4" />,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    description: 'Questions + Real-Life Use · Speaking & Fluency',
  },
};

export const LessonCyclePreview: React.FC<LessonCyclePreviewProps> = ({ lesson }) => {
  const cycle = lesson.cycle_type ? CYCLE_CONFIG[lesson.cycle_type] : null;
  const content = lesson.content || {};

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{lesson.title}</CardTitle>
        </div>
        {cycle && (
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${cycle.color} border`}>
              {cycle.icon}
              <span className="ml-1">{cycle.label}</span>
            </Badge>
            <span className="text-xs text-muted-foreground">{cycle.description}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Phonics Focus */}
        {lesson.phonics_focus && (
          <Section title="🔊 Phonics Focus">
            <Badge variant="secondary" className="text-sm">{lesson.phonics_focus}</Badge>
          </Section>
        )}

        {/* Vocabulary */}
        {lesson.vocabulary_list && lesson.vocabulary_list.length > 0 && (
          <Section title="📚 Vocabulary (max 5)">
            <div className="flex flex-wrap gap-1.5">
              {lesson.vocabulary_list.slice(0, 5).map((word: any, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {typeof word === 'string' ? word : word.word || word.term || JSON.stringify(word)}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {/* Grammar Pattern */}
        {lesson.grammar_pattern && (
          <Section title="🗣 Grammar Pattern">
            <p className="text-muted-foreground">{lesson.grammar_pattern}</p>
          </Section>
        )}

        {/* Skills Focus */}
        {lesson.skills_focus && lesson.skills_focus.length > 0 && (
          <Section title="🎯 Skills Focus">
            <div className="flex flex-wrap gap-1.5">
              {lesson.skills_focus.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs capitalize">{skill}</Badge>
              ))}
            </div>
          </Section>
        )}

        {/* Objectives */}
        {content.objectives && content.objectives.length > 0 && (
          <Section title="📋 Learning Objectives">
            <ul className="space-y-1 text-muted-foreground">
              {content.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Scripted Intro */}
        {content.scriptedIntro && (
          <Section title="🎬 Scripted Intro">
            <p className="text-muted-foreground italic">{content.scriptedIntro}</p>
          </Section>
        )}

        {/* Interactive Activity */}
        {content.interactiveActivity && (
          <Section title="🎮 Interactive Activity">
            <p className="text-muted-foreground">{content.interactiveActivity}</p>
          </Section>
        )}

        {/* Real-World Mission */}
        {content.realWorldMission && (
          <Section title="🌍 Real-World Mission">
            <p className="text-muted-foreground font-medium">{content.realWorldMission}</p>
          </Section>
        )}

        {/* Teacher Tips */}
        {content.teacherTips && (
          <Section title="💡 Teacher Tips">
            <p className="text-muted-foreground">{content.teacherTips}</p>
          </Section>
        )}
      </CardContent>
    </Card>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-foreground mb-1.5">{title}</h4>
    {children}
  </div>
);
