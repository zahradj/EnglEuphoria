import React, { useState, useMemo } from 'react';
import { 
  useCurriculumProgress, 
  UnitProgress, 
  getPendingLessonsForUnits 
} from '@/hooks/useCurriculumProgress';
import { useMultiUnitBulkGenerator } from '@/hooks/useMultiUnitBulkGenerator';
import { SystemKey } from '@/data/masterCurriculum';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Loader2,
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface SelectedUnit {
  systemKey: SystemKey;
  levelName: string;
  unitNumber: number;
  unitName: string;
}

export function CurriculumProgressDashboard() {
  const { data: progress, isLoading, refetch } = useCurriculumProgress();
  const [selectedUnits, setSelectedUnits] = useState<SelectedUnit[]>([]);
  const [expandedSystems, setExpandedSystems] = useState<string[]>(['kids', 'teen', 'adult']);

  const generator = useMultiUnitBulkGenerator();

  const getUnitKey = (unit: SelectedUnit) =>
    `${unit.systemKey}:${unit.levelName}:${unit.unitNumber}`;

  const isUnitSelected = (unit: UnitProgress) =>
    selectedUnits.some(
      (s) =>
        s.systemKey === unit.systemKey &&
        s.levelName === unit.levelName &&
        s.unitNumber === unit.unitNumber
    );

  const toggleUnitSelection = (unit: UnitProgress) => {
    if (isUnitSelected(unit)) {
      setSelectedUnits((prev) =>
        prev.filter(
          (s) =>
            !(
              s.systemKey === unit.systemKey &&
              s.levelName === unit.levelName &&
              s.unitNumber === unit.unitNumber
            )
        )
      );
    } else {
      setSelectedUnits((prev) => [
        ...prev,
        {
          systemKey: unit.systemKey,
          levelName: unit.levelName,
          unitNumber: unit.unitNumber,
          unitName: unit.unitName,
        },
      ]);
    }
  };

  const selectAllIncomplete = () => {
    if (!progress) return;
    const incompleteUnits: SelectedUnit[] = [];
    progress.systems.forEach((system) => {
      system.levels.forEach((level) => {
        level.units.forEach((unit) => {
          if (unit.percentage < 100) {
            incompleteUnits.push({
              systemKey: unit.systemKey,
              levelName: unit.levelName,
              unitNumber: unit.unitNumber,
              unitName: unit.unitName,
            });
          }
        });
      });
    });
    setSelectedUnits(incompleteUnits);
  };

  const clearSelection = () => setSelectedUnits([]);

  const pendingLessons = useMemo(() => {
    if (!progress) return [];
    return getPendingLessonsForUnits(progress, selectedUnits);
  }, [progress, selectedUnits]);

  const estimatedTimeMinutes = Math.ceil((pendingLessons.length * 20) / 60);

  const handleStartGeneration = () => {
    if (pendingLessons.length === 0) return;
    generator.initializeQueue(pendingLessons, selectedUnits);
    setTimeout(() => generator.startGeneration(), 100);
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>;
    }
    if (percentage > 0) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In Progress</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage > 0) return 'bg-yellow-500';
    return 'bg-muted-foreground/30';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Failed to load curriculum progress
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Curriculum Generation Progress
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-bold text-lg">
                {progress.overallGenerated}/{progress.overallTotal} lessons
              </span>
            </div>
            <Progress value={progress.overallPercentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              {progress.systems.map((system) => (
                <div
                  key={system.systemKey}
                  className="bg-background/50 rounded-lg p-3 border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{system.systemIcon}</span>
                    <span className="font-medium text-sm">{system.systemLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={system.percentage} 
                      className="h-2 flex-1" 
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {system.generatedLessons}/{system.totalLessons}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAllIncomplete}>
            Select All Incomplete
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {selectedUnits.length} units selected ({pendingLessons.length} lessons to generate)
        </span>
      </div>

      {/* Systems Accordion */}
      <Card>
        <CardContent className="p-0">
          <Accordion
            type="multiple"
            value={expandedSystems}
            onValueChange={setExpandedSystems}
          >
            {progress.systems.map((system) => (
              <AccordionItem key={system.systemKey} value={system.systemKey}>
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{system.systemIcon}</span>
                      <span className="font-semibold">{system.systemLabel}</span>
                      {getStatusBadge(system.percentage)}
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress
                        value={system.percentage}
                        className="w-32 h-2"
                      />
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {system.generatedLessons}/{system.totalLessons}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pl-8">
                    {system.levels.map((level) => (
                      <div key={level.levelName} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                          {level.levelName} ({level.cefrLevel})
                          <span className="ml-auto">
                            {level.generatedLessons}/{level.totalLessons}
                          </span>
                        </div>
                        <div className="space-y-1 pl-6">
                          {level.units.map((unit) => (
                            <div
                              key={`${unit.systemKey}-${unit.levelName}-${unit.unitNumber}`}
                              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                checked={isUnitSelected(unit)}
                                onCheckedChange={() => toggleUnitSelection(unit)}
                                disabled={unit.percentage >= 100 || generator.isProcessing}
                              />
                              <span className="flex-1 text-sm">
                                Unit {unit.unitNumber}: {unit.unitName}
                              </span>
                              <div className="flex items-center gap-2 w-40">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${getProgressColor(unit.percentage)}`}
                                    style={{ width: `${unit.percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-10 text-right">
                                  {unit.generatedLessons}/{unit.totalLessons}
                                </span>
                              </div>
                              {unit.percentage >= 100 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : unit.percentage > 0 ? (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Generation Controls */}
      {selectedUnits.length > 0 && !generator.isProcessing && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Ready to generate {pendingLessons.length} lessons from {selectedUnits.length} units
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Estimated time: ~{estimatedTimeMinutes} minutes (5s delay between lessons)
                </p>
              </div>
              <Button onClick={handleStartGeneration} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Generate All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Queue */}
      {generator.queue.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Generation Queue</CardTitle>
              <div className="flex items-center gap-2">
                {generator.isProcessing && !generator.isPaused && (
                  <Button variant="outline" size="sm" onClick={generator.pauseGeneration}>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
                {generator.isPaused && (
                  <Button variant="outline" size="sm" onClick={generator.resumeGeneration}>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                {generator.isProcessing && (
                  <Button variant="destructive" size="sm" onClick={generator.cancelGeneration}>
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                )}
                {!generator.isProcessing && (
                  <Button variant="ghost" size="sm" onClick={generator.resetQueue}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Queue Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {generator.completedCount} of {generator.totalInQueue} lessons
                  </span>
                  <span className="text-muted-foreground">
                    {generator.failedCount > 0 && (
                      <span className="text-destructive mr-2">
                        {generator.failedCount} failed
                      </span>
                    )}
                    {generator.isPaused && <span className="text-yellow-500">Paused</span>}
                  </span>
                </div>
                <Progress
                  value={(generator.completedCount / generator.totalInQueue) * 100}
                  className="h-2"
                />
              </div>

              {/* Unit Progress */}
              <div className="space-y-2">
                {generator.unitStatuses.map((unit) => (
                  <div
                    key={getUnitKey(unit)}
                    className="flex items-center gap-3 p-2 rounded bg-muted/50"
                  >
                    {unit.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : unit.status === 'generating' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : unit.status === 'failed' ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className="flex-1 text-sm">
                      Unit {unit.unitNumber}: {unit.unitName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {unit.completedLessons}/{unit.totalLessons}
                    </span>
                  </div>
                ))}
              </div>

              {/* Lesson Queue */}
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {generator.queue.map((item) => (
                    <div
                      key={item.lesson.uniqueKey}
                      className={`flex items-center gap-2 p-2 rounded text-sm ${
                        item.status === 'generating'
                          ? 'bg-primary/10 border border-primary/30'
                          : ''
                      }`}
                    >
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                      ) : item.status === 'generating' ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                      ) : item.status === 'failed' ? (
                        <XCircle className="h-3 w-3 text-destructive shrink-0" />
                      ) : item.status === 'skipped' ? (
                        <div className="h-3 w-3 rounded-full bg-muted-foreground/30 shrink-0" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-muted-foreground/50 shrink-0" />
                      )}
                      <span
                        className={`flex-1 truncate ${
                          item.status === 'skipped' ? 'text-muted-foreground line-through' : ''
                        }`}
                      >
                        L{item.lesson.lessonNumber}: {item.lesson.lessonTitle}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {item.lesson.lessonType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
