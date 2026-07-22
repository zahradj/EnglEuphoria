import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  MessageCircle, 
  DollarSign,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react';

interface TodayAtGlanceProps {
  teacherName: string;
}

export const TodayAtGlance: React.FC<TodayAtGlanceProps> = ({ teacherName }) => {
  const navigate = useNavigate();

  const nextClass = {
    time: '2:30 PM',
    student: 'Anna Rodriguez',
    level: 'A2',
    subject: 'Conversation Practice',
    duration: '60 min',
    roomId: `class-${Date.now()}`
  };

  const todayStats = [
    {
      title: 'Today\'s Earnings',
      value: '$180',
      change: '+$45',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Classes Today',
      value: '4',
      change: '2 completed',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Unread Messages',
      value: '7',
      change: '3 urgent',
      icon: MessageCircle,
      color: 'text-orange-600'
    },
    {
      title: 'Performance Score',
      value: '96%',
      change: '+2% this week',
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  const startClass = () => {
    navigate(`/classroom-prejoin?roomId=${nextClass.roomId}&role=teacher&name=${encodeURIComponent(teacherName)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome and Next Class */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Next Class Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Next Class
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{nextClass.time}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {nextClass.level}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{nextClass.student}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{nextClass.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{nextClass.duration}</span>
                </div>
              </div>
            </div>
            
            <Button onClick={startClass} className="w-full" size="lg">
              <Video className="h-4 w-4 mr-2" />
              Start Class
            </Button>
          </CardContent>
        </Card>

        {/* Today's Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {todayStats.map((stat) => {
            const IconComponent = stat.icon;
            
            return (
              <Card key={stat.title} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <IconComponent className={`h-4 w-4 ${stat.color}`} />
                      <div className="text-xs text-muted-foreground">
                        {stat.change}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.title}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '9:00 AM', student: 'Maria Santos', level: 'B1', status: 'completed' },
              { time: '11:30 AM', student: 'John Kim', level: 'A1', status: 'completed' },
              { time: '2:30 PM', student: 'Anna Rodriguez', level: 'A2', status: 'upcoming' },
              { time: '4:00 PM', student: 'David Chen', level: 'B2', status: 'upcoming' }
            ].map((lesson, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  lesson.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : lesson.status === 'upcoming'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">{lesson.time}</div>
                  <div className="text-sm">{lesson.student}</div>
                  <Badge variant="outline" className="text-xs">
                    {lesson.level}
                  </Badge>
                </div>
                
                <Badge 
                  variant={lesson.status === 'completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {lesson.status === 'completed' ? 'Completed' : 'Upcoming'}
                </Badge>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate('/teacher/schedule')}
          >
            View Full Schedule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};