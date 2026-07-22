import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, BookOpen, FileText, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SystemFilter = 'playground' | 'academy' | 'hub';

const SYSTEM_TABS: { key: SystemFilter; label: string; color: string }[] = [
  { key: 'playground', label: 'Playground', color: 'bg-orange-500' },
  { key: 'academy', label: 'Academy', color: 'bg-blue-500' },
  { key: 'hub', label: 'Pro Hub', color: 'bg-emerald-500' },
];

const AGE_GROUP_MAP: Record<SystemFilter, string[]> = {
  playground: ['3-5', '4-6', '5-7', '6-8', '7-9', '8-10', '9-11', '3-6', '6-9', '9-12', 'kids'],
  academy: ['10-12', '11-13', '12-14', '13-15', '14-16', '15-17', '12-17', 'teens', 'teen'],
  hub: ['16-18', '18+', '18-25', '25+', 'adults', 'adult', 'professional'],
};

interface CurriculumLesson {
  id: string;
  title: string;
  difficulty_level: string;
  content: any;
  sequence_order: number | null;
  is_published: boolean | null;
}

interface CurriculumUnit {
  id: string;
  title: string;
  unit_number: number;
  cefr_level: string;
  age_group: string;
  lessons: CurriculumLesson[];
}

interface CurriculumBrowserProps {
  activeLessonId: string | null;
  onSelectLesson: (lesson: CurriculumLesson) => void;
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  activeLessonId,
  onSelectLesson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSystem, setActiveSystem] = useState<SystemFilter>('playground');

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['curriculum-browser-units'],
    queryFn: async () => {
      const { data: unitsData, error: unitsError } = await supabase
        .from('curriculum_units')
        .select('id, title, unit_number, cefr_level, age_group')
        .order('unit_number', { ascending: true });

      if (unitsError) throw unitsError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('curriculum_lessons')
        .select('id, title, difficulty_level, content, sequence_order, is_published, unit_id')
        .order('sequence_order', { ascending: true });

      if (lessonsError) throw lessonsError;

      const unitsWithLessons: CurriculumUnit[] = (unitsData || []).map((unit) => ({
        ...unit,
        lessons: (lessonsData || [])
          .filter((l: any) => l.unit_id === unit.id)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            difficulty_level: l.difficulty_level,
            content: l.content,
            sequence_order: l.sequence_order,
            is_published: l.is_published,
          })),
      }));

      return unitsWithLessons;
    },
    staleTime: 2 * 60 * 1000,
  });

  const filteredUnits = units.filter((unit) => {
    // System filter
    const allowedAges = AGE_GROUP_MAP[activeSystem];
    const ageMatch = allowedAges.some((ag) => unit.age_group.toLowerCase().includes(ag.toLowerCase()));
    if (!ageMatch) return false;

    // Search filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      unit.title.toLowerCase().includes(q) ||
      unit.lessons.some((l) => l.title.toLowerCase().includes(q))
    );
  });

  const hasContent = (lesson: CurriculumLesson) => {
    return lesson.content && (Array.isArray(lesson.content) ? lesson.content.length > 0 : Object.keys(lesson.content).length > 0);
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Curriculum</h3>
        </div>

        {/* System filter tabs */}
        <div className="flex gap-1">
          {SYSTEM_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSystem(tab.key)}
              className={cn(
                "flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all",
                activeSystem === tab.key
                  ? `${tab.color} text-white shadow-sm`
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search units or lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No units found for this system
          </div>
        ) : (
          <Accordion type="multiple" className="px-2 py-1">
            {filteredUnits.map((unit) => (
              <AccordionItem key={unit.id} value={unit.id} className="border-b-0">
                <AccordionTrigger className="py-2 px-2 text-xs font-medium hover:no-underline hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">
                      U{unit.unit_number}
                    </span>
                    <span className="truncate">{unit.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto mr-2">
                      {unit.lessons.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-1">
                  <div className="space-y-0.5 pl-2">
                    {unit.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left",
                          activeLessonId === lesson.id
                            ? "bg-primary/15 text-primary font-medium"
                            : "hover:bg-muted/50 text-foreground"
                        )}
                      >
                        {hasContent(lesson) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        )}
                        <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    ))}
                    {unit.lessons.length === 0 && (
                      <p className="text-[10px] text-muted-foreground px-2 py-1">
                        No lessons yet
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );
};
