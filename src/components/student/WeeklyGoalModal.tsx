import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WeeklyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: string) => void;
  studentLevel: 'playground' | 'academy' | 'professional';
  currentGoal?: string | null;
}

const goalSuggestions: Record<string, string[]> = {
  playground: [
    "Learn 10 new words 📚",
    "Complete 3 lessons 🎯",
    "Help Pip find his friends 🐦",
    "Earn 500 stars ⭐",
    "Practice colors and numbers 🌈",
  ],
  academy: [
    "Improve my speaking confidence",
    "Prepare for an English test",
    "Understand song lyrics better",
    "Chat with online friends in English",
    "Complete all weekly lessons",
    "Reach the next level",
  ],
  professional: [
    "Prepare for a job interview",
    "Write professional emails confidently",
    "Present in English at work",
    "Travel conversation skills",
    "Negotiate in English",
    "Lead meetings in English",
  ],
};

export const WeeklyGoalModal: React.FC<WeeklyGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentLevel,
  currentGoal,
}) => {
  const { user } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState<string>(currentGoal || '');
  const [customGoal, setCustomGoal] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const suggestions = goalSuggestions[studentLevel];

  const handleSelectSuggestion = (goal: string) => {
    setSelectedGoal(goal);
    setIsCustom(false);
    setCustomGoal('');
  };

  const handleCustomGoal = () => {
    setIsCustom(true);
    setSelectedGoal('');
  };

  const handleSave = async () => {
    const goalToSave = isCustom ? customGoal : selectedGoal;
    
    if (!goalToSave.trim()) {
      toast.error('Please select or enter a goal');
      return;
    }

    if (!user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({
          weekly_goal: goalToSave,
          weekly_goal_set_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Goal set! Let\'s achieve it together! 🎯');
      onSave(goalToSave);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Set Your Weekly Goal
          </DialogTitle>
          <DialogDescription>
            What do you want to achieve this week?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Suggestions */}
          <div className="grid gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                  selectedGoal === suggestion && !isCustom
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{suggestion}</span>
                  {selectedGoal === suggestion && !isCustom && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Custom Goal */}
          <div className="pt-2 border-t">
            <button
              onClick={handleCustomGoal}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all mb-2 ${
                isCustom
                  ? 'border-primary bg-primary/10'
                  : 'border-dashed border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Write my own goal...</span>
              </div>
            </button>

            <AnimatePresence>
              {isCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="Enter your custom goal..."
                    className="mt-2"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || (!selectedGoal && !customGoal)}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Set Goal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
