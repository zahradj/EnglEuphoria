import React, { useState } from 'react';
import { BookOpen, Target, CheckCircle2, ChevronLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicSlideRenderer from '@/components/lesson-player/DynamicSlideRenderer';
import { GeneratedSlide, HubType } from '@/components/admin/lesson-builder/ai-wizard/types';

interface AcademyLessonLayoutProps {
  lessonTitle: string;
  objectives?: string[];
  wizardScript?: string;
  slides: GeneratedSlide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  onBack?: () => void;
}

export const AcademyLessonLayout: React.FC<AcademyLessonLayoutProps> = ({
  lessonTitle,
  objectives = [],
  wizardScript = '',
  slides,
  currentSlideIndex,
  onSlideChange,
  onBack,
}) => {
  const [studentSuccess, setStudentSuccess] = useState(false);
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-dvh bg-[#FAFBFC] font-inter">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center px-6 gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-[#6B21A8]">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <h1 className="text-base font-semibold text-[#6B21A8] truncate">{lessonTitle}</h1>
        <span className="ml-auto text-xs text-slate-400 font-medium">
          Slide {currentSlideIndex + 1} / {slides.length}
        </span>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Column — Learning Stage (75%) */}
        <main className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-3xl">
            {currentSlide && (
              <DynamicSlideRenderer
                slide={currentSlide}
                hub={'academy' as HubType}
                onCorrectAnswer={() => {}}
              />
            )}
          </div>
        </main>

        {/* Right Column — Teacher Sidebar (25%) */}
        <aside className="w-80 border-l border-slate-200 bg-[#FAFBFC] flex flex-col overflow-y-auto">
          {/* Lesson Objectives */}
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B21A8] mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Objectives
            </h2>
            <ul className="space-y-2">
              {objectives.length > 0 ? objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-[#4CAF50] mt-0.5 shrink-0" />
                  {obj}
                </li>
              )) : (
                <li className="text-sm text-slate-400 italic">No objectives set</li>
              )}
            </ul>
          </div>

          {/* II Wizard Script */}
          <div className="p-5 border-b border-slate-200 flex-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B21A8] mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Teacher Script
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {wizardScript || 'No script available for this slide.'}
            </div>
          </div>

          {/* Student Success Toggle */}
          <div className="p-5">
            <button
              onClick={() => setStudentSuccess(!studentSuccess)}
              className="flex items-center justify-between w-full text-sm font-medium text-slate-700"
            >
              <span>Student Success</span>
              {studentSuccess ? (
                <ToggleRight className="w-6 h-6 text-[#4CAF50]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-300" />
              )}
            </button>
            <p className="text-xs text-slate-400 mt-1">
              {studentSuccess ? 'Student is engaged and on track' : 'Toggle when student demonstrates understanding'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AcademyLessonLayout;
