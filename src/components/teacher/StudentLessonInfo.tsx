import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, TrendingUp, AlertCircle } from 'lucide-react';

interface StudentLessonInfoProps {
  student: {
    name: string;
    cefr_level?: string;
    current_week?: number;
    current_lesson?: number;
    completion_percentage?: number;
    learning_style?: string;
    strengths?: string[];
    gaps?: string[];
    last_lesson_completed?: string;
  };
  recommendedLesson?: {
    title: string;
    topic: string;
    learning_objectives: string[];
  };
}

export function StudentLessonInfo({ student, recommendedLesson }: StudentLessonInfoProps) {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Student Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{student.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
              {student.cefr_level || 'A1'} Level
            </Badge>
            {student.current_week && (
              <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                Week {student.current_week}
              </Badge>
            )}
          </div>
        </div>
        {student.completion_percentage !== undefined && (
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {student.completion_percentage}%
            </div>
            <p className="text-xs text-gray-600">Progress</p>
          </div>
        )}
      </div>

      {/* Last Lesson */}
      {student.last_lesson_completed && (
        <div className="flex items-start gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-primary mt-0.5" />
          <div>
            <p className="text-gray-600">Last completed:</p>
            <p className="text-gray-900 font-medium">{student.last_lesson_completed}</p>
          </div>
        </div>
      )}

      {/* Recommended Lesson */}
      {recommendedLesson && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Today's Lesson</span>
          </div>
          <h5 className="font-medium text-gray-900 mb-1">{recommendedLesson.title}</h5>
          <p className="text-xs text-gray-600 mb-2">{recommendedLesson.topic}</p>
          {recommendedLesson.learning_objectives.length > 0 && (
            <ul className="space-y-1">
              {recommendedLesson.learning_objectives.slice(0, 2).map((obj, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-primary">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-2 gap-2">
        {student.strengths && student.strengths.length > 0 && (
          <div className="bg-white border border-gray-200 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs font-medium text-gray-700">Strengths</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {student.strengths.slice(0, 2).map((strength, idx) => (
                <span key={idx} className="text-xs text-gray-600">
                  {strength}
                </span>
              ))}
            </div>
          </div>
        )}
        {student.gaps && student.gaps.length > 0 && (
          <div className="bg-white border border-gray-200 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="h-3 w-3 text-warning" />
              <span className="text-xs font-medium text-gray-700">Focus Areas</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {student.gaps.slice(0, 2).map((gap, idx) => (
                <span key={idx} className="text-xs text-gray-600">
                  {gap}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Learning Style */}
      {student.learning_style && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Learning Style:</span> {student.learning_style}
        </div>
      )}
    </div>
  );
}
