import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { StudentLevel } from '@/hooks/useStudentLevel';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InterestsStepProps {
  studentLevel: StudentLevel;
  selectedInterests: string[];
  onComplete: (interests: string[]) => void;
  onBack: () => void;
}

const interestCategories = {
  playground: [
    { id: 'games', label: 'Games & Fun', emoji: '🎮' },
    { id: 'animals', label: 'Animals', emoji: '🐾' },
    { id: 'cartoons', label: 'Cartoons', emoji: '📺' },
    { id: 'music', label: 'Music & Dancing', emoji: '🎵' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'art', label: 'Art & Drawing', emoji: '🎨' },
    { id: 'nature', label: 'Nature', emoji: '🌳' },
    { id: 'food', label: 'Food & Cooking', emoji: '🍕' },
  ],
  academy: [
    { id: 'gaming', label: 'Video Games', emoji: '🎮' },
    { id: 'music', label: 'Music & Concerts', emoji: '🎸' },
    { id: 'movies', label: 'Movies & Series', emoji: '🎬' },
    { id: 'sports', label: 'Sports & Fitness', emoji: '🏀' },
    { id: 'social', label: 'Social Media', emoji: '📱' },
    { id: 'tech', label: 'Technology', emoji: '💻' },
    { id: 'travel', label: 'Travel & Culture', emoji: '✈️' },
    { id: 'fashion', label: 'Fashion & Style', emoji: '👗' },
  ],
  professional: [
    { id: 'business', label: 'Business & Finance', emoji: '💼' },
    { id: 'tech', label: 'Technology & AI', emoji: '🤖' },
    { id: 'travel', label: 'Travel & Tourism', emoji: '🌍' },
    { id: 'health', label: 'Health & Wellness', emoji: '🏥' },
    { id: 'marketing', label: 'Marketing & Sales', emoji: '📈' },
    { id: 'education', label: 'Education', emoji: '🎓' },
    { id: 'science', label: 'Science & Research', emoji: '🔬' },
    { id: 'arts', label: 'Arts & Entertainment', emoji: '🎭' },
  ],
};

const levelConfig = {
  playground: {
    title: "What do you love? 💖",
    subtitle: "Pick 2 or more things you enjoy!",
    minSelection: 2,
    buttonClass: "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600",
    selectedClass: "border-orange-400 bg-orange-50 dark:bg-orange-950/30",
  },
  academy: {
    title: "What are you into? 🔥",
    subtitle: "Select at least 2 interests",
    minSelection: 2,
    buttonClass: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600",
    selectedClass: "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30",
  },
  professional: {
    title: "Your Professional Interests",
    subtitle: "Select areas relevant to your career goals",
    minSelection: 2,
    buttonClass: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    selectedClass: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
  },
};

export const InterestsStep: React.FC<InterestsStepProps> = ({
  studentLevel,
  selectedInterests: initialInterests,
  onComplete,
  onBack,
}) => {
  const [selected, setSelected] = useState<string[]>(initialInterests);
  const config = levelConfig[studentLevel];
  const interests = interestCategories[studentLevel];

  const toggleInterest = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const canContinue = selected.length >= config.minSelection;

  const getSelectedLabels = () => {
    return selected.map(id => interests.find(i => i.id === id)?.label).filter(Boolean) as string[];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
          <p className="text-muted-foreground">{config.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interest Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {interests.map((interest, index) => (
              <motion.button
                key={interest.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleInterest(interest.id)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200",
                  "hover:scale-105 hover:shadow-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  selected.includes(interest.id)
                    ? config.selectedClass
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {selected.includes(interest.id) && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="text-3xl mb-2">{interest.emoji}</div>
                <div className="text-sm font-medium text-foreground">
                  {interest.label}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Selection Count */}
          <div className="text-center">
            <span className={cn(
              "text-sm font-medium",
              canContinue ? "text-green-600" : "text-muted-foreground"
            )}>
              {selected.length} selected
              {!canContinue && ` (need at least ${config.minSelection})`}
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => onComplete(getSelectedLabels())}
              disabled={!canContinue}
              className={cn("flex-1 text-white", config.buttonClass)}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
