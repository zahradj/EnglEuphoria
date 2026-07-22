import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ConstellationStar } from '@/types/constellation';
import { format, addDays } from 'date-fns';

interface RegenerationPrediction {
  starId: string;
  starName: string;
  starIcon: string;
  currentBrightness: number;
  targetBrightness: number;
  daysToRegenerate: number;
  regenerationDate: Date;
  dailyGain: number;
  status: 'regenerating' | 'healthy' | 'critical';
}

interface ConstellationTimelineTabProps {
  stars: ConstellationStar[];
}

export const ConstellationTimelineTab = ({ stars }: ConstellationTimelineTabProps) => {
  const predictions: RegenerationPrediction[] = useMemo(() => {
    return stars.map(star => {
      const dailyGain = 5; // Base regeneration rate: 5% per day
      const brightnessDeficit = star.maxBrightness - star.brightness;
      const daysToRegenerate = Math.ceil(brightnessDeficit / dailyGain);
      
      let status: 'regenerating' | 'healthy' | 'critical' = 'healthy';
      if (star.brightness < 50) status = 'critical';
      else if (star.brightness < 100) status = 'regenerating';

      return {
        starId: star.id,
        starName: star.name,
        starIcon: star.icon,
        currentBrightness: star.brightness,
        targetBrightness: star.maxBrightness,
        daysToRegenerate,
        regenerationDate: addDays(new Date(), daysToRegenerate),
        dailyGain,
        status,
      };
    });
  }, [stars]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/5';
      case 'regenerating':
        return 'border-yellow-500/50 bg-yellow-500/5';
      case 'healthy':
        return 'border-green-500/50 bg-green-500/5';
      default:
        return 'border-border bg-card';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'regenerating':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'healthy':
        return <Sparkles className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (a.status === 'critical' && b.status !== 'critical') return -1;
    if (a.status !== 'critical' && b.status === 'critical') return 1;
    return a.daysToRegenerate - b.daysToRegenerate;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Estimated regeneration timeline based on consistent performance</span>
      </div>

      <div className="space-y-3">
        {sortedPredictions.map((prediction, index) => (
          <motion.div
            key={prediction.starId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 ${getStatusColor(prediction.status)}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{prediction.starIcon}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {prediction.starName}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {prediction.status === 'healthy'
                          ? 'At full brightness'
                          : prediction.status === 'critical'
                          ? 'Needs urgent attention'
                          : 'Recovering steadily'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(prediction.status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Brightness</span>
                    <span className="font-medium">{Math.round(prediction.currentBrightness)}%</span>
                  </div>
                  <Progress value={prediction.currentBrightness} className="h-2" />
                </div>

                {prediction.status !== 'healthy' && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Days to Full Recovery</div>
                      <div className="text-lg font-semibold text-foreground">
                        {prediction.daysToRegenerate} days
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Expected Date</div>
                      <div className="text-sm font-medium text-foreground">
                        {format(prediction.regenerationDate, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                )}

                {prediction.status !== 'healthy' && (
                  <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                    💡 Gaining +{prediction.dailyGain}% brightness per day with consistent performance
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
