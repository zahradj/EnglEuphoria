import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel, getStudentDashboardRoute } from '@/hooks/useStudentLevel';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, GraduationCap, Briefcase, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const HUB_CONFIG = {
  playground: {
    label: 'The Playground',
    description: 'Fun, interactive lessons for young learners (ages 5–11)',
    icon: Sparkles,
    gradient: 'from-[#FE6A2F] to-[#FEFBDD]',
    textColor: 'text-[#FE6A2F]',
  },
  academy: {
    label: 'The Academy',
    description: 'Structured learning for teens building real fluency (ages 12–17)',
    icon: GraduationCap,
    gradient: 'from-[#6B21A8] to-[#F5F3FF]',
    textColor: 'text-[#6B21A8]',
  },
  professional: {
    label: 'The Success Hub',
    description: 'Professional English for career growth (ages 18+)',
    icon: Briefcase,
    gradient: 'from-[#059669] to-[#F0FDFA]',
    textColor: 'text-[#059669]',
  },
} as const;

const HubConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { studentLevel, loading } = useStudentLevel();
  const [confirming, setConfirming] = React.useState(false);

  if (loading || !studentLevel) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const hub = HUB_CONFIG[studentLevel];
  const Icon = hub.icon;

  const handleConfirm = async () => {
    if (!user) return;
    setConfirming(true);
    try {
      // Mark onboarding as completed
      await supabase
        .from('student_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      toast.success(`Welcome to ${hub.label}!`);
      navigate(getStudentDashboardRoute(studentLevel), { replace: true });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Hub gradient banner */}
          <div className={`h-2 bg-gradient-to-r ${hub.gradient}`} />

          <CardContent className="p-8 text-center space-y-6">
            <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${hub.gradient} flex items-center justify-center`}>
              <Icon className="h-8 w-8 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">
                You've been placed in
              </h1>
              <p className={`text-3xl font-extrabold mt-1 ${hub.textColor}`}>
                {hub.label}
              </p>
            </div>

            <p className="text-muted-foreground">{hub.description}</p>

            <Button
              onClick={handleConfirm}
              disabled={confirming}
              size="lg"
              className={`w-full bg-gradient-to-r ${hub.gradient} text-white font-semibold text-lg h-14 rounded-xl hover:opacity-90 transition-opacity`}
            >
              {confirming ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              )}
              Enter {hub.label}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default HubConfirmation;
