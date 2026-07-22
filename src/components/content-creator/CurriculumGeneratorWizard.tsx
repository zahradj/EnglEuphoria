import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Wand2, ChevronDown, ChevronRight, Save, BookOpen, GraduationCap, Edit2, Check, X, Link, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  getSpiralSkeleton,
  buildFullCurriculumMapContext,
  skeletonToGeneratedUnit,
  validateAndEnforceProgression,
  type SkeletonGeneratedUnit,
  type SkeletonGeneratedLesson,
} from '@/data/spiralCurriculumSkeleton';
import {
  generateCefrRoadmap,
  bindWorlds,
  computeMetrics,
  type ThemedUnitSpec,
  type CurriculumMetrics,
} from '@/curriculum';
import { WorldMapPreview } from './WorldMapPreview';
import { CurriculumMetricsPanel } from './CurriculumMetricsPanel';

type GeneratedUnit = SkeletonGeneratedUnit;
type GeneratedLesson = SkeletonGeneratedLesson;

interface CurriculumConfig {
  level: string;
  ageGroup: string;
  unitCount: number;
  lessonsPerUnit: number;
}

const LEVELS = [
  { value: 'pre-a1', label: 'Pre-A1 (Pre-Beginner — Visual & Audio only)' },
  { value: 'beginner', label: 'Beginner (A1)' },
  { value: 'elementary', label: 'Elementary (A2)' },
  { value: 'pre-intermediate', label: 'Pre-Intermediate (A2+/B1)' },
  { value: 'intermediate', label: 'Intermediate (B1/B2)' },
];

const AGE_GROUPS = [
  { value: 'kids', label: 'Kids (5-10)' },
  { value: 'teens', label: 'Teens (11-17)' },
  { value: 'adults', label: 'Adults (18+)' },
];

const AGE_GROUP_TO_DB_TARGET_SYSTEM: Record<string, string> = {
  kids: 'kids',
  teens: 'teen',
  adults: 'adult',
};

const AGE_GROUP_TO_HUB_SYSTEM: Record<string, string> = {
  kids: 'playground',
  teens: 'academy',
  adults: 'professional',
};

interface CurriculumGeneratorWizardProps {
  onCurriculumGenerated?: (ctx: { system: string; level: string; ageGroup: string }) => void;
}

export const CurriculumGeneratorWizard: React.FC<CurriculumGeneratorWizardProps> = ({ onCurriculumGenerated }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<CurriculumConfig>({
    level: '',
    ageGroup: '',
    unitCount: 4,
    lessonsPerUnit: 6,
  });
  const [generatedUnits, setGeneratedUnits] = useState<GeneratedUnit[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openUnits, setOpenUnits] = useState<Set<number>>(new Set());
  const [editingLesson, setEditingLesson] = useState<{ unitIdx: number; lessonIdx: number } | null>(null);
  const [editBuffer, setEditBuffer] = useState<GeneratedLesson | null>(null);

  const [worldSpecs, setWorldSpecs] = useState<ThemedUnitSpec[]>([]);
  const [metrics, setMetrics] = useState<CurriculumMetrics | null>(null);

  const canGenerate = config.level && config.ageGroup && config.unitCount > 0 && config.lessonsPerUnit > 0;

  // ─── SKELETON-FIRST GENERATION ──────────────────────────────────
  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setGeneratedUnits([]);
    setWorldSpecs([]);
    setMetrics(null);

    // CEFR-first: build the pure pedagogy roadmap, then rotate worlds onto it.
    // Currently seeded for kids + beginner (A1 Playground); other combos skip.
    let themed: ThemedUnitSpec[] = [];
    if (config.ageGroup === 'kids' && config.level === 'beginner') {
      const roadmap = generateCefrRoadmap('playground', 'A1');
      themed = bindWorlds(roadmap).slice(0, config.unitCount);
      setWorldSpecs(themed);
      setMetrics(computeMetrics(roadmap, themed));
    }

    // 1. Load the skeleton for the selected age group
    const skeleton = getSpiralSkeleton(config.ageGroup, config.level);
    const slicedSkeleton = skeleton.slice(0, config.unitCount);

    try {
      // 2. Ask AI to DECORATE the skeleton (not invent structure)
      const spiralContext = buildFullCurriculumMapContext(slicedSkeleton);

      const { data, error } = await supabase.functions.invoke('curriculum-expert-agent', {
        body: {
          mode: 'curriculum_structure',
          level: config.level,
          ageGroup: config.ageGroup,
          unitCount: config.unitCount,
          lessonsPerUnit: config.lessonsPerUnit,
          spiralDependencyContext: spiralContext,
        },
      });

      if (error) throw error;

      // 3. Parse AI response
      const content = data?.content || data?.result || data;
      let aiUnits: any[] = [];

      if (typeof content === 'string') {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiUnits = JSON.parse(jsonMatch[0]);
        }
      } else if (Array.isArray(content)) {
        aiUnits = content;
      } else if (content?.units) {
        aiUnits = content.units;
      }

      // 4. VALIDATE & ENFORCE: merge AI creative content with skeleton structure
      // Now matches by unitNumber/lessonNumber, not array index
      const validated = validateAndEnforceProgression(aiUnits, skeleton, config.unitCount);
      
      // Trim lessons per unit
      const trimmed = validated.map(u => ({
        ...u,
        lessons: u.lessons.slice(0, config.lessonsPerUnit),
      }));

      setGeneratedUnits(trimmed);
      setOpenUnits(new Set(trimmed.map((_, i) => i)));
      toast.success(`Generated ${trimmed.length} progressive units with dependency links!`);
    } catch (err: any) {
      console.error('Curriculum generation error:', err);
      
      // 5. FALLBACK: skeleton itself IS the fallback — no random themes
      const fallback = generateSkeletonFallback(slicedSkeleton);
      setGeneratedUnits(fallback);
      setOpenUnits(new Set(fallback.map((_, i) => i)));
      toast.info('Generated progressive curriculum from skeleton (offline mode)');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── SKELETON-BASED FALLBACK (replaces old random themes) ───────
  const generateSkeletonFallback = (slicedSkeleton: ReturnType<typeof getSpiralSkeleton>): GeneratedUnit[] => {
    return slicedSkeleton.map((skelUnit, i) => {
      const prevUnit = i > 0 ? slicedSkeleton[i - 1] : null;
      const generated = skeletonToGeneratedUnit(skelUnit, prevUnit, config.lessonsPerUnit);
      return {
        ...generated,
        lessons: generated.lessons.slice(0, config.lessonsPerUnit),
      };
    });
  };

  const toggleUnit = (idx: number) => {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const startEdit = (unitIdx: number, lessonIdx: number) => {
    setEditingLesson({ unitIdx, lessonIdx });
    setEditBuffer({ ...generatedUnits[unitIdx].lessons[lessonIdx] });
  };

  const cancelEdit = () => {
    setEditingLesson(null);
    setEditBuffer(null);
  };

  const saveEdit = () => {
    if (!editingLesson || !editBuffer) return;
    setGeneratedUnits((prev) =>
      prev.map((unit, ui) =>
        ui === editingLesson.unitIdx
          ? {
              ...unit,
              lessons: unit.lessons.map((lesson, li) =>
                li === editingLesson.lessonIdx ? editBuffer : lesson
              ),
            }
          : unit
      )
    );
    setEditingLesson(null);
    setEditBuffer(null);
    toast.success('Lesson updated');
  };

  const handleSaveToDB = async () => {
    if (generatedUnits.length === 0) return;
    setIsSaving(true);

    try {
      const dbTargetSystem = AGE_GROUP_TO_DB_TARGET_SYSTEM[config.ageGroup] || 'kids';
      const hubSystem = AGE_GROUP_TO_HUB_SYSTEM[config.ageGroup] || 'playground';

      const unitCefrLevel = config.level === 'pre-a1'
        ? 'Pre-A1'
        : config.level === 'beginner'
          ? 'A1'
          : config.level === 'elementary'
            ? 'A2'
            : config.level === 'pre-intermediate'
              ? 'B1'
              : 'B2';

      const lessonDifficultyLevel = (config.level === 'pre-a1' || config.level === 'beginner' || config.level === 'elementary')
        ? 'beginner'
        : config.level === 'pre-intermediate'
          ? 'intermediate'
          : 'advanced';

      const { data: levelOptions, error: levelsError } = await supabase
        .from('curriculum_levels')
        .select('id, cefr_level, level_order')
        .eq('target_system', dbTargetSystem)
        .order('level_order');

      if (levelsError) throw levelsError;

      const matchingLevel = (levelOptions || []).find((level) => (
        level.cefr_level === unitCefrLevel ||
        level.cefr_level.startsWith(unitCefrLevel) ||
        unitCefrLevel.startsWith(level.cefr_level)
      )) || levelOptions?.[0] || null;

      // ─── DUPLICATE PREVENTION: Check for existing units ─────────
      const { data: existingUnits } = await supabase
        .from('curriculum_units')
        .select('id, unit_number')
        .eq('age_group', config.ageGroup)
        .eq('cefr_level', unitCefrLevel);

      const existingUnitNumbers = new Set((existingUnits || []).map(u => u.unit_number));

      let savedCount = 0;
      let skippedCount = 0;

      for (const unit of generatedUnits) {
        // Skip if a unit with this number already exists for this context
        if (existingUnitNumbers.has(unit.unitNumber)) {
          console.warn(`⚠️ Unit ${unit.unitNumber} already exists for ${config.ageGroup}/${unitCefrLevel} — skipping`);
          skippedCount++;
          continue;
        }

        // Match world skin by unit number (worldSpecs is 0-indexed by bucket).
        const worldMatch = worldSpecs.find((s) => s.bucket.unitNumber === unit.unitNumber);

        // Build unit_data manifest
        const unitManifest = {
          anchorPhoneme: unit.anchorPhoneme,
          grammarGoal: unit.grammarGoal,
          prerequisiteUnit: unit.prerequisiteUnit,
          skillsMix: unit.skillsMix,
          world: worldMatch ? {
            slug: worldMatch.world.slug,
            name: worldMatch.world.name,
            emotionalTone: worldMatch.world.emotionalTone,
            gameplayIdentity: worldMatch.world.gameplayIdentity,
            mascots: worldMatch.world.mascots,
            palette: worldMatch.world.palette,
          } : null,
          generatedAt: new Date().toISOString(),
        };

        // Resolve world_id (DB-side) by slug if we bound a world.
        let worldId: string | null = null;
        if (worldMatch) {
          const { data: wRow } = await supabase
            .from('curriculum_worlds')
            .select('id')
            .eq('slug', worldMatch.world.slug)
            .maybeSingle();
          worldId = (wRow as any)?.id ?? null;
        }

        const { data: unitData, error: unitError } = await supabase
          .from('curriculum_units')
          .insert({
            title: worldMatch ? worldMatch.themedTitle : unit.title,
            unit_number: unit.unitNumber,
            age_group: config.ageGroup,
            cefr_level: unitCefrLevel,
            learning_objectives: unit.lessons.flatMap(l => l.objectives || []),
            unit_data: unitManifest,
            created_by: user?.id || null,
          })
          .select()
          .single();

        if (unitError) throw unitError;

        const lessonInserts = unit.lessons.map((lesson) => ({
          title: lesson.title,
          unit_id: unitData.id,
          level_id: matchingLevel?.id || null,
          target_system: dbTargetSystem,
          difficulty_level: lessonDifficultyLevel,
          sequence_order: lesson.lessonNumber,
          duration_minutes: 30,
          created_by: user?.id || null,
          cycle_type: lesson.cycleType || null,
          phonics_focus: lesson.phonicsFocus || null,
          vocabulary_list: lesson.vocabularyList || [],
          grammar_pattern: lesson.grammarPattern || null,
          skills_focus: lesson.skillsFocus || [],
          content: {
            objectives: lesson.objectives,
            grammarFocus: lesson.grammarFocus,
            vocabularyTheme: lesson.vocabularyTheme,
            cefrLevel: unitCefrLevel,
            sourceLevel: config.level,
            hub: hubSystem,
            dbTargetSystem,
            anchorPhoneme: unit.anchorPhoneme || null,
            grammarGoal: unit.grammarGoal || null,
            prerequisiteUnit: unit.prerequisiteUnit || null,
            skillsMix: unit.skillsMix || null,
            skillTags: lesson.skillTags || [],
            listeningTask: lesson.listeningTask || null,
            speakingTask: lesson.speakingTask || null,
            readingTask: lesson.readingTask || null,
            writingTask: lesson.writingTask || null,
            reviewWords: lesson.reviewWords || [],
            bridgeRetrieval: lesson.bridgeRetrieval || [],
            masteryCheck: lesson.masteryCheck || null,
            hintsDisabled: lesson.hintsDisabled || false,
            highSupport: lesson.highSupport || false,
            // ─── WIZARD MANIFEST ─────────────────────────────
            ai_wizard_manifest: lesson.aiWizardManifest || null,
          },
          is_published: true,
        }));

        const { error: lessonsError } = await supabase
          .from('curriculum_lessons')
          .insert(lessonInserts);

        if (lessonsError) throw lessonsError;
        savedCount++;
      }

      if (savedCount === 0 && skippedCount > 0) {
        toast.error(
          `Nothing new was published. All ${skippedCount} units already exist for ${config.ageGroup}/${unitCefrLevel}. Open the Master Library to view them.`,
          { duration: 8000 },
        );
      } else if (skippedCount > 0) {
        toast.warning(`Published ${savedCount} new units. Skipped ${skippedCount} that already existed.`);
      } else {
        toast.success(`Published ${savedCount} units and ${generatedUnits.reduce((sum, u) => sum + (u.lessons?.length || 0), 0)} lessons to the Master Library!`);
      }
      onCurriculumGenerated?.({ system: hubSystem, level: config.level, ageGroup: config.ageGroup });
    } catch (err: any) {
      console.error('Save error:', err);
      const msg = err?.message || String(err);
      toast.error(`Failed to save curriculum: ${msg}`, {
        description: msg.toLowerCase().includes('row-level') || msg.toLowerCase().includes('permission')
          ? 'Your account is missing the content_creator role. Ask an admin to grant it on the Users page.'
          : undefined,
        duration: 10000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          Curriculum Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate a progressive, dependency-linked English curriculum. The AI decorates a proven spiral skeleton — no random generation.
        </p>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration</CardTitle>
          <CardDescription>Set up the curriculum parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Student Level</Label>
              <Select value={config.level} onValueChange={(v) => setConfig((p) => ({ ...p, level: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Age Group</Label>
              <Select value={config.ageGroup} onValueChange={(v) => setConfig((p) => ({ ...p, ageGroup: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_GROUPS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Units</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={config.unitCount}
                onChange={(e) => setConfig((p) => ({ ...p, unitCount: Math.min(10, parseInt(e.target.value) || 1) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Lessons per Unit</Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={config.lessonsPerUnit}
                onChange={(e) => setConfig((p) => ({ ...p, lessonsPerUnit: Math.min(6, parseInt(e.target.value) || 1) }))}
              />
            </div>
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={!canGenerate || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Progressive Curriculum...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Spiral Curriculum
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Curriculum Preview */}
      {generatedUnits.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Generated Spiral Curriculum</CardTitle>
              <CardDescription>
                {generatedUnits.length} units · {generatedUnits.reduce((s, u) => s + (u.lessons?.length || 0), 0)} lessons · Progressive dependency chain
              </CardDescription>
            </div>
            <Button onClick={handleSaveToDB} disabled={isSaving}>
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Publishing...</>
              ) : (
                <><BookOpen className="h-4 w-4 mr-2" />Publish to Master Library</>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {generatedUnits.map((unit, ui) => (
              <Collapsible key={ui} open={openUnits.has(ui)} onOpenChange={() => toggleUnit(ui)}>
                <CollapsibleTrigger className="w-full flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left">
                  {openUnits.has(ui) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{unit.title}</span>
                  
                  {/* Dependency badge */}
                  {unit.prerequisiteUnit && (
                    <Badge variant="outline" className="text-xs gap-1 ml-1">
                      <Link className="h-3 w-3" />
                      ← Unit {unit.prerequisiteUnit}
                    </Badge>
                  )}
                  
                  {/* Phoneme badge */}
                  <Badge className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 ml-auto">
                    <Music className="h-3 w-3 mr-1" />
                    {unit.anchorPhoneme}
                  </Badge>
                  
                  {/* Skills mix mini-bar */}
                  {unit.skillsMix && (
                    <div className="flex gap-0.5 items-center" title={`L:${unit.skillsMix.listening}% S:${unit.skillsMix.speaking}% R:${unit.skillsMix.reading}% W:${unit.skillsMix.writing}%`}>
                      <div className="h-2 rounded-l bg-blue-400" style={{ width: `${unit.skillsMix.listening / 5}px` }} />
                      <div className="h-2 bg-green-400" style={{ width: `${unit.skillsMix.speaking / 5}px` }} />
                      <div className="h-2 bg-amber-400" style={{ width: `${unit.skillsMix.reading / 5}px` }} />
                      <div className="h-2 rounded-r bg-red-400" style={{ width: `${unit.skillsMix.writing / 5}px` }} />
                    </div>
                  )}
                  
                  <Badge variant="secondary">{(unit.lessons || []).length} lessons</Badge>
                </CollapsibleTrigger>
                
                {/* Unit meta row */}
                <div className="ml-6 mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground px-3">
                  <span>🎯 Grammar: <strong className="text-foreground">{unit.grammarGoal}</strong></span>
                  <span>·</span>
                  <span>Skills: L:{unit.skillsMix?.listening}% S:{unit.skillsMix?.speaking}% R:{unit.skillsMix?.reading}% W:{unit.skillsMix?.writing}%</span>
                </div>

                <CollapsibleContent className="pl-6 pr-3 pb-3 space-y-2 mt-2">
                  {(unit.lessons || []).map((lesson, li) => {
                    const isEditing = editingLesson?.unitIdx === ui && editingLesson?.lessonIdx === li;
                    const cycleColor = lesson.cycleType === 'discovery' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                      : lesson.cycleType === 'ladder' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      : lesson.cycleType === 'bridge' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : lesson.cycleType === 'review' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : lesson.cycleType === 'quiz' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      : 'bg-muted text-muted-foreground';

                    return (
                      <div key={li} className="border border-border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] px-1.5 ${cycleColor}`}>{lesson.cycleType}</Badge>
                          <span className="text-sm font-medium text-foreground flex-1">
                            L{lesson.lessonNumber}: {lesson.title}
                          </span>
                          
                          {/* Wizard manifest indicator */}
                          {lesson.aiWizardManifest && (
                            <Badge variant="outline" className="text-[10px] gap-0.5">
                              🧙 Manifest
                            </Badge>
                          )}

                          {lesson.hintsDisabled && (
                            <Badge variant="destructive" className="text-[10px]">No Hints</Badge>
                          )}
                          {lesson.highSupport && (
                            <Badge className="text-[10px] bg-purple-500 text-white">High Support</Badge>
                          )}
                          
                          {!isEditing && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => startEdit(ui, li)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {isEditing && editBuffer ? (
                          <div className="space-y-2 border-t border-border pt-2">
                            <div>
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={editBuffer.title}
                                onChange={(e) => setEditBuffer({ ...editBuffer, title: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Objectives (comma-separated)</Label>
                              <Input
                                value={editBuffer.objectives.join(', ')}
                                onChange={(e) => setEditBuffer({ ...editBuffer, objectives: e.target.value.split(',').map(s => s.trim()) })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEdit} className="h-7 gap-1">
                                <Check className="h-3 w-3" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 gap-1">
                                <X className="h-3 w-3" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              {lesson.objectives.map((obj, oi) => (
                                <div key={oi} className="flex items-start gap-1">
                                  <BookOpen className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                                  <span>{obj}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {lesson.skillTags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-[10px] h-4">
                                  {tag === 'L' ? '👂 Listen' : tag === 'S' ? '🗣️ Speak' : tag === 'R' ? '📖 Read' : '✍️ Write'}
                                </Badge>
                              ))}
                              <Badge variant="outline" className="text-[10px] h-4">
                                🔤 {lesson.phonicsFocus}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
