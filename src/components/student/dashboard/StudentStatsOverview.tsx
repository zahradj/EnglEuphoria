import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  Target
} from "lucide-react";

interface StudentStatsOverviewProps {
  hasProfile: boolean;
  studentProfile?: any;
}

export const StudentStatsOverview = ({ hasProfile, studentProfile }: StudentStatsOverviewProps) => {
  if (!hasProfile) return null;

  const stats = [
    {
      title: "Weekly Progress",
      value: "60%",
      progress: 60,
      description: "3 of 5 lessons completed",
      icon: BarChart3,
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      iconColor: "text-orange-600",
      badgeColor: "bg-orange-100 text-orange-700"
    },
    {
      title: "Assignments",
      value: "2/2",
      progress: 100,
      description: "All completed this week",
      icon: CheckCircle2,
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      iconColor: "text-green-600",
      badgeColor: "bg-green-100 text-green-700",
      badgeText: "All Done"
    },
    {
      title: "Class Rank",
      value: "#5",
      progress: 90,
      description: "Top 10% of 50 students",
      icon: Users,
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600",
      badgeColor: "bg-purple-100 text-purple-700",
      badgeText: "Top 10%"
    },
    {
      title: "Study Time",
      value: "12h",
      progress: 75,
      description: "This week's learning time",
      icon: Clock,
      gradient: "from-blue-400 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      title: "Skills Mastered",
      value: "8",
      progress: 80,
      description: "New skills this month",
      icon: Award,
      gradient: "from-yellow-400 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
      iconColor: "text-yellow-600",
      badgeColor: "bg-yellow-100 text-yellow-700"
    },
    {
      title: "Reading Level",
      value: "B2",
      progress: 70,
      description: "Upper intermediate",
      icon: BookOpen,
      gradient: "from-teal-400 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50",
      iconColor: "text-teal-600",
      badgeColor: "bg-teal-100 text-teal-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
          <CardContent className={`p-6 bg-gradient-to-br ${stat.bgGradient} group-hover:from-white group-hover:to-white/50 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white/80 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">{stat.title}</h3>
              </div>
              {stat.badgeText && (
                <Badge className={`${stat.badgeColor} border-0 group-hover:scale-105 transition-transform duration-200`}>
                  {stat.badgeText}
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-gray-800 group-hover:text-gray-900">{stat.value}</div>
                {stat.progress && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">{stat.progress}%</span>
                  </div>
                )}
              </div>
              
              {stat.progress && (
                <div className="space-y-2">
                  <Progress 
                    value={stat.progress} 
                    className="h-2 bg-white/50"
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-600 group-hover:text-gray-700">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};