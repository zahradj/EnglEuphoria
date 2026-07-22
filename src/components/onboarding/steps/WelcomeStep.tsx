import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Rocket, BookOpen, ArrowRight } from 'lucide-react';
import { StudentLevel } from '@/hooks/useStudentLevel';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  studentLevel: StudentLevel;
  onNext: () => void;
}

const levelConfig = {
  playground: {
    title: "Welcome to Playground! 🎮",
    subtitle: "Get ready for an amazing adventure!",
    description: "We're going to learn English through fun games, songs, and exciting activities!",
    icon: Sparkles,
    mascot: "🦊",
    mascotName: "Pip the Fox",
    colorClass: "from-orange-400 to-yellow-400",
    buttonClass: "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600",
  },
  academy: {
    title: "Welcome to Academy! 🚀",
    subtitle: "Your journey to fluency starts here",
    description: "We'll customize your learning experience with topics you actually care about.",
    icon: Rocket,
    mascot: "🦉",
    mascotName: "Nova the Owl",
    colorClass: "from-indigo-500 to-violet-500",
    buttonClass: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600",
  },
  professional: {
    title: "Welcome to Professional Hub",
    subtitle: "Elevate your English for career success",
    description: "We'll create a personalized learning path focused on your professional goals.",
    icon: BookOpen,
    mascot: "🎯",
    mascotName: "Your Guide",
    colorClass: "from-emerald-500 to-teal-500",
    buttonClass: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
  },
};

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ studentLevel, onNext }) => {
  const config = levelConfig[studentLevel];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      {/* Mascot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="text-8xl mb-6"
      >
        {config.mascot}
      </motion.div>

      {/* Title Card */}
      <Card className="max-w-lg w-full border-0 shadow-xl bg-gradient-to-br from-background to-muted">
        <CardContent className="pt-8 pb-8 px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.colorClass} text-white mb-4`}>
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{config.mascotName}</span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              {config.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-4">
              {config.subtitle}
            </p>
            
            <p className="text-muted-foreground mb-8">
              {config.description}
            </p>

            {/* What to expect */}
            <div className="text-left bg-muted/50 rounded-xl p-4 mb-6">
              <p className="font-medium text-foreground mb-2">What's next:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">1.</span>
                  Tell us what you love (so we can make learning fun!)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">2.</span>
                  Quick English check (just 5 questions)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">3.</span>
                  Get your personalized learning path
                </li>
              </ul>
            </div>

            <Button
              onClick={onNext}
              size="lg"
              className={`w-full ${config.buttonClass} text-white font-semibold`}
            >
              Let's Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
