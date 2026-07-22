import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { IronCurriculum, TargetAudience, CEFRLevel } from './types';
import { IronLevelMap } from './IronLevelMap';
import { IronLessonPreview } from './IronLessonPreview';
import { IronForgeEditor } from './IronForgeEditor';
import { IronLibrary } from './IronLibrary';
import { IronModuleManager } from './IronModuleManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Sword, 
  Loader2, 
  Sparkles, 
  Download,
  RefreshCw,
  Hammer,
  Library,
  Boxes,
  Wand2
} from 'lucide-react';

export const IronAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('forge');
  
  // AI Generator state
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('adults');
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>('B1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [curriculum, setCurriculum] = useState<IronCurriculum | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [generatedLevels, setGeneratedLevels] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    toast.info('Iron Protocol activated. Generating curriculum...', {
      duration: 10000,
    });

    try {
      const { data, error } = await supabase.functions.invoke('iron-ppp-generator', {
        body: {
          topic: topic.trim(),
          targetAudience,
          cefrLevel,
          userId: user?.id
        }
      });

      if (error) throw error;

      if (data.success && data.curriculum) {
        setCurriculum(data.curriculum);
        const levels = data.curriculum.levels.map((l: any) => l.levelNumber);
        setGeneratedLevels(levels);
        setSelectedLevel(levels[0] || null);
        toast.success(`Iron Curriculum generated! ${levels.length} levels with ${data.curriculum.levels.reduce((acc: number, l: any) => acc + l.lessons.length, 0)} total lessons.`);
      } else {
        throw new Error(data.error || 'Failed to generate curriculum');
      }
    } catch (error: any) {
      console.error('Error generating curriculum:', error);
      toast.error(error.message || 'Failed to generate curriculum');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (!curriculum) return;
    
    const blob = new Blob([JSON.stringify(curriculum, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron-curriculum-${curriculum.topic.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Curriculum exported as JSON');
  };

  const selectedLevelData = curriculum?.levels.find(l => l.levelNumber === selectedLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
          <Sword className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Iron LMS</h1>
          <p className="text-muted-foreground">Multi-Track Curriculum Engine with PPP Methodology</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="forge" className="flex items-center gap-2">
            <Hammer className="h-4 w-4" />
            Iron Forge
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="ai-generator" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            AI Generator
          </TabsTrigger>
        </TabsList>

        {/* Manual Forge Editor */}
        <TabsContent value="forge" className="mt-6">
          <IronForgeEditor />
        </TabsContent>

        {/* Master Library */}
        <TabsContent value="library" className="mt-6">
          <IronLibrary />
        </TabsContent>

        {/* Module Manager */}
        <TabsContent value="modules" className="mt-6">
          <IronModuleManager />
        </TabsContent>

        {/* AI Curriculum Generator */}
        <TabsContent value="ai-generator" className="mt-6 space-y-6">
          {/* Generator Form */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Curriculum Generator
              </CardTitle>
              <CardDescription>
                Enter a topic and the AI will generate a complete 5-level curriculum using the PPP methodology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Prompt Engineering, Business English, Public Speaking..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isGenerating}
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as TargetAudience)} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kids">Kids (6-12)</SelectItem>
                      <SelectItem value="teens">Teens (13-17)</SelectItem>
                      <SelectItem value="adults">Adults (18+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>CEFR Level</Label>
                  <Select value={cefrLevel} onValueChange={(v) => setCefrLevel(v as CEFRLevel)} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1 - Beginner</SelectItem>
                      <SelectItem value="A2">A2 - Elementary</SelectItem>
                      <SelectItem value="B1">B1 - Intermediate</SelectItem>
                      <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                      <SelectItem value="C1">C1 - Advanced</SelectItem>
                      <SelectItem value="C2">C2 - Proficient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !topic.trim()}
                className="w-full mt-6 h-12 text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Forging Curriculum... (This may take up to 30 seconds)
                  </>
                ) : (
                  <>
                    <Sword className="w-5 h-5 mr-2" />
                    Generate Iron Curriculum
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Curriculum */}
          {curriculum && (
            <>
              {/* Topic Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Topic</p>
                        <p className="text-xl font-bold">{curriculum.topic}</p>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div>
                        <p className="text-sm text-muted-foreground">Audience</p>
                        <p className="font-medium capitalize">{curriculum.targetAudience}</p>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div>
                        <p className="text-sm text-muted-foreground">CEFR Level</p>
                        <p className="font-medium">{curriculum.cefrLevel}</p>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Lessons</p>
                        <p className="font-medium">
                          {curriculum.levels.reduce((acc, l) => acc + l.lessons.length, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                      </Button>
                      <Button variant="outline" onClick={() => setCurriculum(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level Map */}
              <Card>
                <CardHeader>
                  <CardTitle>5-Level Progression Map</CardTitle>
                  <CardDescription>Anchor → Forge → Temper → Edge → Alloy</CardDescription>
                </CardHeader>
                <CardContent>
                  <IronLevelMap
                    levels={curriculum.levels}
                    selectedLevel={selectedLevel}
                    onSelectLevel={setSelectedLevel}
                    generatedLevels={generatedLevels}
                  />
                </CardContent>
              </Card>

              {/* Selected Level Preview */}
              {selectedLevelData && (
                <IronLessonPreview level={selectedLevelData} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
