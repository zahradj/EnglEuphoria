import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  Plus,
  Flame,
  Star,
  Calendar,
  TrendingUp,
  Award
} from "lucide-react";

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  current: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  category: 'vocabulary' | 'grammar' | 'speaking' | 'reading' | 'writing';
  points: number;
  status: 'active' | 'completed' | 'overdue';
}

interface StudentLearningGoalsProps {
  hasProfile: boolean;
}

export const StudentLearningGoals = ({ hasProfile }: StudentLearningGoalsProps) => {
  // Mock goals data
  const learningGoals: LearningGoal[] = hasProfile ? [
    {
      id: '1',
      title: 'Master 50 New Vocabulary Words',
      description: 'Learn and practice new English vocabulary',
      progress: 68,
      target: 50,
      current: 34,
      deadline: '2024-02-15',
      priority: 'high',
      category: 'vocabulary',
      points: 100,
      status: 'active'
    },
    {
      id: '2',
      title: 'Complete 5 Grammar Exercises',
      description: 'Practice present and past tense',
      progress: 80,
      target: 5,
      current: 4,
      deadline: '2024-02-10',
      priority: 'medium',
      category: 'grammar',
      points: 75,
      status: 'active'
    },
    {
      id: '3',
      title: 'Read 3 Short Stories',
      description: 'Improve reading comprehension',
      progress: 100,
      target: 3,
      current: 3,
      deadline: '2024-02-05',
      priority: 'low',
      category: 'reading',
      points: 60,
      status: 'completed'
    },
    {
      id: '4',
      title: '10 Minutes Daily Speaking',
      description: 'Practice pronunciation daily',
      progress: 30,
      target: 7,
      current: 2,
      deadline: '2024-02-20',
      priority: 'high',
      category: 'speaking',
      points: 120,
      status: 'active'
    }
  ] : [];

  const dailyGoals = hasProfile ? [
    { id: '1', title: 'Review 10 vocabulary words', completed: true, points: 10 },
    { id: '2', title: 'Complete 1 grammar exercise', completed: true, points: 15 },
    { id: '3', title: 'Practice pronunciation for 5 minutes', completed: false, points: 10 },
    { id: '4', title: 'Read for 15 minutes', completed: false, points: 20 }
  ] : [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vocabulary': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'grammar': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'speaking': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'reading': return 'bg-green-100 text-green-700 border-green-200';
      case 'writing': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const completedToday = dailyGoals.filter(goal => goal.completed).length;
  const totalDailyPoints = dailyGoals.filter(goal => goal.completed).reduce((sum, goal) => sum + goal.points, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Goals */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-gray-800">Today's Goals</span>
            </div>
            {hasProfile && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                {completedToday}/{dailyGoals.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {!hasProfile ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Set Your Goals</h3>
              <p className="text-gray-500 mb-4">Complete your profile to start setting daily learning goals!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Daily Progress Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Daily Progress</span>
                  <span className="text-sm text-gray-600">{(completedToday / dailyGoals.length * 100).toFixed(0)}%</span>
                </div>
                <Progress value={completedToday / dailyGoals.length * 100} className="mb-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{completedToday} of {dailyGoals.length} completed</span>
                  <div className="flex items-center gap-1 text-orange-600 font-medium">
                    <Star className="h-4 w-4" />
                    +{totalDailyPoints} points
                  </div>
                </div>
              </div>

              {/* Daily Goals List */}
              <div className="space-y-3">
                {dailyGoals.map((goal, index) => (
                  <div 
                    key={goal.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      goal.completed 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`p-1 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {goal.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${goal.completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                        {goal.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="h-3 w-3" />
                      +{goal.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Learning Goals */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-800">Learning Goals</span>
            </div>
            {hasProfile && (
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {!hasProfile ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">No goals set</h3>
              <p className="text-gray-500 mb-4">Complete your profile to start setting learning goals!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {learningGoals.map((goal, index) => (
                <div 
                  key={goal.id}
                  className="group p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-gray-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {goal.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                      {goal.status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress: {goal.current}/{goal.target}</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                      <Badge className={getPriorityColor(goal.priority)} variant="outline">
                        {goal.priority} priority
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 font-medium">
                      <Award className="h-3 w-3" />
                      {goal.points} points
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};