import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreditDisplayProps {
  totalCredits: number;
  loading?: boolean;
  showPurchaseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({
  totalCredits,
  loading = false,
  showPurchaseButton = true,
  size = 'md'
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-16 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const hasCredits = totalCredits > 0;
  const isLowCredits = totalCredits > 0 && totalCredits <= 2;

  const getCardStyle = () => {
    if (!hasCredits) return "border-destructive/30 bg-destructive/5";
    if (isLowCredits) return "border-warning/30 bg-warning/5";
    return "border-student/30 bg-student/5";
  };

  const getTextColor = () => {
    if (!hasCredits) return "text-destructive";
    if (isLowCredits) return "text-warning";
    return "text-student";
  };

  const getIcon = () => {
    if (!hasCredits) return <AlertTriangle className="w-5 h-5" />;
    return <Coins className="w-5 h-5" />;
  };

  return (
    <Card className={getCardStyle()}>
      <CardContent className={`${size === 'sm' ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getTextColor()} bg-current/10`}>
              {getIcon()}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Available Credits
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${getTextColor()}`}>
                  {totalCredits}
                </p>
                {isLowCredits && (
                  <Badge variant="outline" className="text-warning border-warning">
                    Low
                  </Badge>
                )}
                {!hasCredits && (
                  <Badge variant="destructive">
                    Empty
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {showPurchaseButton && (
            <div className="text-right">
              {!hasCredits ? (
                <Button 
                  size="sm"
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-student to-student-accent hover:from-student-dark hover:to-student text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Buy Credits
                </Button>
              ) : isLowCredits ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/pricing')}
                  className="border-warning text-warning hover:bg-warning/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Top Up
                </Button>
              ) : (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/pricing')}
                  className="text-muted-foreground hover:text-student"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add More
                </Button>
              )}
            </div>
          )}
        </div>

        {!hasCredits && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
            You need credits to book lessons with teachers
          </div>
        )}

        {isLowCredits && (
          <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
            Running low on credits - consider purchasing more
          </div>
        )}
      </CardContent>
    </Card>
  );
};