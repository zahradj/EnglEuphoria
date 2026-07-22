import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle,
  Star,
  Calendar,
  TrendingUp
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "lesson" | "message" | "achievement" | "homework" | "review";
  title: string;
  description: string;
  time: string;
  student?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    rating?: number;
    points?: number;
    status?: string;
  };
}

export const RecentActivityFeed = () => {
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "review",
      title: "New 5-star review",
      description: "Sarah gave you excellent feedback for yesterday's lesson",
      time: "2 minutes ago",
      student: { name: "Sarah Johnson", avatar: "/placeholder-student.jpg" },
      metadata: { rating: 5 }
    },
    {
      id: "2",
      type: "lesson",
      title: "Lesson completed",
      description: "Advanced conversation practice with Mike",
      time: "1 hour ago",
      student: { name: "Mike Chen", avatar: "/placeholder-student.jpg" },
      metadata: { status: "completed" }
    },
    {
      id: "3",
      type: "homework",
      title: "Homework submitted",
      description: "Emma submitted her grammar exercises",
      time: "3 hours ago",
      student: { name: "Emma Wilson", avatar: "/placeholder-student.jpg" },
      metadata: { status: "submitted" }
    },
    {
      id: "4",
      type: "achievement",
      title: "Teaching milestone reached",
      description: "You've completed 100 lessons this month!",
      time: "1 day ago",
      metadata: { points: 150 }
    },
    {
      id: "5",
      type: "message",
      title: "New message",
      description: "Alex has a question about pronunciation",
      time: "2 days ago",
      student: { name: "Alex Rodriguez", avatar: "/placeholder-student.jpg" }
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson": return <BookOpen className="h-4 w-4" />;
      case "message": return <MessageCircle className="h-4 w-4" />;
      case "achievement": return <Award className="h-4 w-4" />;
      case "homework": return <CheckCircle className="h-4 w-4" />;
      case "review": return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "lesson": return "text-primary bg-primary/10";
      case "message": return "text-blue-500 bg-blue-50";
      case "achievement": return "text-yellow-500 bg-yellow-50";
      case "homework": return "text-green-500 bg-green-50";
      case "review": return "text-orange-500 bg-orange-50";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "review": return "default";
      case "achievement": return "secondary";
      case "lesson": return "outline";
      default: return "secondary";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest updates from your teaching</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/5 transition-all duration-300 border border-transparent hover:border-border animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`p-2 rounded-xl ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-card-foreground">
                  {activity.title}
                </h4>
                <div className="flex items-center gap-2">
                  {activity.metadata?.rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(activity.metadata.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  )}
                  {activity.metadata?.points && (
                    <Badge variant={getBadgeVariant(activity.type)} className="text-xs">
                      +{activity.metadata.points} pts
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
              
              <div className="flex items-center justify-between">
                {activity.student && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.student.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.student.name}
                    </span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};