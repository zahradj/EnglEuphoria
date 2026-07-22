import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";
import { useBulkLessonGenerator, QueuedLesson } from "@/hooks/useBulkLessonGenerator";
import {
  MASTER_CURRICULUM,
  SystemKey,
  getLessonsForUnit,
  getUnitsForLevel,
  getLevelsForSystem,
} from "@/data/masterCurriculum";
import { MasterLessonFlat } from "./LessonPicker";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const BulkLessonGenerator = () => {
  const [selectedSystem, setSelectedSystem] = useState<SystemKey>("kids");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());

  const {
    queue,
    isProcessing,
    isPaused,
    completedCount,
    failedCount,
    skippedCount,
    currentLesson,
    totalCount,
    progressPercent,
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    cancelGeneration,
    resetQueue,
    retryFailed,
  } = useBulkLessonGenerator();

  // Fetch already generated lessons to exclude them
  const { data: generatedLessons } = useQuery({
    queryKey: ["bulk-generated-lessons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("curriculum_lessons")
        .select("title, target_system");
      return data || [];
    },
  });

  // Get available levels for selected system
  const availableLevels = useMemo(() => {
    return getLevelsForSystem(selectedSystem);
  }, [selectedSystem]);

  // Get available units for selected level
  const availableUnits = useMemo(() => {
    if (!selectedLevel) return [];
    return getUnitsForLevel(selectedSystem, selectedLevel);
  }, [selectedSystem, selectedLevel]);

  // Get lessons for selected unit
  const lessonsToGenerate = useMemo(() => {
    if (!selectedLevel || selectedUnit === null) return [];
    return getLessonsForUnit(selectedSystem, selectedLevel, selectedUnit);
  }, [selectedSystem, selectedLevel, selectedUnit]);

  // Filter out already generated lessons
  const pendingLessons = useMemo(() => {
    const generatedTitles = new Set(
      generatedLessons?.map(l => l.title.toLowerCase()) || []
    );
    return lessonsToGenerate.filter(
      l => !generatedTitles.has(l.lessonTitle.toLowerCase())
    );
  }, [lessonsToGenerate, generatedLessons]);

  // Reset selections when system changes
  useEffect(() => {
    setSelectedLevel("");
    setSelectedUnit(null);
    setSelectedLessons(new Set());
  }, [selectedSystem]);

  // Reset unit when level changes
  useEffect(() => {
    setSelectedUnit(null);
    setSelectedLessons(new Set());
  }, [selectedLevel]);

  // Auto-select all pending lessons when unit changes
  useEffect(() => {
    if (pendingLessons.length > 0) {
      setSelectedLessons(new Set(pendingLessons.map(l => l.uniqueKey)));
    }
  }, [pendingLessons]);

  const handleToggleLesson = (uniqueKey: string) => {
    setSelectedLessons(prev => {
      const next = new Set(prev);
      if (next.has(uniqueKey)) {
        next.delete(uniqueKey);
      } else {
        next.add(uniqueKey);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedLessons(new Set(pendingLessons.map(l => l.uniqueKey)));
  };

  const handleDeselectAll = () => {
    setSelectedLessons(new Set());
  };

  const handleStartGeneration = () => {
    const lessonsToProcess = pendingLessons.filter(l => selectedLessons.has(l.uniqueKey));
    startGeneration(lessonsToProcess);
  };

  const estimatedTimeMinutes = Math.ceil((selectedLessons.size * 20) / 60); // ~20 sec per lesson (gen + delay)

  const getStatusIcon = (status: QueuedLesson['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: QueuedLesson['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Saved</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'generating':
        return <Badge variant="secondary">Generating...</Badge>;
      case 'skipped':
        return <Badge variant="outline">Skipped</Badge>;
      default:
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  const systemLabel = MASTER_CURRICULUM[selectedSystem]?.label || selectedSystem;

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Bulk Generate Unit
          </CardTitle>
          <CardDescription>
            Generate all lessons in a unit at once with automatic rate limiting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* System Selector */}
            <div className="space-y-2">
              <Label>System</Label>
              <Select
                value={selectedSystem}
                onValueChange={(v) => setSelectedSystem(v as SystemKey)}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kids">🎨 Playground (Kids)</SelectItem>
                  <SelectItem value="teen">📚 Academy (Teens)</SelectItem>
                  <SelectItem value="adult">💼 Hub (Adults)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Level Selector */}
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={selectedLevel}
                onValueChange={setSelectedLevel}
                disabled={isProcessing || availableLevels.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map((level) => (
                    <SelectItem key={level.name} value={level.name}>
                      {level.name} ({level.cefrLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit Selector */}
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={selectedUnit?.toString() || ""}
                onValueChange={(v) => setSelectedUnit(parseInt(v))}
                disabled={isProcessing || !selectedLevel || availableUnits.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.number} value={unit.number.toString()}>
                      Unit {unit.number}: {unit.name} ({unit.lessonCount} lessons)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lessons List */}
          {selectedUnit !== null && pendingLessons.length > 0 && !isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Lessons to Generate ({selectedLessons.size} selected)</Label>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[200px] rounded-md border p-3">
                <div className="space-y-2">
                  {pendingLessons.map((lesson) => (
                    <div
                      key={lesson.uniqueKey}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedLessons.has(lesson.uniqueKey)}
                        onCheckedChange={() => handleToggleLesson(lesson.uniqueKey)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          L{lesson.lessonNumber}: {lesson.lessonTitle}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lesson.lessonType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Estimated Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Estimated time: ~{estimatedTimeMinutes} minute{estimatedTimeMinutes !== 1 ? 's' : ''}{' '}
                  (5s delay between requests)
                </span>
              </div>

              {/* Start Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleStartGeneration}
                disabled={selectedLessons.size === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Generate {selectedLessons.size} Lesson{selectedLessons.size !== 1 ? 's' : ''}
              </Button>
            </div>
          )}

          {/* Already Generated Notice */}
          {selectedUnit !== null && pendingLessons.length === 0 && lessonsToGenerate.length > 0 && !isProcessing && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All lessons in this unit have already been generated!</p>
            </div>
          )}

          {/* No Lessons Notice */}
          {selectedUnit !== null && lessonsToGenerate.length === 0 && !isProcessing && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p>No lessons defined for this unit in the Master Curriculum.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Section */}
      {(isProcessing || queue.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generation Progress</span>
              <div className="flex items-center gap-2">
                {isProcessing && !isPaused && (
                  <Button variant="outline" size="sm" onClick={pauseGeneration}>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
                {isPaused && (
                  <Button variant="outline" size="sm" onClick={resumeGeneration}>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                {isProcessing && (
                  <Button variant="destructive" size="sm" onClick={cancelGeneration}>
                    <Square className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
                {!isProcessing && failedCount > 0 && (
                  <Button variant="outline" size="sm" onClick={retryFailed}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Retry Failed ({failedCount})
                  </Button>
                )}
                {!isProcessing && (
                  <Button variant="ghost" size="sm" onClick={resetQueue}>
                    Clear
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {completedCount + failedCount + skippedCount} / {totalCount} processed
                </span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {completedCount} completed
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  {failedCount} failed
                </span>
                {skippedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {skippedCount} skipped
                  </span>
                )}
              </div>
            </div>

            {/* Current Lesson */}
            {currentLesson && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Generating: {currentLesson.lessonTitle}
                  </span>
                </div>
              </div>
            )}

            {/* Queue List */}
            <ScrollArea className="h-[300px] rounded-md border p-3">
              <div className="space-y-2">
                {queue.map((item) => (
                  <div
                    key={item.lesson.uniqueKey}
                    className={`flex items-center justify-between p-2 rounded ${
                      item.status === 'generating' ? 'bg-primary/5' :
                      item.status === 'completed' ? 'bg-green-500/5' :
                      item.status === 'failed' ? 'bg-destructive/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="text-sm font-medium">
                          L{item.lesson.lessonNumber}: {item.lesson.lessonTitle}
                        </p>
                        {item.error && (
                          <p className="text-xs text-destructive">{item.error}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
