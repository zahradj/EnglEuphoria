
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Star, Clock, ArrowRight } from "lucide-react";
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { HUB_THEMES, HubId } from '@/utils/hubTheme';
import { cn } from '@/lib/utils';

const HUB_COLOR_MAP: Record<string, {
  headerGradient: string;
  headerTextMuted: string;
  iconBg: string;
  iconColor: string;
  statColor: string;
}> = {
  playground: {
    headerGradient: 'from-amber-500 via-orange-500 to-red-500',
    headerTextMuted: 'text-orange-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    statColor: 'text-orange-600',
  },
  academy: {
    headerGradient: 'from-indigo-600 via-blue-600 to-purple-600',
    headerTextMuted: 'text-indigo-100',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    statColor: 'text-indigo-600',
  },
  professional: {
    headerGradient: 'from-emerald-600 via-green-600 to-teal-600',
    headerTextMuted: 'text-emerald-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    statColor: 'text-emerald-600',
  },
};

export const TeachersTab = () => {
  const navigate = useNavigate();
  const { studentLevel } = useStudentLevel();
  const hubId = studentLevel || 'playground';
  const colors = HUB_COLOR_MAP[hubId] || HUB_COLOR_MAP.playground;

  const featuredTeachers: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className={cn('bg-gradient-to-r rounded-lg p-6 text-white', colors.headerGradient)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Find Your Perfect Teacher</h2>
            <p className={colors.headerTextMuted}>
              Browse qualified teachers and book your next lesson
            </p>
          </div>
          <Users className="h-12 w-12 text-white/60" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => navigate(`/find-teacher?hub=${hubId}`)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-lg', colors.iconBg)}>
                <Search className={cn('h-6 w-6', colors.iconColor)} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Browse All Teachers</h3>
                <p className="text-muted-foreground text-sm">Search by specialization, accent, or rating</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/find-teacher?hub=${hubId}`)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-lg', colors.iconBg)}>
                <Clock className={cn('h-6 w-6', colors.iconColor)} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Quick Book</h3>
                <p className="text-muted-foreground text-sm">Find available teachers for today</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Teachers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Teachers Found</h3>
              <p className="text-muted-foreground mb-6">You haven't connected with any teachers yet.</p>
              <Button 
                onClick={() => navigate(`/find-teacher?hub=${hubId}`)}
                className={cn('px-8 text-white bg-gradient-to-r', colors.headerGradient)}
              >
                Discover Teachers
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTeachers.map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', colors.iconBg)}>
                      <span className={cn('font-semibold', colors.iconColor)}>
                        {teacher.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{teacher.name}</h4>
                      <p className="text-sm text-muted-foreground">{teacher.accent} accent</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{teacher.rating}</span>
                    <span className="text-sm text-muted-foreground">({teacher.reviews} reviews)</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {teacher.specializations.map((spec: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-muted-foreground">{teacher.experience} years exp.</span>
                    <span className={cn('font-semibold', colors.statColor)}>{teacher.rate}</span>
                  </div>

                  <Button 
                    className={cn('w-full text-white bg-gradient-to-r', colors.headerGradient)} 
                    size="sm"
                    onClick={() => navigate(`/find-teacher?hub=${hubId}`)}
                  >
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className={cn('text-2xl font-bold mb-1', colors.statColor)}>50+</div>
            <div className="text-sm text-muted-foreground">Qualified Teachers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className={cn('text-2xl font-bold mb-1', colors.statColor)}>4.8</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className={cn('text-2xl font-bold mb-1', colors.statColor)}>95%</div>
            <div className="text-sm text-muted-foreground">Student Satisfaction</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
