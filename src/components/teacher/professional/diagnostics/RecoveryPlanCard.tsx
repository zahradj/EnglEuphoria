import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface RecoveryItem {
  phoneme: string;
  errorRate: number;
  errorType: 'articulation' | 'recognition' | 'grammar' | 'vocabulary';
  suggestedAction: string;
  layerRecommendation?: {
    repeatLayers: ('phonics' | 'vocabulary' | 'grammar')[];
    advanceLayers: ('phonics' | 'vocabulary' | 'grammar')[];
  };
}

interface RecoveryPlanCardProps {
  recoveryItems: RecoveryItem[];
  studentName: string;
  onTriggerRecovery?: (phoneme: string) => void;
}

export const RecoveryPlanCard: React.FC<RecoveryPlanCardProps> = ({
  recoveryItems,
  studentName,
  onTriggerRecovery,
}) => {
  if (recoveryItems.length === 0) {
    return (
      <Card className="border border-[#2E7D32]/15 bg-[#2E7D32]/[0.02] shadow-sm">
        <CardContent className="py-6 text-center">
          <Zap className="h-8 w-8 text-[#2E7D32] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#2E7D32]">All Clear</p>
          <p className="text-xs text-muted-foreground mt-1">
            {studentName} has no phonemes requiring a Recovery Mission
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#EF5350]/15 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#EF5350] flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Recovery Plan — {recoveryItems.length} Phoneme{recoveryItems.length > 1 ? 's' : ''}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Error rate &gt;30% detected. Auto-generating Recovery Missions for {studentName}.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recoveryItems.map((item) => (
          <div
            key={item.phoneme}
            className="flex items-center justify-between p-3 rounded-lg border border-[#EF5350]/10 bg-[#EF5350]/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#EF5350]/10 flex items-center justify-center">
                <span className="font-mono font-bold text-sm text-[#EF5350]">/{item.phoneme}/</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Error Rate: {item.errorRate}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Type: {item.errorType === 'articulation' ? '🗣 Articulation (sound production)'
                    : item.errorType === 'grammar' ? '📝 Grammar (structure/rules)'
                    : item.errorType === 'vocabulary' ? '📖 Vocabulary (word mapping)'
                    : '👁 Recognition (visual mapping)'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.suggestedAction}</p>
                {item.layerRecommendation && (
                  <div className="flex gap-2 mt-1">
                    {item.layerRecommendation.repeatLayers.length > 0 && (
                      <span className="text-[9px] bg-[#EF5350]/10 text-[#EF5350] px-1.5 py-0.5 rounded-full">
                        Repeat: {item.layerRecommendation.repeatLayers.join(', ')}
                      </span>
                    )}
                    {item.layerRecommendation.advanceLayers.length > 0 && (
                      <span className="text-[9px] bg-[#4CAF50]/10 text-[#2E7D32] px-1.5 py-0.5 rounded-full">
                        Advance: {item.layerRecommendation.advanceLayers.join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-[#EF5350]/30 text-[#EF5350] hover:bg-[#EF5350]/5 gap-1 shrink-0"
              onClick={() => onTriggerRecovery?.(item.phoneme)}
            >
              Recovery Mission
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
