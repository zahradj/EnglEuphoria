import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PPPLesson, IronLevel, LEVEL_NAMES } from './types';
import { 
  Download, 
  Dumbbell, 
  Target, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Table,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface IronLessonPreviewProps {
  level: IronLevel;
}

export const IronLessonPreview: React.FC<IronLessonPreviewProps> = ({ level }) => {
  const levelInfo = LEVEL_NAMES[level.levelNumber];

  return (
    <div className="space-y-6">
      {/* Level Header */}
      <div className={cn(
        'p-6 rounded-xl bg-gradient-to-r text-white',
        levelInfo.color
      )}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{levelInfo.icon}</span>
          <div>
            <p className="text-sm opacity-80">Level {level.levelNumber}</p>
            <h2 className="text-2xl font-bold">{level.levelTitle}</h2>
            <p className="text-sm opacity-90 mt-1">{level.levelDescription}</p>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <Accordion type="single" collapsible className="space-y-4">
        {level.lessons.map((lesson, index) => (
          <AccordionItem 
            key={index} 
            value={`lesson-${index}`}
            className="border rounded-xl overflow-hidden bg-card"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lesson {lesson.lessonNumber}</p>
                  <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                {/* PRESENTATION */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Download className="w-4 h-4 text-blue-500" />
                    </div>
                    <h4 className="font-bold text-blue-600 dark:text-blue-400">
                      PRESENTATION (The Download)
                    </h4>
                  </div>
                  
                  <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-4 space-y-4">
                      <p className="text-foreground leading-relaxed">
                        {lesson.presentation.concept}
                      </p>
                      
                      {lesson.presentation.formula && (
                        <div className="p-3 bg-card rounded-lg border font-mono text-sm">
                          <span className="text-muted-foreground">Formula: </span>
                          {lesson.presentation.formula}
                        </div>
                      )}
                      
                      {lesson.presentation.keyPoints.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Key Points:</p>
                          <ul className="space-y-1">
                            {lesson.presentation.keyPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {lesson.presentation.table && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-muted">
                                {lesson.presentation.table.headers.map((header, i) => (
                                  <th key={i} className="border px-3 py-2 text-left font-medium">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {lesson.presentation.table.rows.map((row, i) => (
                                <tr key={i}>
                                  {row.map((cell, j) => (
                                    <td key={j} className="border px-3 py-2">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* PRACTICE */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-amber-500" />
                    </div>
                    <h4 className="font-bold text-amber-600 dark:text-amber-400">
                      PRACTICE (The Drill)
                    </h4>
                  </div>
                  
                  <div className="space-y-3">
                    {['taskA', 'taskB', 'taskC'].map((taskKey, i) => {
                      const task = lesson.practice[taskKey as keyof typeof lesson.practice];
                      const letter = String.fromCharCode(65 + i);
                      
                      return (
                        <Card key={taskKey} className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="bg-amber-500 text-white border-0">
                                Task {letter}
                              </Badge>
                              <div className="space-y-2 flex-1">
                                <p className="font-medium">{task.instruction}</p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Pattern: </span>
                                  {'pattern' in task ? task.pattern : `Builds on Task ${task.buildsOn}`}
                                </p>
                                {task.expectedOutput && (
                                  <p className="text-sm text-green-600 dark:text-green-400">
                                    <span className="font-medium">Expected: </span>
                                    {task.expectedOutput}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* PRODUCTION */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-red-500" />
                    </div>
                    <h4 className="font-bold text-red-600 dark:text-red-400">
                      PRODUCTION (The Test)
                    </h4>
                  </div>
                  
                  <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Scenario:</p>
                        <p className="text-foreground italic">{lesson.production.scenario}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Mission:</p>
                        <p className="text-foreground font-medium">{lesson.production.mission}</p>
                      </div>
                      
                      {lesson.production.constraints.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Constraints:</p>
                          <div className="flex flex-wrap gap-2">
                            {lesson.production.constraints.map((constraint, i) => (
                              <Badge key={i} variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                {constraint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          Success Criteria: {lesson.production.successCriteria}
                        </p>
                      </div>
                      
                      {lesson.production.timeLimit && (
                        <Badge variant="outline" className="border-red-500 text-red-500">
                          ⏱️ Time Limit: {lesson.production.timeLimit}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
