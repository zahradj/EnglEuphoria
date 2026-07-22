import React, { useState, useEffect } from "react";
import type { ContentCreatorTab } from '@/components/content-creator/ContentCreatorSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, Save, Trash2, Sparkles, HelpCircle, RefreshCw, Zap, BarChart3, Gamepad2 } from "lucide-react";
import { SystemSelector } from "./generator/SystemSelector";
import { LessonPreview } from "./generator/LessonPreview";
import { ArchitectResultPanel } from "@/components/architect";

import { LessonPicker, MasterLessonFlat } from "./generator/LessonPicker";
import { BulkLessonGenerator } from "./generator/BulkLessonGenerator";
import { GenerationHistoryPanel } from "./generator/GenerationHistoryPanel";
import { QualityDashboard } from "./generator/QualityDashboard";
import { IronGameGenerator } from "./generator/IronGameGenerator";
import { AdvancedLessonOptions, defaultAdvancedOptions, AdvancedOptions } from "./generator/AdvancedLessonOptions";
import { PipelineProgress } from "./generator/PipelineProgress";
import { useUnifiedLessonGenerator } from "@/hooks/useUnifiedLessonGenerator";
import { useN8nGenerator } from "@/hooks/useN8nGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";

interface CurriculumLevel {
  id: string;
  name: string;
  cefr_level: string;
  age_group: string;
  target_system?: string;
}

interface CurriculumUnit {
  id: string;
  title: string;
  unit_number: number;
  cefr_level: string;
  age_group: string;
}

interface NewLibraryProps {
  onNavigate?: (tab: ContentCreatorTab | string) => void;
  initialContext?: { system: string; level: string; ageGroup: string; levelId?: string } | null;
}

export const NewLibrary = ({ onNavigate, initialContext }: NewLibraryProps) => {
  const [topic, setTopic] = useState("");
  const [system, setSystem] = useState("kids");
  const [difficulty, setDifficulty] = useState("beginner");
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [levels, setLevels] = useState<CurriculumLevel[]>([]);
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [selectedMasterLesson, setSelectedMasterLesson] = useState<MasterLessonFlat | null>(null);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>(defaultAdvancedOptions);

  const queryClient = useQueryClient();

  // Unified generator for full pipeline (content + games + images)
  const {
    stages,
    overallProgress,
    isGenerating: isUnifiedGenerating,
    elapsedTime,
    generatedLesson: unifiedLesson,
    generateLesson: generateUnifiedLesson,
    cancelGeneration: cancelUnifiedGeneration,
    reset: resetUnifiedGenerator,
  } = useUnifiedLessonGenerator();

  // Legacy generator for backwards compatibility
  const {
    isGenerating: isLegacyGenerating,
    generatedLesson: legacyLesson,
    isSaving,
    editingLessonId,
    saveLesson,
    regenerateLesson,
    discardLesson,
    setEditing,
  } = useN8nGenerator();

  // Use unified generator results when available
  const isGenerating = isUnifiedGenerating || isLegacyGenerating;
  const generatedLesson = unifiedLesson || legacyLesson;

  useEffect(() => {
    fetchLevels();
    fetchUnits();
  }, []);

  // Auto-fill filters from curriculum context (Step 1)
  useEffect(() => {
    if (!initialContext) return;
    const systemMap: Record<string, string> = { kids: 'kids', teens: 'teens', adults: 'adults' };
    if (systemMap[initialContext.system]) setSystem(systemMap[initialContext.system]);
    if (initialContext.level) setDifficulty(initialContext.level);
    if (initialContext.levelId) setSelectedLevelId(initialContext.levelId);
  }, [initialContext]);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from("curriculum_levels")
        .select("id, name, cefr_level, age_group, target_system")
        .order("level_order", { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Failed to load curriculum levels");
    } finally {
      setIsLoadingLevels(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from("curriculum_units")
        .select("id, title, unit_number, cefr_level, age_group")
        .order("unit_number", { ascending: true });

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to load curriculum units");
    } finally {
      setIsLoadingUnits(false);
    }
  };

  // Map difficulty from level name
  const mapLevelToDifficulty = (levelName: string): string => {
    const lower = levelName.toLowerCase();
    if (lower.includes("beginner") || lower.includes("pre-a1") || lower.includes("a1")) {
      return "beginner";
    }
    if (lower.includes("intermediate") || lower.includes("a2") || lower.includes("b1")) {
      return "intermediate";
    }
    return "advanced";
  };

  // Handle lesson selection from master curriculum picker
  const handleMasterLessonSelect = (lesson: MasterLessonFlat | null, isGenerated: boolean) => {
    if (!lesson) return;

    setSelectedMasterLesson(lesson);
    
    // Auto-fill all fields from master curriculum data
    setTopic(lesson.lessonTitle);
    setSystem(lesson.system === "teen" ? "teens" : lesson.system);
    setLessonNumber(lesson.lessonNumber);
    setDifficulty(mapLevelToDifficulty(lesson.levelName));

    // Try to find matching level in database
    const matchingLevel = levels.find(
      (l) => l.target_system === lesson.system && 
             l.name.toLowerCase().includes(lesson.levelName.toLowerCase().split(" ")[0])
    );
    if (matchingLevel) {
      setSelectedLevelId(matchingLevel.id);
    }

    // Try to find matching unit in database
    const matchingUnit = units.find(
      (u) => u.unit_number === lesson.unitNumber && 
             u.title.toLowerCase() === lesson.unitName.toLowerCase()
    );
    if (matchingUnit) {
      setSelectedUnitId(matchingUnit.id);
    } else {
      setSelectedUnitId("none");
    }

    // Set editing mode if already generated
    if (isGenerated) {
      setEditing(lesson.uniqueKey);
      toast.info(`"${lesson.lessonTitle}" already exists - regenerate to update`);
    } else {
      setEditing(null);
      toast.success(`Selected: ${lesson.lessonTitle}`);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    const selectedLevel = levels.find((l) => l.id === selectedLevelId);
    const selectedUnit = units.find((u) => u.id === selectedUnitId);
    const mappedSystem = system === "teens" ? "teen" : system;

    // Use unified generator with advanced options
    await generateUnifiedLesson({
      topic: topic.trim(),
      system: mappedSystem,
      level: difficulty,
      cefrLevel: selectedLevel?.cefr_level || selectedMasterLesson?.cefrLevel || "A1",
      durationMinutes: durationMinutes,
      ageGroup: mappedSystem === "kids" ? "6-10" : mappedSystem === "teen" ? "11-17" : "18+",
      advancedOptions,
    });
  };

  const handleSave = async () => {
    const selectedLevel = levels.find((l) => l.id === selectedLevelId);
    const selectedUnit = units.find((u) => u.id === selectedUnitId);
    const params = {
      topic: topic.trim(),
      system: system === "teens" ? "teen" : system,
      level: difficulty,
      levelId: selectedLevelId || undefined,
      cefrLevel: selectedLevel?.cefr_level || selectedMasterLesson?.cefrLevel || "A1",
      unitId: selectedUnitId && selectedUnitId !== "none" ? selectedUnitId : undefined,
      lessonNumber: lessonNumber,
      lessonType: selectedMasterLesson?.lessonType,
      unitName: selectedMasterLesson?.unitName || selectedUnit?.title,
      levelName: selectedMasterLesson?.levelName || selectedLevel?.name,
      durationMinutes: durationMinutes,
    };

    let savedLesson;
    if (editingLessonId) {
      savedLesson = await regenerateLesson(editingLessonId, params);
    } else {
      savedLesson = await saveLesson(params);
    }

    if (savedLesson) {
      // Invalidate queries to refresh the lesson picker and library
      queryClient.invalidateQueries({ queryKey: ["generated-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["curriculum-lessons-picker"] });
      queryClient.invalidateQueries({ queryKey: ["curriculum-lessons-library"] });
      
      // Clear selection after save
      setSelectedMasterLesson(null);

      // Show toast with navigation action
      toast.success(`Lesson "${savedLesson.title}" saved successfully!`, {
        description: "Your lesson is now in the Curriculum Library",
        action: {
          label: "View Lesson",
          onClick: () => onNavigate?.("lesson-editor"),
        },
        duration: 5000,
      });

      // Auto-navigate after a brief delay
      setTimeout(() => {
        onNavigate?.("lesson-editor");
      }, 1500);
    }
  };

  const handleClearSelection = () => {
    setSelectedMasterLesson(null);
    setEditing(null);
    setTopic("");
    setSelectedLevelId("");
    setSelectedUnitId("");
    setLessonNumber(1);
  };

  const filteredLevels = levels.filter((level) => {
    const mappedSystem = system === "teens" ? "teen" : system;
    return level.target_system === mappedSystem;
  });

  const filteredUnits = units.filter((unit) => {
    if (system === "kids") {
      return unit.age_group.includes("Kids") || unit.age_group.includes("6-10");
    }
    if (system === "teens") {
      return unit.age_group.includes("Teen") || unit.age_group.includes("11-17");
    }
    return unit.age_group.includes("Adult") || unit.age_group.includes("18+");
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Lesson Generator
          </h1>
          <p className="text-muted-foreground">
            Generate curriculum-aligned lessons powered by AI
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>
                Select a lesson from the Master Curriculum to auto-fill all fields.
                Generated lessons are marked with a checkmark.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Single Lesson
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Bulk Generate
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Games
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="mt-6">
          <BulkLessonGenerator />
        </TabsContent>

        <TabsContent value="quality" className="mt-6">
          <QualityDashboard />
        </TabsContent>

        <TabsContent value="games" className="mt-6">
          <IronGameGenerator onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="single" className="mt-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson Picker Panel */}
        <div className="lg:col-span-1">
          <LessonPicker
            system={system}
            onSelectLesson={handleMasterLessonSelect}
            selectedLessonKey={selectedMasterLesson?.uniqueKey}
          />
        </div>

        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Lesson Configuration</CardTitle>
            <CardDescription>
              {selectedMasterLesson 
                ? "Auto-filled from Master Curriculum" 
                : "Select a lesson from the picker or configure manually"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Lesson Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Present Continuous, Modal Verbs, Conditionals"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <SystemSelector value={system} onChange={setSystem} />

            <div className="space-y-2">
              <Label htmlFor="level">Curriculum Level</Label>
              <Select
                value={selectedLevelId}
                onValueChange={setSelectedLevelId}
                disabled={isLoadingLevels}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder={isLoadingLevels ? "Loading..." : "Select level"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} ({level.cefr_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={selectedUnitId}
                onValueChange={setSelectedUnitId}
                disabled={isLoadingUnits}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder={isLoadingUnits ? "Loading..." : "Select unit (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No unit (optional)</SelectItem>
                  {filteredUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unit {unit.unit_number}: {unit.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonNumber">Lesson Number</Label>
              <Input
                id="lessonNumber"
                type="number"
                min={1}
                value={lessonNumber}
                onChange={(e) => setLessonNumber(parseInt(e.target.value) || 1)}
                placeholder="e.g., 1, 2, 3..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Lesson Duration</Label>
              <Select value={durationMinutes.toString()} onValueChange={(v) => setDurationMinutes(parseInt(v))}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes (~20 slides)</SelectItem>
                  <SelectItem value="45">45 minutes (~30 slides)</SelectItem>
                  <SelectItem value="60">60 minutes (~40 slides)</SelectItem>
                  <SelectItem value="90">90 minutes (~60 slides)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Options - Games & Images */}
            <AdvancedLessonOptions
              options={advancedOptions}
              onChange={setAdvancedOptions}
              disabled={isGenerating}
            />

            {selectedMasterLesson && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">From Master: </span>
                    <span className="font-medium text-primary">
                      {selectedMasterLesson.levelName} → Unit {selectedMasterLesson.unitNumber}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : editingLessonId ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Lesson
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Lesson
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Generated Preview</CardTitle>
            <CardDescription>
              Review and approve generated content before saving
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {isGenerating ? (
              <PipelineProgress
                stages={stages}
                overallProgress={overallProgress}
                isGenerating={isGenerating}
                elapsedTime={elapsedTime}
                onCancel={cancelUnifiedGeneration}
              />
            ) : generatedLesson ? (
              <div className="flex flex-col h-full">
                {/* Scrollable preview area */}
                <div className="flex-1 overflow-y-auto max-h-[400px] mb-4 space-y-4">
                  <LessonPreview data={generatedLesson} system={system} />
                  <ArchitectResultPanel
                    result={
                      ((generatedLesson as unknown) as {
                        architect?: import('@/architect').ArchitectResult | null;
                        metadata?: { architect?: import('@/architect').ArchitectResult };
                      })?.architect ??
                      ((generatedLesson as unknown) as {
                        metadata?: { architect?: import('@/architect').ArchitectResult };
                      })?.metadata?.architect ??
                      null
                    }
                  />

                </div>

                
                {/* Fixed action buttons - always visible */}
                <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-background">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      resetUnifiedGenerator();
                      discardLesson();
                    }}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Discard
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingLessonId ? "Updating..." : "Saving..."}
                      </>
                    ) : editingLessonId ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update Lesson
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save to Curriculum
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                <p>Generated lesson will appear here</p>
                <p className="text-sm">
                  {selectedMasterLesson 
                    ? "Click Generate to create this lesson" 
                    : "Select a lesson from the picker to begin"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generation History Panel */}
      <div className="mt-6">
        <GenerationHistoryPanel />
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
