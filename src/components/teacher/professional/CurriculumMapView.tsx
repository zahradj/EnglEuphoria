import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Map, Lock, Unlock, Eye } from 'lucide-react';

interface LessonNode {
  id: string;
  title: string;
  unitId: string;
  status: 'mastered' | 'current' | 'locked';
  scores?: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
}

interface UnitGroup {
  unitId: string;
  unitTitle: string;
  lessons: LessonNode[];
  overallMastery: number;
}

interface CurriculumMapViewProps {
  teacherId: string;
  studentId?: string;
  studentName?: string;
}

export const CurriculumMapView: React.FC<CurriculumMapViewProps> = ({
  teacherId,
  studentId,
  studentName = 'Student',
}) => {
  const [units, setUnits] = useState<UnitGroup[]>([]);
  const [selectedNode, setSelectedNode] = useState<LessonNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurriculumMap();
  }, [studentId]);

  const loadCurriculumMap = async () => {
    setLoading(true);

    // Fetch curriculum units
    const { data: unitsData } = await supabase
      .from('curriculum_units')
      .select('id, title, unit_number')
      .order('unit_number');

    if (!unitsData) {
      setLoading(false);
      return;
    }

    // Fetch lessons per unit
    const { data: lessonsData } = await supabase
      .from('curriculum_lessons')
      .select('id, title, unit_id, is_published')
      .in('unit_id', unitsData.map(u => u.id))
      .order('sequence_order');

    // Fetch mastery data for the student
    let masteryMap: Record<string, any> = {};
    if (studentId) {
      const { data: masteryData } = await supabase
        .from('student_mastery')
        .select('*')
        .eq('student_id', studentId);

      if (masteryData) {
        masteryData.forEach(m => {
          masteryMap[m.unit_id] = m;
        });
      }
    }

    // Build the map structure
    const unitGroups: UnitGroup[] = unitsData.map(unit => {
      const unitLessons = (lessonsData || [])
        .filter(l => l.unit_id === unit.id)
        .map((lesson, idx): LessonNode => {
          const mastery = masteryMap[unit.id];
          const avgScore = mastery
            ? (Number(mastery.phonics_score) + Number(mastery.vocab_score) + Number(mastery.grammar_score)) / 3
            : 0;

          return {
            id: lesson.id,
            title: lesson.title || `Lesson ${idx + 1}`,
            unitId: unit.id,
            status: avgScore >= 80 ? 'mastered' : avgScore > 0 ? 'current' : 'locked',
            scores: mastery ? {
              listening: Number(mastery.listening_score),
              speaking: Number(mastery.speaking_score),
              reading: Number(mastery.reading_score),
              writing: Number(mastery.writing_score),
            } : undefined,
          };
        });

      const mastery = masteryMap[unit.id];
      const overallMastery = mastery
        ? Math.round((
            Number(mastery.phonics_score) + Number(mastery.vocab_score) + Number(mastery.grammar_score) +
            Number(mastery.listening_score) + Number(mastery.speaking_score) +
            Number(mastery.reading_score) + Number(mastery.writing_score)
          ) / 7)
        : 0;

      return {
        unitId: unit.id,
        unitTitle: unit.title || `Unit ${unit.unit_number}`,
        lessons: unitLessons,
        overallMastery,
      };
    });

    setUnits(unitGroups);
    setLoading(false);
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-[#6B21A8]';
      case 'current': return 'bg-[#6B21A8]/60';
      case 'locked': return 'bg-muted/40';
      default: return 'bg-muted/40';
    }
  };

  const SkillBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-medium text-muted-foreground w-4 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[9px] text-muted-foreground w-6 text-right">{score}%</span>
    </div>
  );

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Loading curriculum map...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#6B21A8] font-inter flex items-center gap-2">
          <Map className="h-5 w-5" />
          Curriculum Map — {studentName}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Navy = mastered • Pulsing = current • Grey = locked
        </p>
      </div>

      {/* Map Grid */}
      <div className="grid gap-4">
        {units.map((unit, unitIdx) => (
          <Card key={unit.unitId} className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#6B21A8]">
                  {unit.unitTitle}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={unit.overallMastery >= 80 ? 'border-[#2E7D32] text-[#2E7D32]' : 'border-border'}
                >
                  {unit.overallMastery}% mastery
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Lesson nodes as dots */}
              <div className="flex items-center gap-3 mb-3">
                {unit.lessons.map((lesson, lessonIdx) => (
                  <React.Fragment key={lesson.id}>
                    <motion.button
                      onClick={() => setSelectedNode(selectedNode?.id === lesson.id ? null : lesson)}
                      className={`relative w-8 h-8 rounded-full ${getNodeColor(lesson.status)} 
                                  flex items-center justify-center shadow-sm transition-all
                                  hover:ring-2 hover:ring-[#6B21A8]/20`}
                      animate={
                        lesson.status === 'current'
                          ? { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 2 }}
                      title={lesson.title}
                    >
                      {lesson.status === 'locked' && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                      {lesson.status === 'mastered' && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </motion.button>

                    {/* Connecting line */}
                    {lessonIdx < unit.lessons.length - 1 && (
                      <div className={`flex-1 h-0.5 max-w-8 ${
                        unit.lessons[lessonIdx + 1].status !== 'locked'
                          ? 'bg-[#6B21A8]/30'
                          : 'bg-muted/20'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Expanded detail for selected node */}
              {selectedNode && unit.lessons.some(l => l.id === selectedNode.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-3 mt-2"
                >
                  <p className="text-xs font-medium text-[#6B21A8] mb-2">{selectedNode.title}</p>
                  {selectedNode.scores ? (
                    <div className="space-y-1 max-w-48">
                      <SkillBar label="L" score={selectedNode.scores.listening} color="#3B82F6" />
                      <SkillBar label="S" score={selectedNode.scores.speaking} color="#10B981" />
                      <SkillBar label="R" score={selectedNode.scores.reading} color="#8B5CF6" />
                      <SkillBar label="W" score={selectedNode.scores.writing} color="#F59E0B" />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No assessment data yet</p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {units.length === 0 && (
        <Card className="border shadow-sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No curriculum units found. Create units in the Content Creator dashboard first.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
