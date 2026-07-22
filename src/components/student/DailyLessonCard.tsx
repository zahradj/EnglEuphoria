import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, ChevronDown, ChevronUp, Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface VocabularyWord {
  word: string;
  ipa: string;
  definition: string;
  example: string;
}

export interface Quest {
  title: string;
  description: string;
  type: 'dialogue' | 'quiz' | 'writing' | 'listening';
}

export interface GeneratedLesson {
  topic: string;
  tagline: string;
  vocabulary: VocabularyWord[];
  quest: Quest;
  estimatedMinutes: number;
}

interface DailyLessonCardProps {
  lesson: GeneratedLesson;
  studentLevel: 'playground' | 'academy' | 'professional';
  onStartQuest?: () => void;
}

const levelStyles = {
  playground: {
    cardClass: 'bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-pink-200/50 rounded-[24px]',
    headerClass: 'text-purple-800',
    taglineClass: 'text-pink-600',
    vocabBg: 'bg-white/60',
    questBg: 'bg-gradient-to-r from-pink-400 to-orange-400',
    buttonClass: 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600',
    isDark: false,
  },
  academy: {
    cardClass: 'bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-500/30 rounded-[16px]',
    headerClass: 'text-white',
    taglineClass: 'text-purple-300',
    vocabBg: 'bg-white/5',
    questBg: 'bg-gradient-to-r from-purple-600 to-cyan-600',
    buttonClass: 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600',
    isDark: true,
  },
  professional: {
    cardClass: 'bg-white border border-gray-100 shadow-sm rounded-[12px]',
    headerClass: 'text-gray-900',
    taglineClass: 'text-gray-500',
    vocabBg: 'bg-gray-50',
    questBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    buttonClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    isDark: false,
  },
};

const questIcons = {
  dialogue: '💬',
  quiz: '❓',
  writing: '✍️',
  listening: '🎧',
};

export const DailyLessonCard: React.FC<DailyLessonCardProps> = ({
  lesson,
  studentLevel,
  onStartQuest,
}) => {
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const style = levelStyles[studentLevel];
  const vocabulary = Array.isArray(lesson?.vocabulary) ? lesson.vocabulary : [];
  const quest = lesson?.quest ?? {
    title: 'Conversation Challenge',
    description: 'Use your new vocabulary in a short speaking task.',
    type: 'dialogue' as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 ${style.cardClass}`}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className={`flex items-center gap-2 text-sm ${style.taglineClass}`}>
            <BookOpen className="w-4 h-4" />
            Today's Lesson
          </div>
          <div className={`flex items-center gap-1 text-sm ${style.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="w-4 h-4" />
            {lesson.estimatedMinutes} min
          </div>
        </div>
        
        <h2 className={`text-xl font-bold ${style.headerClass}`}>
          {studentLevel === 'playground' && '🌟 '}{lesson.topic}
        </h2>
        <p className={`text-sm ${style.taglineClass}`}>{lesson.tagline}</p>
      </div>

      {/* Vocabulary Accordion */}
      <Collapsible open={isVocabOpen} onOpenChange={setIsVocabOpen} className="mb-4">
        <CollapsibleTrigger asChild>
          <button
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${style.vocabBg} ${
              style.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <span className={`font-medium ${style.isDark ? 'text-white' : 'text-gray-900'}`}>
              📚 {vocabulary.length} New Words
            </span>
            {isVocabOpen ? (
              <ChevronUp className={`w-5 h-5 ${style.isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${style.isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mt-2"
            >
              {vocabulary.map((word, index) => (
                <motion.div
                  key={word.word}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${style.vocabBg}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${style.isDark ? 'text-white' : 'text-gray-900'}`}>
                          {word.word}
                        </span>
                        <span className={`text-xs ${style.isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                          {word.ipa}
                        </span>
                      </div>
                      <p className={`text-sm ${style.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {word.definition}
                      </p>
                      <p className={`text-xs italic mt-1 ${style.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        "{word.example}"
                      </p>
                    </div>
                    <button className={`p-1.5 rounded-full ${style.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                      <Volume2 className={`w-4 h-4 ${style.isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>

      {/* Quest Card */}
      <div className={`p-4 rounded-xl text-white ${style.questBg}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{questIcons[quest.type]}</span>
          <div>
            <p className="text-xs text-white/80">Today's Quest</p>
            <h3 className="font-bold">{quest.title}</h3>
          </div>
        </div>
        <p className="text-sm text-white/90 mb-3">{quest.description}</p>
        
        <Button
          onClick={onStartQuest}
          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Quest
        </Button>
      </div>
    </motion.div>
  );
};
