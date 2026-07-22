import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ConstellationStar } from '@/types/constellation';
import { format } from 'date-fns';

interface HistoricalEvent {
  id: string;
  starId: string;
  starName: string;
  type: 'loss' | 'gain' | 'milestone';
  brightnessChange: number;
  reason: string;
  date: Date;
}

interface ConstellationHistoryTabProps {
  stars: ConstellationStar[];
}

export const ConstellationHistoryTab = ({ stars }: ConstellationHistoryTabProps) => {
  // Mock historical data - in production, this would come from Supabase
  const events: HistoricalEvent[] = useMemo(() => [
    {
      id: '1',
      starId: 'attendance',
      starName: 'Attendance Star',
      type: 'loss',
      brightnessChange: -20,
      reason: 'Missed class on Monday',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      starId: 'technical',
      starName: 'Technical Readiness Star',
      type: 'loss',
      brightnessChange: -15,
      reason: 'Audio issues during lesson',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      starId: 'satisfaction',
      starName: 'Student Satisfaction Star',
      type: 'gain',
      brightnessChange: 10,
      reason: 'Received 5-star review from student',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      starId: 'consistency',
      starName: 'Consistency Star',
      type: 'milestone',
      brightnessChange: 0,
      reason: 'Completed 2-week perfect attendance streak',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: '5',
      starId: 'punctuality',
      starName: 'Punctuality Star',
      type: 'gain',
      brightnessChange: 5,
      reason: 'On time for all classes this week',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
  ], []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'loss':
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      case 'gain':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'milestone':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'loss':
        return 'border-destructive/50 bg-destructive/5';
      case 'gain':
        return 'border-green-500/50 bg-green-500/5';
      case 'milestone':
        return 'border-yellow-500/50 bg-yellow-500/5';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Showing events from the past 30 days</span>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 ${getEventColor(event.type)}`}>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-background/50">
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {event.starName}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.reason}
                      </p>
                    </div>
                    
                    {event.brightnessChange !== 0 && (
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        event.brightnessChange > 0
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {event.brightnessChange > 0 ? '+' : ''}{event.brightnessChange}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(event.date, 'MMM d, yyyy • h:mm a')}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No events recorded yet</p>
        </div>
      )}
    </div>
  );
};
