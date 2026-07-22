import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { triggerCelebration } from '@/services/celebration';
import { Sparkles, BookOpen, CalendarDays, LayoutDashboard } from 'lucide-react';

interface WelcomeSuccessModalProps {
  teacherId: string;
  teacherName: string;
  profileImageUrl?: string;
  bio?: string;
  onDismiss: () => void;
}

export const WelcomeSuccessModal = ({
  teacherId,
  teacherName,
  profileImageUrl,
  bio,
  onDismiss,
}: WelcomeSuccessModalProps) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Fire confetti on mount
    triggerCelebration('professional');
    const timer = setTimeout(() => triggerCelebration('playground'), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = async () => {
    setOpen(false);
    // Mark welcome as shown
    await supabase
      .from('teacher_profiles')
      .update({ welcome_shown: true })
      .eq('user_id', teacherId);
    onDismiss();
  };

  const steps = [
    {
      icon: LayoutDashboard,
      title: 'Explore your Dashboard',
      description: 'View your schedule, analytics, and student bookings all in one place.',
    },
    {
      icon: BookOpen,
      title: 'Review your First Lesson',
      description: 'Open the Curriculum Vault to practice with Pip or Cyra before your first class.',
    },
    {
      icon: CalendarDays,
      title: 'Sync your Calendar',
      description: 'Set your availability so students can start booking sessions with you.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleDismiss()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none bg-background">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-center">
          <Sparkles className="h-10 w-10 text-primary-foreground mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-primary-foreground">
            Welcome to EnglEuphoria!
          </h2>
          <p className="text-primary-foreground/80 mt-1 text-sm">
            You're officially part of the team, {teacherName.split(' ')[0]} 🎉
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Profile preview */}
          {(profileImageUrl || bio) && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              {profileImageUrl && (
                <img
                  src={profileImageUrl}
                  alt={teacherName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{teacherName}</p>
                {bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{bio}</p>
                )}
                <p className="text-xs text-primary mt-0.5">This is how students see you</p>
              </div>
            </div>
          )}

          {/* Studio Guide steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Your Studio Guide</h3>
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleDismiss} className="w-full">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
