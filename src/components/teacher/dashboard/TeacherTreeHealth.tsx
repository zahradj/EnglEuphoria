import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sprout, Sun, Droplets, Sparkles, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TeacherTreeHealth as TreeHealthType, TREE_TIERS, SEASONAL_BADGES, TreeEvent } from '@/types/teacherTree';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { FallingLeaf } from '../tree/FallingLeaf';
import { useTreePhysics } from '@/hooks/useTreePhysics';
import '@/styles/tree-animations.css';

export const TeacherTreeHealth = () => {
  const { user } = useAuth();
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const { fallingLeaves, triggerLeafFall, handleLeafLanded, getWindStrength } = useTreePhysics();
  
  const [treeHealth, setTreeHealth] = useState<TreeHealthType>({
    totalLeaves: 10,
    maxLeaves: 10,
    sunlightPoints: 0,
    monthlyBlooms: 0,
    tier: 'blooming_mentor',
    tierName: 'Blooming Mentor',
    recentEvents: [],
    badges: [],
    weeklyStreak: 0,
  });
  const [previousLeaves, setPreviousLeaves] = useState(10);

  useEffect(() => {
    calculateTreeHealth();
  }, [user?.id]);

  const calculateTreeHealth = async () => {
    if (!user?.id) return;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    // Fetch lesson data
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('teacher_id', user.id)
      .gte('scheduled_at', monthStart.toISOString());

    let leaves = 10; // Start with full health
    const events: TreeEvent[] = [];

    if (lessons) {
      // Calculate losses
      const technicalIssues = lessons.filter(l => l.status === 'technical_issue').length;
      const lateCancellations = lessons.filter(l => 
        l.status === 'cancelled' && l.cancellation_reason === 'late'
      ).length;
      const absences = lessons.filter(l => l.status === 'teacher_absent').length;

      leaves -= technicalIssues * 1;
      leaves -= lateCancellations * 2;
      leaves -= absences * 3;

      // Add events for losses
      if (technicalIssues > 0) {
        events.push({
          id: 'tech',
          type: 'loss',
          leavesChanged: -technicalIssues,
          reason: `Technical issues during ${technicalIssues} lesson${technicalIssues > 1 ? 's' : ''}`,
          date: new Date(),
          icon: '🔧',
        });
      }

      if (lateCancellations > 0) {
        events.push({
          id: 'late',
          type: 'loss',
          leavesChanged: -lateCancellations * 2,
          reason: `${lateCancellations} late cancellation${lateCancellations > 1 ? 's' : ''}`,
          date: new Date(),
          icon: '⏰',
        });
      }

      if (absences > 0) {
        events.push({
          id: 'absent',
          type: 'loss',
          leavesChanged: -absences * 3,
          reason: `${absences} absence${absences > 1 ? 's' : ''} without notice`,
          date: new Date(),
          icon: '❌',
        });
      }

      // Calculate weekly streak
      const recentLessons = lessons.filter(l => 
        new Date(l.scheduled_at) >= weekStart
      );
      const perfectWeek = recentLessons.every(l => l.status === 'completed');
      
      if (perfectWeek && recentLessons.length > 0) {
        leaves = Math.min(leaves + 1, 10);
        events.push({
          id: 'streak',
          type: 'gain',
          leavesChanged: 1,
          reason: 'Perfect week! No issues',
          date: new Date(),
          icon: '✨',
        });
      }
    }

    // Determine tier
    let tier: TreeHealthType['tier'] = 'dormant_tree';
    if (leaves >= 9) tier = 'blooming_mentor';
    else if (leaves >= 7) tier = 'healthy_educator';
    else if (leaves >= 4) tier = 'wilting_branch';

    const tierInfo = TREE_TIERS[tier];

    // Award badges based on performance
    const earnedBadges = SEASONAL_BADGES.filter((badge) => {
      if (badge.id === 'perfect_month' && leaves >= 9) return true;
      if (badge.id === 'spring_blossom' && leaves === 10) return true;
      return false;
    }).map(b => ({ ...b, earnedDate: new Date() }));

    const newLeaves = Math.max(0, leaves);
    
    setTreeHealth({
      totalLeaves: newLeaves,
      maxLeaves: 10,
      sunlightPoints: Math.floor(newLeaves * 5),
      monthlyBlooms: newLeaves === 10 ? 1 : 0,
      tier,
      tierName: tierInfo.name,
      recentEvents: events,
      badges: earnedBadges,
      weeklyStreak: newLeaves >= 9 ? 1 : 0,
    });

    // Trigger falling leaf animation when leaves decrease
    if (newLeaves < previousLeaves) {
      const leavesLost = previousLeaves - newLeaves;
      setTimeout(() => {
        triggerLeafFall(leavesLost, treeContainerRef.current);
      }, 500);
    }
    
    setPreviousLeaves(newLeaves);
  };

  const tierInfo = TREE_TIERS[treeHealth.tier];
  const healthPercentage = (treeHealth.totalLeaves / treeHealth.maxLeaves) * 100;
  const windStrength = getWindStrength(treeHealth.tier);

  const getLeafColor = (index: number) => {
    if (index < treeHealth.totalLeaves) {
      return treeHealth.tier === 'blooming_mentor' ? 'text-emerald-500' :
             treeHealth.tier === 'healthy_educator' ? 'text-green-500' :
             treeHealth.tier === 'wilting_branch' ? 'text-amber-500' :
             'text-orange-400';
    }
    return 'text-gray-300';
  };

  const getHealthLevel = () => {
    if (treeHealth.totalLeaves >= 8) return 'high';
    if (treeHealth.totalLeaves >= 4) return 'medium';
    return 'low';
  };

  // Wind animation variants
  const windVariants = {
    calm: {
      x: 0,
      rotate: 0,
    },
    breeze: {
      x: [-1, 1, -1],
      rotate: [-1, 1, -1],
    },
    strong: {
      x: [-2, 2, -2],
      rotate: [-3, 3, -3],
    }
  };

  const windTransition = {
    breeze: {
      duration: 3,
      repeat: Infinity,
      ease: [0.4, 0.0, 0.2, 1] as const
    },
    strong: {
      duration: 2,
      repeat: Infinity,
      ease: [0.4, 0.0, 0.2, 1] as const
    }
  };

  return (
    <Card className="border-2 border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50/50 to-green-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              The Teacher Tree
            </span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-emerald-600" />
                  How Your Teacher Tree Works
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">🌱 Your Garden of Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Your tree starts with 10 healthy leaves representing your professional reliability.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">🍂 When Leaves Fall</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Technical issues: -1 leaf 🔧</li>
                    <li>• Late cancellations: -2 leaves ⏰</li>
                    <li>• Absences without notice: -3 leaves ❌</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">🌿 How to Regrow</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Perfect week: +1 leaf ✨</li>
                    <li>• 5-star reviews: Sunlight Points ☀️</li>
                    <li>• Perfect month: Flower bloom 🌸</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">🌳 Growth Tiers</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 🌸 Blooming Mentor (9-10 leaves)</li>
                    <li>• 🌿 Healthy Educator (7-8 leaves)</li>
                    <li>• 🍂 Wilting Branch (4-6 leaves)</li>
                    <li>• 🌰 Dormant Tree (0-3 leaves)</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tier Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{tierInfo.emoji}</span>
            <div>
              <p className="font-bold text-base text-gray-900">{tierInfo.name}</p>
              <p className="text-xs text-muted-foreground">{tierInfo.message}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-500">
              <Sun className="h-4 w-4" />
              <span className="text-sm font-semibold">{treeHealth.sunlightPoints}</span>
            </div>
            <p className="text-xs text-muted-foreground">Sunlight</p>
          </div>
        </div>

        {/* Tree Visualization with 2025 Animations */}
        <div 
          ref={treeContainerRef}
          className={`tree-container relative tree-perspective overflow-visible rounded-lg p-8 border border-emerald-200`}
          data-health={getHealthLevel()}
          style={{
            background: 'linear-gradient(to bottom, hsl(var(--sky-100) / 0.5), hsl(var(--emerald-100) / 0.5))',
            minHeight: '320px'
          }}
        >
          <div className="flex justify-center items-end relative h-64">
            {/* Background sparkle particles for healthy trees */}
            {treeHealth.totalLeaves >= 8 && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: `${20 + Math.random() * 30}%`,
                      background: 'hsl(var(--yellow-300))',
                    }}
                    animate={{
                      y: [0, -20, -40],
                      opacity: [0, 0.6, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Tree trunk - larger and more visible */}
            <motion.div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 tree-shadow trunk-sway z-10"
              style={{
                width: '48px',
                height: '140px',
                background: 'linear-gradient(to right, hsl(var(--amber-800)), hsl(var(--amber-700)), hsl(var(--amber-800)))',
                borderRadius: '12px 12px 4px 4px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset -4px 0 8px rgba(0,0,0,0.3), inset 4px 0 8px rgba(139, 69, 19, 0.3)'
              }}
              animate={windStrength === 'strong' ? {
                rotate: [-0.5, 0.5, -0.5],
                transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
              } : {}}
            >
              {/* Bark texture lines */}
              <div className="absolute inset-0 flex flex-col justify-around px-2 opacity-40">
                <div className="h-px bg-amber-950 rounded-full" />
                <div className="h-px bg-amber-950 rounded-full w-3/4" />
                <div className="h-px bg-amber-950 rounded-full" />
                <div className="h-px bg-amber-950 rounded-full w-2/3" />
              </div>
            </motion.div>
            
            {/* Tree canopy - circular leaf arrangement */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20" style={{ width: '200px', height: '160px' }}>
              {/* Back layer - deeper leaves */}
              <motion.div 
                className="absolute inset-0 leaf-layer-back"
                animate={windVariants[windStrength]}
                transition={windStrength !== 'calm' ? windTransition[windStrength] : undefined}
              >
                <div className="relative w-full h-full">
                  {[...Array(10)].map((_, i) => {
                    const angle = (i * 36) * (Math.PI / 180);
                    const radius = 60;
                    const x = 100 + radius * Math.cos(angle);
                    const y = 80 + radius * Math.sin(angle) * 0.6;
                    
                    return i < treeHealth.totalLeaves ? (
                      <motion.div
                        key={`back-${i}`}
                        className={`absolute text-3xl ${getLeafColor(i)}`}
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                          rotate: [-2, 2, -2],
                          y: [-1, 1, -1],
                        }}
                        transition={{
                          duration: 4,
                          delay: i * 0.1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        🍃
                      </motion.div>
                    ) : null;
                  })}
                </div>
              </motion.div>

              {/* Middle layer (main leaves) */}
              <motion.div 
                className="absolute inset-0 leaf-layer-middle"
                animate={windVariants[windStrength]}
                transition={windStrength !== 'calm' ? windTransition[windStrength] : undefined}
              >
                <AnimatePresence>
                  <div className="relative w-full h-full">
                    {[...Array(10)].map((_, i) => {
                      const angle = (i * 36) * (Math.PI / 180);
                      const radius = 70;
                      const x = 100 + radius * Math.cos(angle);
                      const y = 80 + radius * Math.sin(angle) * 0.6;
                      
                      return (
                        <motion.div
                          key={i}
                          className={`absolute text-4xl ${getLeafColor(i)} ${
                            treeHealth.totalLeaves >= 8 ? 'bloom-pulse' : 
                            treeHealth.totalLeaves < 4 ? 'wilt-droop' : ''
                          }`}
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'translate(-50%, -50%)',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                          }}
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ 
                            scale: i < treeHealth.totalLeaves ? [1, 1.05, 1] : 0.8,
                            opacity: i < treeHealth.totalLeaves ? 1 : 0.3,
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: i * 0.05,
                            scale: {
                              duration: treeHealth.totalLeaves >= 8 ? 2 : 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }
                          }}
                        >
                          {i < treeHealth.totalLeaves ? '🍃' : '🍂'}
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              </motion.div>

              {/* Front layer - closer leaves */}
              <motion.div 
                className="absolute inset-0 leaf-layer-front"
                animate={windVariants[windStrength]}
                transition={windStrength !== 'calm' ? windTransition[windStrength] : undefined}
              >
                <div className="relative w-full h-full">
                  {[...Array(10)].map((_, i) => {
                    const angle = (i * 36) * (Math.PI / 180);
                    const radius = 80;
                    const x = 100 + radius * Math.cos(angle);
                    const y = 80 + radius * Math.sin(angle) * 0.6;
                    
                    return i < treeHealth.totalLeaves ? (
                      <motion.div
                        key={`front-${i}`}
                        className={`absolute text-2xl ${getLeafColor(i)}`}
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                          rotate: [2, -2, 2],
                          y: [1, -1, 1],
                        }}
                        transition={{
                          duration: 3.5,
                          delay: i * 0.15,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        🍃
                      </motion.div>
                    ) : null;
                  })}
                </div>
              </motion.div>
            </div>

            {/* Falling leaves portal - positioned over entire container */}
            <div className="absolute inset-0 overflow-visible z-50 pointer-events-none">
              {fallingLeaves.map(leaf => (
                <FallingLeaf
                  key={leaf.id}
                  startPosition={leaf.startPos}
                  leafType={leaf.type}
                  onComplete={() => handleLeafLanded(leaf.id)}
                  delay={leaf.delay}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Health Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              Tree Health
            </span>
            <span className="font-bold text-gray-900">
              {treeHealth.totalLeaves}/{treeHealth.maxLeaves} leaves
            </span>
          </div>
          <Progress value={healthPercentage} className="h-2" />
        </div>

        {/* Recent Events */}
        {treeHealth.recentEvents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
            <div className="space-y-1">
              {treeHealth.recentEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-2 text-xs p-2 rounded ${
                    event.type === 'gain' || event.type === 'bloom'
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-orange-50 border border-orange-200'
                  }`}
                >
                  <span className="text-base">{event.icon}</span>
                  <div className="flex-1">
                    <p className="text-gray-900">{event.reason}</p>
                    <p className={`font-semibold ${
                      event.leavesChanged > 0 ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {event.leavesChanged > 0 ? '+' : ''}{event.leavesChanged} leaf
                      {Math.abs(event.leavesChanged) !== 1 ? 'ves' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {treeHealth.badges.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Seasonal Badges
            </p>
            <div className="flex flex-wrap gap-2">
              {treeHealth.badges.map((badge) => (
                <Badge
                  key={badge.id}
                  variant="secondary"
                  className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200"
                >
                  <span className="mr-1">{badge.icon}</span>
                  {badge.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Motivational message */}
        <div className="text-center pt-2 border-t border-emerald-200">
          <p className="text-xs italic text-emerald-700">
            🌱 Keep nurturing your garden — every lesson helps your tree grow! 🌿
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
