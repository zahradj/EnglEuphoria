import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BookOpen, Play, FolderOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBulkGenerator, BulkLessonItem } from '@/hooks/useBulkGenerator';
import { BulkGeneratorQueue } from '@/components/admin/generator/BulkGeneratorQueue';
import { BulkLessonPreview } from '@/components/admin/generator/BulkLessonPreview';

export const BulkCurriculumGenerator = () => {
  const [selectedSystem, setSelectedSystem] = useState<string>('teen');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  const {
    queue,
    isRunning,
    isPaused,
    currentIndex,
    selectedLessonId,
    initializeQueue,
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    cancelGeneration,
    saveSingleLesson,
    saveAllLessons,
    getSelectedLesson,
    setSelectedLessonId,
  } = useBulkGenerator();

  // Fetch levels
  const { data: levels = [] } = useQuery({
    queryKey: ['curriculum-levels-bulk', selectedSystem],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_levels')
        .select('id, name, cefr_level, level_order')
        .eq('target_system', selectedSystem)
        .order('level_order');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch units for selected level
  const { data: units = [] } = useQuery({
    queryKey: ['curriculum-units-bulk', selectedLevelId],
    queryFn: async () => {
      if (!selectedLevelId) return [];
      
      // Get the level's CEFR level first
      const { data: level } = await supabase
        .from('curriculum_levels')
        .select('cefr_level')
        .eq('id', selectedLevelId)
        .single();

      if (!level) return [];

      const { data, error } = await supabase
        .from('curriculum_units')
        .select('id, title, unit_number, cefr_level')
        .eq('cefr_level', level.cefr_level)
        .order('unit_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedLevelId,
  });

  // Fetch lessons for selected unit (to know what to generate)
  const { data: unitLessons = [] } = useQuery({
    queryKey: ['unit-lessons-bulk', selectedUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return [];
      
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, sequence_order')
        .eq('unit_id', selectedUnitId)
        .order('sequence_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedUnitId,
  });

  // Get selected level and unit details
  const selectedLevel = levels.find(l => l.id === selectedLevelId);
  const selectedUnit = units.find(u => u.id === selectedUnitId);

  // Build lesson topics for the unit
  const buildLessonTopics = () => {
    if (!selectedUnit || !selectedLevel) return [];

    // Define topic templates based on unit
    const unitTopics = [
      `Introduction to ${selectedUnit.title}`,
      `Key Vocabulary for ${selectedUnit.title}`,
      `Grammar Focus: ${selectedUnit.title}`,
      `Conversation Practice: ${selectedUnit.title}`,
      `Reading Comprehension: ${selectedUnit.title}`,
      `Listening Skills: ${selectedUnit.title}`,
      `Writing Practice: ${selectedUnit.title}`,
      `Speaking Activities: ${selectedUnit.title}`,
      `Review and Practice: ${selectedUnit.title}`,
      `Unit Assessment: ${selectedUnit.title}`,
    ];

    return unitTopics.map((topic, index) => ({
      topic,
      system: selectedSystem,
      level: selectedLevel.cefr_level.toLowerCase(),
      levelId: selectedLevelId,
      cefrLevel: selectedLevel.cefr_level,
      unitId: selectedUnitId,
      unitName: selectedUnit.title,
      levelName: selectedLevel.name,
      lessonNumber: index + 1,
      durationMinutes: 60,
    }));
  };

  const handleInitializeQueue = () => {
    const topics = buildLessonTopics();
    if (topics.length === 0) {
      return;
    }
    initializeQueue(topics);
  };

  const handleSaveLesson = async (lessonId: string) => {
    setIsSavingLesson(true);
    await saveSingleLesson(lessonId);
    setIsSavingLesson(false);
  };

  const selectedLesson = getSelectedLesson();

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Bulk Lesson Generator
          </CardTitle>
          <CardDescription>
            Generate all lessons for a curriculum unit sequentially
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* System & Level Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>System</Label>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kids">Kids (5-11)</SelectItem>
                  <SelectItem value="teen">Teens (12-17)</SelectItem>
                  <SelectItem value="adult">Adults (18+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select 
                value={selectedLevelId} 
                onValueChange={(value) => {
                  setSelectedLevelId(value);
                  setSelectedUnitId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} ({level.cefr_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select 
                value={selectedUnitId} 
                onValueChange={setSelectedUnitId}
                disabled={!selectedLevelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unit {unit.unit_number}: {unit.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Unit Info & Initialize Button */}
          {selectedUnit && selectedLevel && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedUnit.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLevel.name} • {selectedLevel.cefr_level} • 10 lessons
                  </p>
                </div>
                {unitLessons.length > 0 && (
                  <Badge variant="secondary">
                    {unitLessons.length} existing lessons
                  </Badge>
                )}
              </div>
              <Button 
                onClick={handleInitializeQueue}
                disabled={isRunning || queue.length > 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Initialize Queue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue and Preview Grid */}
      {queue.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue Panel */}
          <BulkGeneratorQueue
            queue={queue}
            isRunning={isRunning}
            isPaused={isPaused}
            currentIndex={currentIndex}
            selectedLessonId={selectedLessonId}
            onStart={startGeneration}
            onPause={pauseGeneration}
            onResume={resumeGeneration}
            onCancel={cancelGeneration}
            onSelectLesson={setSelectedLessonId}
            onSaveLesson={handleSaveLesson}
            onSaveAll={saveAllLessons}
          />

          {/* Preview Panel */}
          <BulkLessonPreview
            lesson={selectedLesson || null}
            onSave={() => selectedLessonId && handleSaveLesson(selectedLessonId)}
            isSaving={isSavingLesson}
          />
        </div>
      )}

      {/* Empty State */}
      {queue.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No lessons in queue</p>
            <p>Select a system, level, and unit above, then click "Initialize Queue" to start</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
