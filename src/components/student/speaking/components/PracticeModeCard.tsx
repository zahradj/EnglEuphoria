
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakingScenario } from '@/types/speaking';
import { PlayCircle, LucideIcon } from 'lucide-react';

interface PracticeModeCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  scenarios: SpeakingScenario[];
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
  titleColor: string;
  isLiveChat?: boolean;
  onStartPractice: (scenario: SpeakingScenario, isLiveChat?: boolean) => void;
}

export const PracticeModeCard: React.FC<PracticeModeCardProps> = ({
  title,
  icon: Icon,
  description,
  scenarios,
  borderColor,
  iconBgColor,
  iconColor,
  titleColor,
  isLiveChat = false,
  onStartPractice
}) => {
  return (
    <Card className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 ${borderColor} hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20`}>
      <CardHeader className="text-center pb-4 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className={`relative mx-auto w-20 h-20 ${iconBgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl`}>
          <Icon className={`h-10 w-10 ${iconColor} group-hover:animate-pulse`} />
          
          {/* Floating sparkle effect */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
        </div>
        
        <CardTitle className={`text-xl font-bold ${titleColor} group-hover:text-primary transition-colors duration-300 relative z-10`}>
          {title}
        </CardTitle>
        
        {isLiveChat && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        <p className="text-muted-foreground text-center text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
          {description}
        </p>
        
        <div className="space-y-3">
          {scenarios.slice(0, 3).map((scenario, index) => (
            <Button
              key={scenario.id}
              variant="ghost"
              className="w-full justify-between text-left p-3 h-auto group-hover:bg-primary/10 hover:bg-primary/20 transition-all duration-200 rounded-xl border border-transparent hover:border-primary/20"
              onClick={() => onStartPractice(scenario, isLiveChat)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{scenario.name}</div>
                <div className="text-xs text-muted-foreground">
                  {scenario.expected_duration ? `${Math.floor(scenario.expected_duration / 60)}min` : '5min'} • 
                  Level {scenario.cefr_level}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {scenario.cefr_level}
                </Badge>
                <PlayCircle className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              </div>
            </Button>
          ))}
        </div>
        
        {scenarios.length > 3 && (
          <div className="text-center pt-2">
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              +{scenarios.length - 3} more scenarios
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
