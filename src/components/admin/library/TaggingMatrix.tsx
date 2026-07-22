import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tags, Palette, Baby, GraduationCap, Briefcase } from 'lucide-react';

export interface TaggingData {
  targetSystems: ('kids' | 'teen' | 'adult')[];
  proficiencyLevel: string;
  skillTypes: string[];
  visibility: 'teacher_only' | 'student_accessible' | 'both';
  businessMode: boolean;
}

interface TaggingMatrixProps {
  onTaggingComplete: (data: TaggingData) => void;
  onBack: () => void;
}

export const TaggingMatrix = ({ onTaggingComplete, onBack }: TaggingMatrixProps) => {
  const [targetSystems, setTargetSystems] = useState<TaggingData['targetSystems']>([]);
  const [proficiencyLevel, setProficiencyLevel] = useState<string>('');
  const [skillTypes, setSkillTypes] = useState<string[]>([]);
  const [teacherOnly, setTeacherOnly] = useState(false);
  const [studentAccessible, setStudentAccessible] = useState(true);
  const [businessMode, setBusinessMode] = useState(false);

  const skillOptions = [
    { id: 'reading', label: 'Reading', color: 'bg-blue-100 text-blue-800' },
    { id: 'listening', label: 'Listening', color: 'bg-green-100 text-green-800' },
    { id: 'speaking', label: 'Speaking', color: 'bg-purple-100 text-purple-800' },
    { id: 'writing', label: 'Writing', color: 'bg-orange-100 text-orange-800' },
    { id: 'grammar', label: 'Grammar', color: 'bg-pink-100 text-pink-800' },
    { id: 'vocabulary', label: 'Vocabulary', color: 'bg-teal-100 text-teal-800' },
  ];

  const toggleSystem = (system: 'kids' | 'teen' | 'adult') => {
    setTargetSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  const toggleSkill = (skill: string) => {
    setSkillTypes(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const getProficiencyOptions = () => {
    if (targetSystems.includes('kids') && !targetSystems.includes('teen') && !targetSystems.includes('adult')) {
      return [
        { value: 'seed', label: '🌱 Seed (Pre-A1)' },
        { value: 'sprout', label: '🌿 Sprout (A1)' },
        { value: 'bloom', label: '🌸 Bloom (A2)' },
      ];
    }
    return [
      { value: 'A1', label: 'A1 - Beginner' },
      { value: 'A2', label: 'A2 - Elementary' },
      { value: 'B1', label: 'B1 - Intermediate' },
      { value: 'B2', label: 'B2 - Upper Intermediate' },
      { value: 'C1', label: 'C1 - Advanced' },
      { value: 'C2', label: 'C2 - Mastery' },
    ];
  };

  const getVisibility = (): TaggingData['visibility'] => {
    if (teacherOnly && studentAccessible) return 'both';
    if (teacherOnly) return 'teacher_only';
    return 'student_accessible';
  };

  const handleContinue = () => {
    onTaggingComplete({
      targetSystems,
      proficiencyLevel,
      skillTypes,
      visibility: getVisibility(),
      businessMode,
    });
  };

  const isValid = targetSystems.length > 0 && proficiencyLevel && skillTypes.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Step 2: Tagging Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field A: Target System */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Target System</Label>
          <div className="flex flex-wrap gap-3">
            <div 
              onClick={() => toggleSystem('kids')}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                targetSystems.includes('kids') 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-border hover:border-orange-300'
              }`}
            >
              <Baby className={`h-5 w-5 ${targetSystems.includes('kids') ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className="font-medium">Playground (Kids)</span>
            </div>
            <div 
              onClick={() => toggleSystem('teen')}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                targetSystems.includes('teen') 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-border hover:border-purple-300'
              }`}
            >
              <GraduationCap className={`h-5 w-5 ${targetSystems.includes('teen') ? 'text-purple-500' : 'text-muted-foreground'}`} />
              <span className="font-medium">Academy (Teens)</span>
            </div>
            <div 
              onClick={() => toggleSystem('adult')}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                targetSystems.includes('adult') 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-border hover:border-blue-300'
              }`}
            >
              <Briefcase className={`h-5 w-5 ${targetSystems.includes('adult') ? 'text-blue-500' : 'text-muted-foreground'}`} />
              <span className="font-medium">Hub (Adults)</span>
            </div>
          </div>
        </div>

        {/* Business Mode Toggle (Adults only) */}
        {targetSystems.includes('adult') && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <Label className="font-medium">Business English Mode</Label>
              <p className="text-sm text-muted-foreground">For professional/business content</p>
            </div>
            <Switch checked={businessMode} onCheckedChange={setBusinessMode} />
          </div>
        )}

        {/* Field B: Proficiency Level */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Proficiency Level</Label>
          <Select value={proficiencyLevel} onValueChange={setProficiencyLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select level..." />
            </SelectTrigger>
            <SelectContent>
              {getProficiencyOptions().map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Field C: Skill Types */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Skill Focus</Label>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map(skill => (
              <Badge
                key={skill.id}
                variant={skillTypes.includes(skill.id) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  skillTypes.includes(skill.id) ? '' : 'opacity-60 hover:opacity-100'
                }`}
                onClick={() => toggleSkill(skill.id)}
              >
                {skill.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Field D: Visibility */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Visibility</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <div>
                  <p className="font-medium">Teacher Only</p>
                  <p className="text-xs text-muted-foreground">Answer keys, lesson plans</p>
                </div>
              </div>
              <Switch checked={teacherOnly} onCheckedChange={setTeacherOnly} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <div>
                  <p className="font-medium">Student Accessible</p>
                  <p className="text-xs text-muted-foreground">Homework, self-study materials</p>
                </div>
              </div>
              <Switch checked={studentAccessible} onCheckedChange={setStudentAccessible} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!isValid}>
            Continue to Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
