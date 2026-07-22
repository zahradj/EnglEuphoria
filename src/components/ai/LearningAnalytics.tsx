import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface LearningAnalyticsProps {
  studentId: string;
  analytics: any;
  onRefresh?: () => void;
}

export const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({
  analytics
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Learning Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analytics ? (
          <div className="grid gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{analytics.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{analytics.totalTimeMinutes}min</p>
              <p className="text-sm text-muted-foreground">Study Time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{analytics.averageRating}/5</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No analytics data available</p>
        )}
      </CardContent>
    </Card>
  );
};