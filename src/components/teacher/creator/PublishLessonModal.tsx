import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Send, Gamepad2, Users } from 'lucide-react';

interface PublishLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  teacherId: string;
  hub: string;
  blocks: any[];
}

const GAME_TYPES = new Set([
  'bubble_pop',
  'memory_flip',
  'spinning_wheel_prompts',
  'drag_drop',
  'matching_pairs',
]);

export const PublishLessonModal: React.FC<PublishLessonModalProps> = ({
  open,
  onOpenChange,
  lessonId,
  teacherId,
  hub,
  blocks,
}) => {
  const [assignOn, setAssignOn] = useState(true);
  const [arcadeOn, setArcadeOn] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!assignOn && !arcadeOn) {
      toast.error('Pick at least one destination.');
      return;
    }
    setSubmitting(true);
    try {
      if (assignOn) {
        const { error } = await supabase.from('scheduled_lessons').insert({
          lesson_id: lessonId,
          teacher_id: teacherId,
          student_id: studentId || null,
          scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
          status: 'assigned',
        });
        if (error) throw error;
      }

      if (arcadeOn) {
        const games = blocks
          .filter((b) => GAME_TYPES.has(b?.type))
          .map((b) => ({
            source_lesson_id: lessonId,
            teacher_id: teacherId,
            hub,
            game_type: b.type,
            game_payload: b,
            active: true,
          }));
        if (games.length === 0) {
          toast.warning('No interactive micro-games found in this lesson.');
        } else {
          const { error } = await supabase.from('daily_discovery_pool').insert(games);
          if (error) throw error;
        }
      }

      toast.success('Lesson published.');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? 'Publish failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Send className="h-5 w-5" /> Publish Lesson
          </DialogTitle>
          <DialogDescription>Choose how to distribute this lesson.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-primary" /> Assign to Student / Class
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Adds the lesson to a student's queue.
                </p>
              </div>
              <Switch checked={assignOn} onCheckedChange={setAssignOn} />
            </div>
            {assignOn && (
              <div className="mt-3 space-y-2">
                <div>
                  <Label htmlFor="student-id" className="text-xs">Student ID</Label>
                  <Input
                    id="student-id"
                    placeholder="Optional — leave blank for class-wide"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled-for" className="text-xs">Scheduled for</Label>
                  <Input
                    id="scheduled-for"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Gamepad2 className="h-4 w-4 text-primary" /> Push to Infinite Arcade
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Sends every interactive micro-game to the daily discovery pool.
                </p>
              </div>
              <Switch checked={arcadeOn} onCheckedChange={setArcadeOn} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishLessonModal;
