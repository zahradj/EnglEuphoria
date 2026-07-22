import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyGoalModal } from './WeeklyGoalModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface WeeklyGoalWidgetProps {
  studentLevel: 'playground' | 'academy' | 'professional';
  isDarkMode?: boolean;
  progress?: number;
}

const levelStyles = {
  playground: {
    bgClass: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    borderClass: 'border-orange-200',
    iconColor: 'text-orange-500',
    textColor: 'text-orange-800',
    buttonClass: 'bg-orange-500 hover:bg-orange-600',
  },
  academy: {
    bgClass: 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30',
    borderClass: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    textColor: 'text-purple-100',
    buttonClass: 'bg-purple-600 hover:bg-purple-700',
  },
  professional: {
    bgClass: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    borderClass: 'border-emerald-200 dark:border-emerald-700/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-800 dark:text-emerald-100',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

export const WeeklyGoalWidget: React.FC<WeeklyGoalWidgetProps> = ({
  studentLevel,
  isDarkMode = false,
  progress = 0,
}) => {
  const { user } = useAuth();
  const [weeklyGoal, setWeeklyGoal] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const celebrationFired = useRef(false);
  
  const style = levelStyles[studentLevel];

  // Fire confetti when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && !celebrationFired.current && weeklyGoal) {
      celebrationFired.current = true;
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success('You reached 100% this week! Amazing work! 🎊', {
        duration: 5000,
        icon: '🎊',
      });
    }
  }, [progress, weeklyGoal]);

  // Reset celebration flag when progress drops below 100 (new week)
  useEffect(() => {
    if (progress < 100) {
      celebrationFired.current = false;
    }
  }, [progress]);

  useEffect(() => {
    const fetchGoal = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('weekly_goal')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setWeeklyGoal(data?.weekly_goal || null);
      } catch (error) {
        console.error('Error fetching weekly goal:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoal();
  }, [user?.id]);

  const handleGoalSaved = (newGoal: string) => {
    setWeeklyGoal(newGoal);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <Card className={`${style.bgClass} ${style.borderClass} animate-pulse`}>
        <CardContent className="p-4 h-24" />
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={`${style.bgClass} ${style.borderClass}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${style.textColor}`}>
              <Target className={`w-4 h-4 ${style.iconColor}`} />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {weeklyGoal ? (
              <div className="space-y-2">
                <p className={`font-medium ${style.textColor}`}>
                  {weeklyGoal}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className={`text-xs ${style.iconColor}`}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Change Goal
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsModalOpen(true)}
                className={`w-full text-white ${style.buttonClass}`}
              >
                <Target className="w-4 h-4 mr-2" />
                Set Your Goal
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <WeeklyGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleGoalSaved}
        studentLevel={studentLevel}
        currentGoal={weeklyGoal}
      />
    </>
  );
};
