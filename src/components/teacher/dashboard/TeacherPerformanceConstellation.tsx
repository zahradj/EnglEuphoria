import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Star } from '../constellation/Star';
import { FallingStar } from '../constellation/FallingStar';
import { Starfield } from '../constellation/Starfield';
import { ConstellationLines } from '../constellation/ConstellationLines';
import { ConstellationDetailModal } from '../constellation/ConstellationDetailModal';
import { useConstellationPhysics } from '@/hooks/useConstellationPhysics';
import { CONSTELLATION_TIERS, INITIAL_STARS, type ConstellationStar, type FallingStarEvent } from '@/types/constellation';
import { Sparkles } from 'lucide-react';

export const TeacherPerformanceConstellation = () => {
  const [stars, setStars] = useState<ConstellationStar[]>(INITIAL_STARS);
  const [fallingStars, setFallingStars] = useState<FallingStarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  
  const fallingPositions = useConstellationPhysics(fallingStars);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const overallHealth = Math.round(
    stars.reduce((sum, star) => sum + star.brightness, 0) / stars.length
  );

  const currentTier = Object.entries(CONSTELLATION_TIERS).find(
    ([_, tier]) => overallHealth >= tier.minHealth
  )?.[1] || CONSTELLATION_TIERS.struggling;

  const handleStarClick = (starId: string) => {
    // Simulate a star falling for demo purposes
    const star = stars.find(s => s.id === starId);
    if (!star || star.brightness <= 0) return;

    const newFallingStar: FallingStarEvent = {
      id: `${starId}-${Date.now()}`,
      starId,
      startPosition: star.position,
      reason: 'Demo event',
      timestamp: new Date(),
    };

    setFallingStars(prev => [...prev, newFallingStar]);
    setStars(prev =>
      prev.map(s =>
        s.id === starId
          ? { ...s, brightness: Math.max(0, s.brightness - 20) }
          : s
      )
    );

    setTimeout(() => {
      setFallingStars(prev => prev.filter(f => f.id !== newFallingStar.id));
    }, 3000);
  };

  return (
    <>
      <Card 
        className="p-6 bg-gradient-to-br from-background via-background/95 to-primary/5 border-primary/20 overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Performance Constellation</h3>
              <p className="text-sm text-muted-foreground">
                {currentTier.emoji} {currentTier.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{overallHealth}%</div>
            <div className="text-xs text-muted-foreground">Overall Health</div>
          </div>
        </div>

        {/* Constellation Visualization */}
        <div
          ref={containerRef}
          className="relative w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden"
          style={{ minHeight: '320px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background starfield */}
          <Starfield density={40} />

          {/* Constellation lines */}
          <ConstellationLines
            stars={stars}
            width={dimensions.width}
            height={dimensions.height}
          />

          {/* Active stars */}
          {stars.map(star => (
            <Star
              key={star.id}
              star={star}
              onClick={() => handleStarClick(star.id)}
            />
          ))}

          {/* Falling stars */}
          {Array.from(fallingPositions.entries()).map(([id, position]) => {
            const fallingStar = fallingStars.find(f => f.id === id);
            const star = stars.find(s => s.id === fallingStar?.starId);
            if (!star) return null;

            return (
              <FallingStar
                key={id}
                icon={star.icon}
                x={position.x}
                y={position.y}
                rotation={position.rotation}
                opacity={position.opacity}
              />
            );
          })}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Status message */}
        <motion.div
          className="text-center text-sm text-muted-foreground p-3 rounded-lg bg-primary/5"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {currentTier.message}
        </motion.div>

        {/* Star legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {stars.map(star => (
            <div
              key={star.id}
              className="flex items-center gap-2 p-2 rounded bg-card/50 border border-border/50"
            >
              <span className="text-lg">{star.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{star.name.split(' ')[0]}</div>
                <div className="text-muted-foreground">{Math.round(star.brightness)}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Click hint */}
        <div className="text-center text-xs text-muted-foreground">
          Click to view detailed performance insights
        </div>
      </div>
    </Card>

      <ConstellationDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        stars={stars}
        overallHealth={overallHealth}
        tierName={currentTier.name}
      />
    </>
  );
};
