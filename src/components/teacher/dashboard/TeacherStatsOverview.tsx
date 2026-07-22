import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, Award, Target, Users, Calendar } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  color: string;
}

export const TeacherStatsOverview = () => {
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0, 0, 0]);
  
  const stats: StatItem[] = [
    {
      icon: Calendar,
      label: "Classes This Month",
      value: "28",
      change: "+12%",
      trend: "up",
      color: "text-primary"
    },
    {
      icon: Users,
      label: "Active Students",
      value: "12",
      change: "+2",
      trend: "up",
      color: "text-secondary"
    },
    {
      icon: Clock,
      label: "Teaching Hours",
      value: "42h",
      change: "+8h",
      trend: "up",
      color: "text-accent"
    },
    {
      icon: Award,
      label: "Average Rating",
      value: "4.9",
      change: "+0.2",
      trend: "up",
      color: "text-yellow-500"
    },
    {
      icon: Target,
      label: "Completion Rate",
      value: "96%",
      change: "+4%",
      trend: "up",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      label: "Growth Score",
      value: "89",
      change: "+15",
      trend: "up",
      color: "text-blue-500"
    }
  ];

  useEffect(() => {
    const targetValues = [28, 12, 42, 4.9, 96, 89];
    
    targetValues.forEach((target, index) => {
      let current = 0;
      const increment = target / 30;
      
      const animate = () => {
        current += increment;
        if (current >= target) {
          current = target;
        } else {
          requestAnimationFrame(animate);
        }
        
        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = current;
          return newValues;
        });
      };
      
      setTimeout(() => animate(), index * 100);
    });
  }, []);

  const formatValue = (value: number, index: number): string => {
    switch (index) {
      case 0: return Math.round(value).toString();
      case 1: return Math.round(value).toString();
      case 2: return `${Math.round(value)}h`;
      case 3: return value.toFixed(1);
      case 4: return `${Math.round(value)}%`;
      case 5: return Math.round(value).toString();
      default: return value.toString();
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label}
          className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 animate-fade-in"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-br from-background to-muted group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {formatValue(animatedValues[index], index)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </div>
                <div className={`text-xs flex items-center justify-center gap-1 ${
                  stat.trend === 'up' ? 'text-green-500' : 
                  stat.trend === 'down' ? 'text-red-500' : 
                  'text-muted-foreground'
                }`}>
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};