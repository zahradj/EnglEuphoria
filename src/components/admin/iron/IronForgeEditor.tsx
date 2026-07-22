import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Hammer, Save, Lock, FileText, Target, Zap, ArrowLeft, BookOpen } from 'lucide-react';
import { useIronModules, useCreateIronLesson, VocabularyItem } from '@/hooks/useIronLessons';
import { IronImageGenerator } from './IronImageGenerator';
import { toast } from 'sonner';

const COHORT_CONFIG = {
  A: { name: 'Foundation', color: 'bg-blue-500', textColor: 'text-blue-600', borderColor: 'border-blue-500' },
  B: { name: 'Bridge', color: 'bg-amber-500', textColor: 'text-amber-600', borderColor: 'border-amber-500' },
  C: { name: 'Mastery', color: 'bg-emerald-500', textColor: 'text-emerald-600', borderColor: 'border-emerald-500' },
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface IronForgeEditorProps {
  onBack?: () => void;
}

// Parse vocabulary from "Word: Definition" format
const parseVocabulary = (text: string): VocabularyItem[] => {
  return text
    .split('\n')
    .filter(line => line.includes(':'))
    .map(line => {
      const [word, ...rest] = line.split(':');
      return {
        word: word.trim().replace(/^\*+|\*+$/g, ''), // Remove markdown bold markers
        definition: rest.join(':').trim()
      };
    })
    .filter(item => item.word && item.definition);
};

export const IronForgeEditor: React.FC<IronForgeEditorProps> = ({ onBack }) => {
  const [cohortGroup, setCohortGroup] = useState<'A' | 'B' | 'C'>('A');
  const [moduleId, setModuleId] = useState<string>('none');
  const [cefrLevel, setCefrLevel] = useState<string>('A1');
  const [title, setTitle] = useState('');

  // Presentation
  const [concept, setConcept] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [vocabulary, setVocabulary] = useState('');
  const [visualAidUrl, setVisualAidUrl] = useState('');
  const [visualAidPrompt, setVisualAidPrompt] = useState('');

  // Practice Tasks
  const [taskAInstruction, setTaskAInstruction] = useState('');
  const [taskAPattern, setTaskAPattern] = useState('');
  const [taskBInstruction, setTaskBInstruction] = useState('');
  const [taskBBuildsOn, setTaskBBuildsOn] = useState('');
  const [taskCInstruction, setTaskCInstruction] = useState('');
  const [taskCBuildsOn, setTaskCBuildsOn] = useState('');

  // Production
  const [scenario, setScenario] = useState('');
  const [mission, setMission] = useState('');
  const [constraints, setConstraints] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [timeLimit, setTimeLimit] = useState('');

  const { data: modules } = useIronModules(cohortGroup);
  const createLesson = useCreateIronLesson();

  const cohortConfig = COHORT_CONFIG[cohortGroup];

  const handleSave = async (status: 'draft' | 'locked') => {
    if (!title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    const lessonData = {
      title,
      cohort_group: cohortGroup,
      module_id: moduleId === 'none' ? null : moduleId,
      cefr_level: cefrLevel,
      presentation_content: {
        concept,
        keyPoints: keyPoints.split('\n').filter(Boolean),
        vocabulary: parseVocabulary(vocabulary),
        visualAidUrl: visualAidUrl || undefined,
        visualAidPrompt: visualAidPrompt || undefined,
      },
      practice_content: {
        taskA: { instruction: taskAInstruction, pattern: taskAPattern },
        taskB: { instruction: taskBInstruction, buildsOn: taskBBuildsOn },
        taskC: { instruction: taskCInstruction, buildsOn: taskCBuildsOn },
      },
      production_content: {
        scenario,
        mission,
        constraints: constraints.split('\n').filter(Boolean),
        successCriteria,
        timeLimit,
      },
      status,
    };

    await createLesson.mutateAsync(lessonData);
    
    // Reset form
    setTitle('');
    setConcept('');
    setKeyPoints('');
    setVocabulary('');
    setVisualAidUrl('');
    setVisualAidPrompt('');
    setTaskAInstruction('');
    setTaskAPattern('');
    setTaskBInstruction('');
    setTaskBBuildsOn('');
    setTaskCInstruction('');
    setTaskCBuildsOn('');
    setScenario('');
    setMission('');
    setConstraints('');
    setSuccessCriteria('');
    setTimeLimit('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <Hammer className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Iron Forge</h1>
              <p className="text-sm text-muted-foreground">Craft PPP Lessons</p>
            </div>
          </div>
        </div>
        <Badge className={`${cohortConfig.color} text-white`}>
          Cohort {cohortGroup}: {cohortConfig.name}
        </Badge>
      </div>

      {/* Targeting Selectors */}
      <Card className={`border-2 ${cohortConfig.borderColor}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Lesson Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lesson title..."
              />
            </div>
            <div>
              <Label>Cohort Group</Label>
              <Select value={cohortGroup} onValueChange={(v) => setCohortGroup(v as 'A' | 'B' | 'C')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Group A: Foundation
                    </div>
                  </SelectItem>
                  <SelectItem value="B">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Group B: Bridge
                    </div>
                  </SelectItem>
                  <SelectItem value="C">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      Group C: Mastery
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Module</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Module</SelectItem>
                  {modules?.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      Module {mod.module_number}: {mod.module_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>CEFR Level</Label>
              <Select value={cefrLevel} onValueChange={setCefrLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CEFR_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presentation Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <FileText className="h-5 w-5" />
            PRESENTATION - The Download
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {/* AI Visual Aid Generator */}
          <IronImageGenerator
            cohortGroup={cohortGroup}
            onImageGenerated={(url, prompt) => {
              setVisualAidUrl(url);
              setVisualAidPrompt(prompt);
            }}
            initialPrompt={visualAidPrompt}
            initialImageUrl={visualAidUrl}
          />

          <Separator />

          <div>
            <Label>Core Concept / Theory</Label>
            <Textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Explain the main concept, grammar rule, or vocabulary theme..."
              rows={4}
            />
          </div>

          <Separator />

          {/* Key Vocabulary Section */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <Label className="text-base font-semibold">Key Vocabulary</Label>
            </div>
            <Textarea
              value={vocabulary}
              onChange={(e) => setVocabulary(e.target.value)}
              placeholder="Word: Definition (one per line)&#10;Engineer: A person who builds things&#10;Tired: When you need to sleep&#10;Japanese: A person from Japan"
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Format: <code className="bg-muted px-1 rounded">Word: Definition</code> — one vocabulary term per line
            </p>
          </div>

          <div>
            <Label>Key Points (one per line)</Label>
            <Textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="Key point 1&#10;Key point 2&#10;Key point 3"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Practice Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Zap className="h-5 w-5" />
            PRACTICE - The Drill
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {/* Task A */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Badge variant="outline">Task A</Badge>
              Foundation Exercise
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Instruction</Label>
                <Textarea
                  value={taskAInstruction}
                  onChange={(e) => setTaskAInstruction(e.target.value)}
                  placeholder="What should the student do?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Pattern / Example</Label>
                <Textarea
                  value={taskAPattern}
                  onChange={(e) => setTaskAPattern(e.target.value)}
                  placeholder="Provide a pattern or example..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Task B */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Badge variant="outline">Task B</Badge>
              Building Exercise
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Instruction</Label>
                <Textarea
                  value={taskBInstruction}
                  onChange={(e) => setTaskBInstruction(e.target.value)}
                  placeholder="What should the student do?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Builds On</Label>
                <Textarea
                  value={taskBBuildsOn}
                  onChange={(e) => setTaskBBuildsOn(e.target.value)}
                  placeholder="How does this connect to Task A?"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Task C */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Badge variant="outline">Task C</Badge>
              Challenge Exercise
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Instruction</Label>
                <Textarea
                  value={taskCInstruction}
                  onChange={(e) => setTaskCInstruction(e.target.value)}
                  placeholder="What should the student do?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Builds On</Label>
                <Textarea
                  value={taskCBuildsOn}
                  onChange={(e) => setTaskCBuildsOn(e.target.value)}
                  placeholder="How does this connect to Tasks A and B?"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <Target className="h-5 w-5" />
            PRODUCTION - The Test
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Scenario</Label>
              <Textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Describe the real-world scenario..."
                rows={3}
              />
            </div>
            <div>
              <Label>Mission</Label>
              <Textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="What is the student's mission?"
                rows={3}
              />
            </div>
          </div>
          <div>
            <Label>Constraints (one per line)</Label>
            <Textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Must use at least 3 new vocabulary words&#10;Must include one question&#10;Maximum 100 words"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Success Criteria</Label>
              <Input
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                placeholder="What defines success?"
              />
            </div>
            <div>
              <Label>Time Limit (optional)</Label>
              <Input
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="e.g., 10 minutes"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => handleSave('draft')}
          disabled={createLesson.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSave('locked')}
          disabled={createLesson.isPending}
          className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950"
        >
          <Lock className="h-4 w-4 mr-2" />
          Save & Lock (Vault)
        </Button>
      </div>
    </div>
  );
};
