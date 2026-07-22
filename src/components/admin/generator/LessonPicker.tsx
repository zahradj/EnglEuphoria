import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Circle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  MASTER_CURRICULUM, 
  getAllLessonsForSystem, 
  SystemKey,
  LessonType 
} from "@/data/masterCurriculum";

// Type matching the return from getAllLessonsForSystem
export interface MasterLessonFlat {
  system: SystemKey;
  levelName: string;
  cefrLevel: string;
  unitNumber: number;
  unitName: string;
  lessonNumber: number;
  lessonTitle: string;
  lessonType: LessonType;
  uniqueKey: string;
}

interface LessonPickerProps {
  system: string;
  onSelectLesson: (lesson: MasterLessonFlat | null, isGenerated: boolean) => void;
  selectedLessonKey?: string | null;
}

export const LessonPicker: React.FC<LessonPickerProps> = ({
  system,
  onSelectLesson,
  selectedLessonKey,
}) => {
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [showPendingOnly, setShowPendingOnly] = useState(true);

  // Map system prop to SystemKey
  const systemKey: SystemKey = useMemo(() => {
    if (system === "kids") return "kids";
    if (system === "teens" || system === "teen") return "teen";
    return "adult";
  }, [system]);

  // Get all lessons from master curriculum for the current system
  const masterLessons = useMemo(() => {
    return getAllLessonsForSystem(systemKey);
  }, [systemKey]);

  // Fetch already-generated lessons from database to mark as completed
  const { data: generatedLessons = [] } = useQuery({
    queryKey: ["generated-lessons", systemKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_lessons")
        .select("id, title, target_system, sequence_order, unit_id, difficulty_level")
        .eq("target_system", systemKey);

      if (error) throw error;
      return data || [];
    },
  });

  // Create a Set of generated lesson titles for quick lookup
  const generatedTitlesSet = useMemo(() => {
    return new Set(generatedLessons.map((l) => l.title.toLowerCase().trim()));
  }, [generatedLessons]);

  // Check if a lesson has been generated
  const isLessonGenerated = (lesson: MasterLessonFlat): boolean => {
    // Check by title match (case-insensitive)
    return generatedTitlesSet.has(lesson.lessonTitle.toLowerCase().trim());
  };

  // Group lessons by level and unit
  const groupedLessons = useMemo(() => {
    const grouped: Record<string, Record<string, MasterLessonFlat[]>> = {};
    
    for (const lesson of masterLessons) {
      if (!grouped[lesson.levelName]) {
        grouped[lesson.levelName] = {};
      }
      const unitKey = `${lesson.unitNumber}-${lesson.unitName}`;
      if (!grouped[lesson.levelName][unitKey]) {
        grouped[lesson.levelName][unitKey] = [];
      }
      grouped[lesson.levelName][unitKey].push(lesson);
    }
    
    return grouped;
  }, [masterLessons]);

  // Get statistics
  const stats = useMemo(() => {
    const total = masterLessons.length;
    const completed = masterLessons.filter(isLessonGenerated).length;
    return { total, completed, pending: total - completed };
  }, [masterLessons, generatedTitlesSet]);

  const toggleLevel = (levelName: string) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(levelName)) {
        next.delete(levelName);
      } else {
        next.add(levelName);
      }
      return next;
    });
  };

  const toggleUnit = (unitKey: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitKey)) {
        next.delete(unitKey);
      } else {
        next.add(unitKey);
      }
      return next;
    });
  };

  const handleSelectLesson = (lesson: MasterLessonFlat) => {
    const isGenerated = isLessonGenerated(lesson);
    onSelectLesson(lesson, isGenerated);
  };

  const getSystemLabel = (): string => {
    const systemData = MASTER_CURRICULUM[systemKey];
    return systemData?.label || systemKey;
  };

  const getLessonTypeColor = (type: LessonType): string => {
    switch (type) {
      case "Mechanic":
        return "text-blue-500";
      case "Context":
        return "text-green-500";
      case "Application":
        return "text-orange-500";
      case "Checkpoint":
        return "text-purple-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Master Curriculum</h3>
          <Badge variant="outline" className="ml-auto text-xs">
            {getSystemLabel()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.completed}/{stats.total} lessons generated
        </p>
        
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
          />
        </div>

        {/* Filter toggle */}
        <div className="flex items-center space-x-2 mt-3">
          <Checkbox 
            id="pendingOnly" 
            checked={showPendingOnly}
            onCheckedChange={(checked) => setShowPendingOnly(checked === true)}
          />
          <Label htmlFor="pendingOnly" className="text-xs cursor-pointer">
            Show pending only ({stats.pending})
          </Label>
        </div>
      </div>

      <ScrollArea className="h-[450px]">
        <div className="p-2 space-y-1">
          {Object.entries(groupedLessons).map(([levelName, units]) => {
            const isLevelExpanded = expandedLevels.has(levelName);
            
            // Count lessons in this level
            const levelLessons = Object.values(units).flat();
            const levelCompleted = levelLessons.filter(isLessonGenerated).length;
            const levelPending = levelLessons.length - levelCompleted;
            
            // Skip if showing pending only and no pending lessons
            if (showPendingOnly && levelPending === 0) return null;

            return (
              <Collapsible
                key={levelName}
                open={isLevelExpanded}
                onOpenChange={() => toggleLevel(levelName)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-2 bg-muted/30 hover:bg-muted/50"
                  >
                    {isLevelExpanded ? (
                      <ChevronDown className="h-4 w-4 mr-2 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2 shrink-0" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{levelName}</div>
                      <div className="text-xs text-muted-foreground">
                        {levelCompleted}/{levelLessons.length} complete
                      </div>
                    </div>
                    {levelPending > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {levelPending} pending
                      </Badge>
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {Object.entries(units).map(([unitKey, lessons]) => {
                    const isUnitExpanded = expandedUnits.has(unitKey);
                    const [unitNum, unitName] = unitKey.split("-");
                    
                    // Count lessons in this unit
                    const unitCompleted = lessons.filter(isLessonGenerated).length;
                    const unitPending = lessons.length - unitCompleted;
                    
                    // Skip if showing pending only and no pending lessons
                    if (showPendingOnly && unitPending === 0) return null;

                    return (
                      <Collapsible
                        key={unitKey}
                        open={isUnitExpanded}
                        onOpenChange={() => toggleUnit(unitKey)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-auto py-2 px-2"
                          >
                            {isUnitExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 mr-2 shrink-0" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 mr-2 shrink-0" />
                            )}
                            <BookOpen className="h-3.5 w-3.5 mr-2 shrink-0 text-primary" />
                            <div className="flex-1 text-left">
                              <div className="font-medium text-xs">
                                Unit {unitNum}: {unitName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {unitCompleted}/{lessons.length} lessons
                              </div>
                            </div>
                          </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="pl-6 space-y-0.5 mt-1">
                          {lessons.map((lesson) => {
                            const isGenerated = isLessonGenerated(lesson);
                            
                            // Skip if showing pending only and already generated
                            if (showPendingOnly && isGenerated) return null;

                            return (
                              <Button
                                key={lesson.uniqueKey}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-full justify-start h-auto py-1.5 px-2",
                                  selectedLessonKey === lesson.uniqueKey && "bg-primary/10 border border-primary/30",
                                  isGenerated && "opacity-60"
                                )}
                                onClick={() => handleSelectLesson(lesson)}
                              >
                                {isGenerated ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-2 shrink-0 text-green-500" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
                                )}
                                <div className="flex-1 text-left truncate">
                                  <span className="text-xs">
                                    L{lesson.lessonNumber}. {lesson.lessonTitle}
                                  </span>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-[10px] px-1", getLessonTypeColor(lesson.lessonType))}
                                >
                                  {lesson.lessonType}
                                </Badge>
                              </Button>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {Object.keys(groupedLessons).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No curriculum data for this system</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
