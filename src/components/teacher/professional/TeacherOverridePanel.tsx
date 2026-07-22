import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { setTeacherOverride, ScaffoldLevel } from '@/services/scaffoldEngine';
import { toast } from 'sonner';
import { Lock, Unlock, Shield, Zap, RotateCcw } from 'lucide-react';

interface TeacherOverridePanelProps {
  studentId: string;
  studentName: string;
  unitId: string;
  unitTitle: string;
  sessionId?: string;
}

export const TeacherOverridePanel: React.FC<TeacherOverridePanelProps> = ({
  studentId,
  studentName,
  unitId,
  unitTitle,
  sessionId,
}) => {
  const [currentLevel, setCurrentLevel] = useState<ScaffoldLevel>('heavy');
  const [overrideLevel, setOverrideLevel] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [hasOverride, setHasOverride] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCurrentState();
  }, [studentId, unitId]);

  const loadCurrentState = async () => {
    const { data } = await supabase
      .from('student_mastery')
      .select('scaffold_level, teacher_override_scaffold, teacher_override_notes')
      .eq('student_id', studentId)
      .eq('unit_id', unitId)
      .maybeSingle();

    if (data) {
      setCurrentLevel((data.scaffold_level as ScaffoldLevel) || 'heavy');
      setHasOverride(!!data.teacher_override_scaffold);
      setOverrideLevel(data.teacher_override_scaffold || '');
      setNotes(data.teacher_override_notes || '');
    }
  };

  const handleApplyOverride = useCallback(async () => {
    if (!overrideLevel) return;
    setSaving(true);

    const success = await setTeacherOverride(
      studentId,
      unitId,
      overrideLevel as ScaffoldLevel,
      notes
    );

    if (success) {
      setHasOverride(true);
      setCurrentLevel(overrideLevel as ScaffoldLevel);
      toast.success(`Scaffold override applied for ${studentName}`);

      // Broadcast the override via Realtime so the student's view updates
      if (sessionId) {
        const channel = supabase.channel(`scaffold-override-${sessionId}`);
        await channel.send({
          type: 'broadcast',
          event: 'scaffold_override',
          payload: {
            studentId,
            unitId,
            newLevel: overrideLevel,
          },
        });
        supabase.removeChannel(channel);
      }
    } else {
      toast.error('Failed to apply override');
    }

    setSaving(false);
  }, [overrideLevel, notes, studentId, unitId, studentName, sessionId]);

  const handleRemoveOverride = useCallback(async () => {
    setSaving(true);

    const success = await setTeacherOverride(studentId, unitId, null, '');

    if (success) {
      setHasOverride(false);
      setOverrideLevel('');
      setNotes('');
      toast.success('Override removed — auto-scaffold restored');
    }

    setSaving(false);
  }, [studentId, unitId]);

  const LEVEL_OPTIONS = [
    { value: 'heavy', label: 'Heavy — Wizard leads', icon: Shield, description: 'Full hints, single-slot grammar, labeled images' },
    { value: 'medium', label: 'Medium — Fading support', icon: Zap, description: 'Some hints, multi-slot grammar, partial Ghost Vectors' },
    { value: 'light', label: 'Light — Minimal hints', icon: Unlock, description: 'No mouth animation, full grammar slots, mostly Ghost Vectors' },
    { value: 'independent', label: 'Independent — No scaffold', icon: Lock, description: 'No hints, full production mode' },
  ] as const;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Manual Override — {studentName}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{unitTitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current state */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current:</span>
          <Badge variant="outline" className="text-xs capitalize">
            {currentLevel}
          </Badge>
          {hasOverride && (
            <Badge className="text-[10px] bg-[#F59E0B] text-white">
              Teacher Override
            </Badge>
          )}
        </div>

        {/* Override selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#6B21A8]">Set Scaffold Level:</label>
          <Select value={overrideLevel} onValueChange={setOverrideLevel}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select level..." />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <opt.icon className="h-3 w-3" />
                    <span>{opt.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {overrideLevel && (
            <p className="text-[10px] text-muted-foreground">
              {LEVEL_OPTIONS.find(o => o.value === overrideLevel)?.description}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#6B21A8]">Override Notes:</label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Why are you overriding? (e.g., 'Student struggled with grammar blocks during 1-on-1')"
            className="text-xs h-16 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleApplyOverride}
            disabled={!overrideLevel || saving}
            size="sm"
            className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-xs"
          >
            {saving ? 'Saving...' : 'Apply Override'}
          </Button>

          {hasOverride && (
            <Button
              onClick={handleRemoveOverride}
              disabled={saving}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Remove Override
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
