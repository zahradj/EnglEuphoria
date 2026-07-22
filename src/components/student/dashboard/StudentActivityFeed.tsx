import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Video, 
  Award, 
  CheckCircle2, 
  Clock,
  Star,
  MessageCircle,
  Users,
  Zap,
  TrendingUp
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'lesson' | 'homework' | 'achievement' | 'practice' | 'message' | 'quiz';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
  status?: 'completed' | 'pending' | 'in_progress';
}

interface StudentActivityFeedProps {
  hasProfile: boolean;
}

export const StudentActivityFeed = ({ hasProfile }: StudentActivityFeedProps) => {
  // Mock activity data - in real app this would come from API
  const activities: ActivityItem[] = hasProfile ? [
    {
      id: '1',
      type: 'lesson',
      title: 'Grammar Fundamentals',
      description: 'Completed lesson with Teacher Sarah',
      timestamp: '2 hours ago',
      points: 50,
      status: 'completed'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Vocabulary Master',
      description: 'Earned badge for learning 50+ words',
      timestamp: '1 day ago',
      points: 100
    },
    {
      id: '3',
      type: 'homework',
      title: 'Reading Comprehension',
      description: 'Submitted essay about animal habitats',
      timestamp: '2 days ago',
      points: 30,
      status: 'completed'
    },
    {
      id: '4',
      type: 'practice',
      title: 'Pronunciation Practice',
      description: 'Completed 15 minutes of speaking exercises',
      timestamp: '3 days ago',
      points: 20,
      status: 'completed'
    },
    {
      id: '5',
      type: 'quiz',
      title: 'Grammar Quiz',
      description: 'Scored 85% on present tense quiz',
      timestamp: '4 days ago',
      points: 40,
      status: 'completed'
    }
  ] : [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson': return Video;
      case 'homework': return BookOpen;
      case 'achievement': return Award;
      case 'practice': return Zap;
      case 'message': return MessageCircle;
      case 'quiz': return CheckCircle2;
      default: return BookOpen;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-purple-100 text-purple-600';
      case 'homework': return 'bg-green-100 text-green-600';
      case 'achievement': return 'bg-yellow-100 text-yellow-600';
      case 'practice': return 'bg-blue-100 text-blue-600';
      case 'message': return 'bg-pink-100 text-pink-600';
      case 'quiz': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'homework': return 'bg-green-50 text-green-700 border-green-200';
      case 'achievement': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'practice': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'message': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'quiz': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="text-gray-800">Recent Activity</span>
          {hasProfile && (
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
              {activities.length} activities
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {!hasProfile ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">No activity yet</h3>
            <p className="text-gray-500 mb-4">Complete your profile and start learning to see your activity here!</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">No recent activity</h3>
            <p className="text-gray-500 mb-4">Start learning to track your progress here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div 
                  key={activity.id} 
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-3 rounded-xl ${getActivityColor(activity.type)} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {activity.points && (
                          <Badge className={`${getActivityBadgeColor(activity.type)} text-xs`}>
                            <Star className="h-3 w-3 mr-1" />
                            +{activity.points}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{activity.timestamp}</span>
                      {activity.status && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{activity.status.replace('_', ' ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};