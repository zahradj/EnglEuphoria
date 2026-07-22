import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trophy, Star, Award, ChevronRight, BookOpen, Sparkles, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6"
      >
        <Logo size="medium" />
      </motion.div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto pt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-xl">
            <CardHeader className="text-center space-y-6 pb-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="mx-auto relative"
              >
                <div className="w-28 h-28 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-3xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-14 w-14 text-primary-foreground" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent mb-3">
                  English Adventure Test
                </CardTitle>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Complete placement test from A1 → C2. Earn badges and discover your perfect level!
                </p>
              </motion.div>
            </CardHeader>
            
            <CardContent className="space-y-8 pt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-3 gap-4"
              >
                {[
                  { icon: Clock, title: "Duration", value: "25 minutes", color: "primary" },
                  { icon: Trophy, title: "25 Questions", value: "All skill areas", color: "secondary" },
                  { icon: Star, title: "5 Badges", value: "Earn as you progress", color: "accent" }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="flex items-center gap-3 p-5 bg-primary/5 rounded-xl border border-primary/20 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 rounded-2xl border-2 border-primary/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                <h4 className="font-bold text-xl mb-4 flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary" />
                  What You'll Get:
                </h4>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { icon: "✨", text: "Your precise CEFR level (A1-C2)" },
                    { icon: "🎯", text: "Strengths and areas for improvement" },
                    { icon: "📚", text: "Personalized curriculum recommendations" },
                    { icon: "🏆", text: "Achievement badges for motivation" }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <span className="text-2xl">{benefit.icon}</span>
                      <span>{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button 
                  onClick={onStart}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-primary/90 to-secondary hover:from-primary/90 hover:to-secondary/80 shadow-lg hover:shadow-xl transition-all group"
                >
                  <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Start English Adventure
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
