import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { detectSystematicGaps } from '@/services/scaffoldEngine';
import { AlertTriangle, BarChart3 } from 'lucide-react';

interface MasteryRow {
  unitTitle: string;
  unitId: string;
  phonics: number;
  vocab: number;
  grammar: number;
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
}

interface MasteryHeatmapProps {
  studentId: string;
  studentName?: string;
}

const DIMENSIONS = [
  { key: 'listening', label: 'L', color: '#3B82F6' },
  { key: 'speaking', label: 'S', color: '#10B981' },
  { key: 'reading', label: 'R', color: '#8B5CF6' },
  { key: 'writing', label: 'W', color: '#F59E0B' },
  { key: 'phonics', label: 'Ph', color: '#EF5350' },
  { key: 'vocab', label: 'Vc', color: '#06B6D4' },
  { key: 'grammar', label: 'Gr', color: '#6B21A8' },
] as const;

const getHeatColor = (score: number): string => {
  if (score >= 90) return '#2E7D32';
  if (score >= 75) return '#4CAF50';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#FF9800';
  if (score > 0) return '#EF5350';
  return '#E0E0E0';
};

export const MasteryHeatmap: React.FC<MasteryHeatmapProps> = ({ studentId, studentName = 'Student' }) => {
  const [rows, setRows] = useState<MasteryRow[]>([]);
  const [gaps, setGaps] = useState<ReturnType<typeof detectSystematicGaps>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMasteryData();
  }, [studentId]);

  const loadMasteryData = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('student_mastery')
      .select(`
        unit_id,
        phonics_score,
        vocab_score,
        grammar_score,
        listening_score,
        speaking_score,
        reading_score,
        writing_score
      `)
      .eq('student_id', studentId);

    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch unit titles
    const unitIds = data.map(d => d.unit_id);
    const { data: units } = await supabase
      .from('curriculum_units')
      .select('id, title, unit_number')
      .in('id', unitIds)
      .order('unit_number');

    const unitMap: Record<string, string> = {};
    units?.forEach(u => { unitMap[u.id] = u.title || `Unit ${u.unit_number}`; });

    const masteryRows: MasteryRow[] = data.map(d => ({
      unitTitle: unitMap[d.unit_id] || 'Unknown Unit',
      unitId: d.unit_id,
      phonics: Number(d.phonics_score) || 0,
      vocab: Number(d.vocab_score) || 0,
      grammar: Number(d.grammar_score) || 0,
      listening: Number(d.listening_score) || 0,
      speaking: Number(d.speaking_score) || 0,
      reading: Number(d.reading_score) || 0,
      writing: Number(d.writing_score) || 0,
    }));

    setRows(masteryRows);

    // Detect gaps across all units (use average scores)
    if (masteryRows.length > 0) {
      const avgScores = {
        phonics: masteryRows.reduce((s, r) => s + r.phonics, 0) / masteryRows.length,
        vocab: masteryRows.reduce((s, r) => s + r.vocab, 0) / masteryRows.length,
        grammar: masteryRows.reduce((s, r) => s + r.grammar, 0) / masteryRows.length,
        listening: masteryRows.reduce((s, r) => s + r.listening, 0) / masteryRows.length,
        speaking: masteryRows.reduce((s, r) => s + r.speaking, 0) / masteryRows.length,
        reading: masteryRows.reduce((s, r) => s + r.reading, 0) / masteryRows.length,
        writing: masteryRows.reduce((s, r) => s + r.writing, 0) / masteryRows.length,
      };
      setGaps(detectSystematicGaps(avgScores));
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading mastery heatmap...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Mastery Heatmap — {studentName}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            7-dimension skill tracking across curriculum units
          </p>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No mastery data recorded yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-1 pr-3 text-muted-foreground font-medium">Unit</th>
                    {DIMENSIONS.map(d => (
                      <th key={d.key} className="text-center px-1 py-1 font-medium" style={{ color: d.color }}>
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.unitId} className="border-t border-border/30">
                      <td className="py-2 pr-3 text-[#6B21A8] font-medium truncate max-w-32">
                        {row.unitTitle}
                      </td>
                      {DIMENSIONS.map(d => {
                        const score = row[d.key as keyof MasteryRow] as number;
                        return (
                          <td key={d.key} className="text-center px-1 py-2">
                            <div
                              className="w-7 h-7 rounded-md mx-auto flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ backgroundColor: getHeatColor(score) }}
                              title={`${d.label}: ${score}%`}
                            >
                              {score > 0 ? Math.round(score) : '—'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Systematic Gap Alerts */}
      {gaps.length > 0 && (
        <Card className="border border-[#F59E0B]/20 bg-[#F59E0B]/[0.02] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#F59E0B] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Systematic Gaps Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gaps.map((gap, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-card border">
                <Badge variant="outline" className="text-[10px] shrink-0 border-[#F59E0B] text-[#F59E0B]">
                  {gap.gap}
                </Badge>
                <div>
                  <p className="text-xs text-[#6B21A8] font-medium">
                    High: {gap.highSkill} → Low: {gap.lowSkill}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {gap.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
