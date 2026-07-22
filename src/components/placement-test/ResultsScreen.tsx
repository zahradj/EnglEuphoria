import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, TrendingDown, RefreshCw, Home, Award } from 'lucide-react';

interface CEFRResult {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  percentage: number;
  strengths: string[];
  weaknesses: string[];
  recommendedStart: string;
}

interface BadgeItem {
  id: string;
  name: string;
  icon: React.ElementType;
  earned: boolean;
}

interface ResultsScreenProps {
  cefrResult: CEFRResult;
  badges: BadgeItem[];
  timeElapsed: number;
  onRestart: () => void;
  onGoHome: () => void;
}

export function ResultsScreen({ cefrResult, badges, timeElapsed, onRestart, onGoHome }: ResultsScreenProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 left-6"
      >
        <Logo size="medium" />
      </motion.div>
      
      {/* Celebration confetti effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
            animate={{
              y: window.innerHeight + 20,
              rotate: Math.random() * 360,
              opacity: 0
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity
            }}
            className="absolute w-3 h-3"
            style={{
              background: `hsl(${Math.random() * 360}, 70%, 60%)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0'
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto pt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-xl">
            <CardHeader className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-primary via-secondary to-accent rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy className="h-16 w-16 text-primary-foreground" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  🎉 Congratulations!
                </CardTitle>
                <p className="text-muted-foreground text-lg mt-2">
                  You've completed the English Adventure Test
                </p>
              </motion.div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* CEFR Level Result */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 p-8 rounded-2xl border-2 border-primary/30"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative">
                  <h3 className="text-center text-xl font-semibold mb-4">Your CEFR Level</h3>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                      className="inline-block bg-gradient-to-br from-primary to-secondary text-primary-foreground px-12 py-6 rounded-2xl shadow-xl"
                    >
                      <div className="text-6xl font-bold">{cefrResult.level}</div>
                      <div className="text-lg mt-2">{cefrResult.percentage}% Score</div>
                    </motion.div>
                  </div>
                  <p className="text-center text-muted-foreground mt-4">
                    Time: {formatTime(timeElapsed)}
                  </p>
                </div>
              </motion.div>

              {/* Strengths & Weaknesses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {cefrResult.strengths.map((strength, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span>{strength}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="bg-secondary/5 p-6 rounded-xl border border-secondary/20">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-secondary">
                    <TrendingDown className="h-5 w-5" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {cefrResult.weaknesses.map((weakness, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <TrendingDown className="h-4 w-4 text-secondary" />
                        <span>{weakness}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Badges Earned */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-gradient-to-br from-accent/10 to-primary/5 p-6 rounded-xl border border-accent/20"
              >
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Badges Earned ({badges.filter(b => b.earned).length}/{badges.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge, i) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: badge.earned ? 1 : 0.3, scale: 1 }}
                      transition={{ delay: 1.6 + i * 0.1 }}
                    >
                      <Badge
                        variant={badge.earned ? "default" : "outline"}
                        className="px-4 py-2 text-sm flex items-center gap-2"
                      >
                        <badge.icon className="h-4 w-4" />
                        {badge.name}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20"
              >
                <h4 className="font-bold text-lg mb-3">📚 Recommended Next Steps</h4>
                <p className="text-muted-foreground">{cefrResult.recommendedStart}</p>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="flex gap-4"
              >
                <Button
                  onClick={onRestart}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Retake Test
                </Button>
                <Button
                  onClick={onGoHome}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
