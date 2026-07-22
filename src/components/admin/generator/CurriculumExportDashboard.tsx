import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Package, 
  Download, 
  FileArchive, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Layers,
  Clock,
  HardDrive,
  Eye,
  ClipboardCheck
} from 'lucide-react';
import { useCurriculumProgress, SystemProgress, UnitProgress } from '@/hooks/useCurriculumProgress';
import { useCurriculumExport, ExportFormat, ExportHistoryItem } from '@/hooks/useCurriculumExport';
import { supabase } from '@/integrations/supabase/client';
import { LMSPreviewPlayer } from '@/components/admin/preview/LMSPreviewPlayer';
import { LessonQualityChecker } from '@/components/admin/quality/LessonQualityChecker';

interface LessonSlide {
  id: string;
  type: string;
  title?: string;
  content?: any;
  phase?: 'presentation' | 'practice' | 'production';
  teacherNotes?: string;
}

interface LessonWithId {
  id: string;
  title: string;
  unitKey: string;
  levelKey: string;
  systemKey: string;
}

export function CurriculumExportDashboard() {
  const { data: curriculumProgress, isLoading: isLoadingProgress, refetch: refresh } = useCurriculumProgress();
  const { 
    isExporting, 
    progress: exportProgress, 
    currentStep, 
    exportHistory,
    exportLessons, 
    loadExportHistory,
    downloadHistoryItem 
  } = useCurriculumExport();

  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('scorm');
  const [packageName, setPackageName] = useState('EnglEuphoria_Curriculum');
  const [courseTitle, setCourseTitle] = useState('EnglEuphoria English Course');
  const [includeTeacherNotes, setIncludeTeacherNotes] = useState(true);
  const [includeAnswerKeys, setIncludeAnswerKeys] = useState(true);
  const [generatedLessons, setGeneratedLessons] = useState<LessonWithId[]>([]);
  const [previewLesson, setPreviewLesson] = useState<{
    id: string;
    title: string;
    slides: LessonSlide[];
    targetSystem?: string;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [qualityCheckLesson, setQualityCheckLesson] = useState<{
    title: string;
    slides: LessonSlide[];
  } | null>(null);

  const handleQualityCheck = async (lessonId: string, lessonTitle: string) => {
    try {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, content')
        .eq('id', lessonId)
        .single();
      if (error) throw error;
      const content = data.content as { screens?: any[] } | null;
      const slides = content?.screens || [];
      setQualityCheckLesson({
        title: data.title,
        slides: slides.map((s: any, idx: number) => ({
          id: s.id || `slide-${idx}`,
          type: s.screenType || s.type || 'unknown',
          title: s.title,
          content: s.content || s,
        })),
      });
    } catch (error) {
      console.error('Failed to load lesson for quality check:', error);
    }
  };

  const handlePreviewLesson = async (lessonId: string) => {
    setIsLoadingPreview(true);
    try {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, content, target_system')
        .eq('id', lessonId)
        .single();
      if (error) throw error;
      const content = data.content as { screens?: any[] } | null;
      const slides = content?.screens || [];
      setPreviewLesson({
        id: data.id,
        title: data.title,
        slides: slides.map((s: any, idx: number) => ({
          id: s.id || `slide-${idx}`,
          type: s.screenType || s.type || 'unknown',
          title: s.title,
          content: s.content || s,
          phase: s.phase,
          teacherNotes: s.teacherNotes
        })),
        targetSystem: data.target_system
      });
    } catch (error) {
      console.error('Failed to load lesson for preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Load generated lessons from database
  useEffect(() => {
    async function loadGeneratedLessons() {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, target_system')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setGeneratedLessons(data.map(l => ({
          id: l.id,
          title: l.title,
          unitKey: 'unit-1',
          levelKey: 'level-1',
          systemKey: l.target_system
        })));
      }
    }
    loadGeneratedLessons();
    loadExportHistory();
  }, [loadExportHistory]);

  const handleSelectUnit = (systemKey: string, levelKey: string, unitIndex: number, select: boolean) => {
    const matchingLessons = generatedLessons.filter(l => l.systemKey === systemKey);
    const newSelected = new Set(selectedLessons);
    
    matchingLessons.forEach(lesson => {
      if (select) {
        newSelected.add(lesson.id);
      } else {
        newSelected.delete(lesson.id);
      }
    });
    
    setSelectedLessons(newSelected);
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedLessons(new Set(generatedLessons.map(l => l.id)));
    } else {
      setSelectedLessons(new Set());
    }
  };

  const handleExport = async () => {
    const lessonIds = Array.from(selectedLessons);
    await exportLessons(lessonIds, selectedFormat, {
      packageName,
      courseTitle,
      includeTeacherNotes,
      includeAnswerKeys
    });
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'scorm': return <FileArchive className="h-4 w-4" />;
      case 'h5p': return <Layers className="h-4 w-4" />;
      case 'html5': return <FileCode className="h-4 w-4" />;
    }
  };

  const systemIcons: Record<string, string> = {
    kids: '🎨',
    teens: '📚',
    adults: '💼'
  };

  const systemLabels: Record<string, string> = {
    kids: 'Playground (Kids)',
    teens: 'The Academy (Teens)',
    adults: 'The Hub (Adults)'
  };

  if (isLoadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Curriculum Export
          </h1>
          <p className="text-muted-foreground mt-1">
            Export generated lessons as SCORM, H5P, or HTML5 packages for LMS integration
          </p>
        </div>
        <Button variant="outline" onClick={() => refresh()}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson Selection */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Select Lessons to Export</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedLessons.size === generatedLessons.length && generatedLessons.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <Label htmlFor="select-all" className="text-sm">
                  Select All ({generatedLessons.length} lessons)
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {curriculumProgress?.systems.map((system: SystemProgress) => {
                const systemLessons = generatedLessons.filter(l => l.systemKey === system.systemKey);
                const selectedCount = systemLessons.filter(l => selectedLessons.has(l.id)).length;

                return (
                  <Accordion type="single" collapsible key={system.systemKey} className="mb-2">
                    <AccordionItem value={system.systemKey} className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-xl">{systemIcons[system.systemKey]}</span>
                          <span className="font-medium">{systemLabels[system.systemKey] || system.systemLabel}</span>
                          <div className="flex-1" />
                          <Badge variant={selectedCount > 0 ? "default" : "secondary"}>
                            {selectedCount}/{systemLessons.length} selected
                          </Badge>
                          {system.generatedLessons === system.totalLessons ? (
                            <Badge className="bg-green-500/10 text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          ) : system.generatedLessons > 0 ? (
                            <Badge className="bg-yellow-500/10 text-yellow-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Partial
                            </Badge>
                          ) : (
                            <Badge variant="outline">No lessons</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {system.levels.map((level, levelIdx) => (
                          <div key={levelIdx} className="mb-4 last:mb-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {level.cefrLevel}
                              </Badge>
                              <span className="text-sm font-medium">{level.levelName}</span>
                            </div>
                            
                            {level.units.map((unit: UnitProgress, unitIdx) => {
                              const unitLessons = systemLessons.slice(unitIdx * 4, (unitIdx + 1) * 4);
                              const unitSelectedCount = unitLessons.filter(l => selectedLessons.has(l.id)).length;
                              const allSelected = unitSelectedCount === unitLessons.length && unitLessons.length > 0;

                              return (
                                <div 
                                  key={unitIdx}
                                  className="flex items-center gap-3 py-2 px-3 bg-muted/50 rounded-lg mb-2"
                                >
                                  <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => 
                                      handleSelectUnit(system.systemKey, level.levelName, unitIdx, !!checked)
                                    }
                                    disabled={unitLessons.length === 0}
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm">
                                      Unit {unit.unitNumber}: {unit.unitName}
                                    </span>
                                  </div>
                                  <Progress 
                                    value={unit.percentage} 
                                    className="w-24 h-2"
                                  />
                                  <span className="text-xs text-muted-foreground w-12 text-right">
                                    {unit.generatedLessons}/{unit.totalLessons}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ))}

                        {/* Individual lessons */}
                        <div className="mt-4 border-t pt-4">
                          <Label className="text-sm text-muted-foreground mb-2 block">
                            Individual Lessons:
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                            {systemLessons.map(lesson => (
                              <div 
                                key={lesson.id}
                                className="flex items-center gap-2 p-2 bg-background rounded border"
                              >
                                <Checkbox
                                  checked={selectedLessons.has(lesson.id)}
                                  onCheckedChange={(checked) => {
                                    const newSelected = new Set(selectedLessons);
                                    if (checked) {
                                      newSelected.add(lesson.id);
                                    } else {
                                      newSelected.delete(lesson.id);
                                    }
                                    setSelectedLessons(newSelected);
                                  }}
                                />
                                <span className="text-xs truncate flex-1">{lesson.title}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => handlePreviewLesson(lesson.id)}
                                  disabled={isLoadingPreview}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Preview</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => handleQualityCheck(lesson.id, lesson.title)}
                                >
                                  <ClipboardCheck className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Check</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { value: 'scorm', label: 'SCORM 2004', desc: 'Full LMS tracking (Moodle, Canvas, Blackboard)' },
                { value: 'h5p', label: 'H5P Package', desc: 'Interactive content (Moodle, WordPress)' },
                { value: 'html5', label: 'HTML5 Bundle', desc: 'Standalone web package (offline use)' }
              ].map(format => (
                <div
                  key={format.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedFormat === format.value 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setSelectedFormat(format.value as ExportFormat)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedFormat === format.value ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {selectedFormat === format.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    {getFormatIcon(format.value as ExportFormat)}
                    <span className="font-medium">{format.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{format.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="packageName">Package Name</Label>
                <Input
                  id="packageName"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="EnglEuphoria_Curriculum"
                />
              </div>
              <div>
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="EnglEuphoria English Course"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="teacherNotes"
                  checked={includeTeacherNotes}
                  onCheckedChange={(checked) => setIncludeTeacherNotes(!!checked)}
                />
                <Label htmlFor="teacherNotes">Include teacher notes</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="answerKeys"
                  checked={includeAnswerKeys}
                  onCheckedChange={(checked) => setIncludeAnswerKeys(!!checked)}
                />
                <Label htmlFor="answerKeys">Include answer keys</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Selected Lessons:</span>
                <span className="font-medium">{selectedLessons.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium">{selectedFormat.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Size:</span>
                <span className="font-medium">~{Math.max(1, selectedLessons.size * 0.5).toFixed(1)} MB</span>
              </div>

              {isExporting && (
                <div className="space-y-2 pt-2">
                  <Progress value={exportProgress} />
                  <p className="text-xs text-muted-foreground text-center">{currentStep}</p>
                </div>
              )}

              <Button 
                className="w-full mt-4" 
                size="lg"
                onClick={handleExport}
                disabled={selectedLessons.size === 0 || isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Package
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No exports yet. Create your first export above!
            </p>
          ) : (
            <div className="space-y-2">
              {exportHistory.map((item: ExportHistoryItem) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                >
                  {getFormatIcon(item.format)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="uppercase text-xs">
                    {item.format}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileArchive className="h-3 w-3" />
                    {item.lesson_count} lessons
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <HardDrive className="h-3 w-3" />
                    {formatBytes(item.file_size_bytes)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadHistoryItem(item)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* LMS Preview Player */}
      {previewLesson && (
        <LMSPreviewPlayer
          lesson={previewLesson}
          format={selectedFormat}
          onClose={() => setPreviewLesson(null)}
          showTeacherNotes={includeTeacherNotes}
        />
      )}

      {/* Quality Checker Dialog */}
      {qualityCheckLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Lesson Quality Check</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setQualityCheckLesson(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <LessonQualityChecker 
                lessonTitle={qualityCheckLesson.title}
                slides={qualityCheckLesson.slides}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
