import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceMetric {
  label: string;
  lastMonth: number;
  thisMonth: number;
  unit?: string;
}

interface PerformanceCardProps {
  metrics: PerformanceMetric[];
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ metrics }) => {
  const getTrend = (lastMonth: number, thisMonth: number) => {
    if (thisMonth > lastMonth) return 'up';
    if (thisMonth < lastMonth) return 'down';
    return 'neutral';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">Metric</th>
                <th className="text-center py-2 font-medium text-muted-foreground">Last Month</th>
                <th className="text-center py-2 font-medium text-muted-foreground">This Month</th>
                <th className="text-center py-2 font-medium text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => {
                const trend = getTrend(metric.lastMonth, metric.thisMonth);
                return (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-3 text-foreground">{metric.label}</td>
                    <td className="py-3 text-center text-muted-foreground">
                      {metric.lastMonth}{metric.unit || ''}
                    </td>
                    <td className="py-3 text-center font-medium text-foreground">
                      {metric.thisMonth}{metric.unit || ''}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-center">
                        {getTrendIcon(trend)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
