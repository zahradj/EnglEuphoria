import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssignLessonModalProps {
  lesson: { id: string; title: string | null; description?: string | null };
  onClose: () => void;
}

export const AssignLessonModal: React.FC<AssignLessonModalProps> = ({ lesson, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAssign = async () => {
    if (!email.trim() || !user?.id) return;

    setLoading(true);
    try {
      // Look up student by email in the users table
      const { data: student, error: lookupError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (lookupError || !student) {
        toast({
          title: 'Student not found',
          description: 'No student account found with that email address.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('student_assignments')
        .insert({
          lesson_id: lesson.id,
          student_id: student.id,
          teacher_id: user.id,
        });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: 'Lesson assigned!',
        description: `"${lesson.title || 'Untitled Lesson'}" has been sent to the student.`,
      });

      setTimeout(onClose, 1500);
    } catch (err: any) {
      toast({
        title: 'Assignment failed',
        description: err.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🚀 Assign Lesson</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-medium text-foreground">Lesson assigned successfully!</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Assign <strong>"{lesson.title || 'Untitled Lesson'}"</strong> to a student.
            </p>

            <div className="space-y-2">
              <Label htmlFor="student-email">Student Email</Label>
              <Input
                id="student-email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleAssign}
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send to Student
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
