import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar, 
  BookOpen, 
  MessageCircle, 
  FolderOpen, 
  Users,
  Video,
  Zap,
  Target,
  Award,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStudentLevel } from "@/hooks/useStudentLevel";

interface StudentQuickActionsProps {
  onJoinClassroom: () => void;
  onOpenHomeworkModal: () => void;
  onOpenMessageModal: () => void;
}

export const StudentQuickActions = ({ 
  onJoinClassroom, 
  onOpenHomeworkModal, 
  onOpenMessageModal 
}: StudentQuickActionsProps) => {
  const navigate = useNavigate();
  const { studentLevel } = useStudentLevel();
  const hubParam = studentLevel ? `?hub=${studentLevel}` : '';

  const quickActions = [
    {
      id: 'book-lesson',
      title: 'Book a Lesson',
      description: 'Schedule time with your teacher',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      onClick: () => navigate(`/find-teacher${hubParam}`)
    },
    {
      id: 'join-classroom',
      title: 'Join Classroom',
      description: 'Enter the virtual classroom',
      icon: Video,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white',
      onClick: onJoinClassroom
    },
    {
      id: 'submit-homework',
      title: 'Submit Work',
      description: 'Upload your assignments',
      icon: BookOpen,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      onClick: onOpenHomeworkModal
    },
    {
      id: 'message-teacher',
      title: 'Message Teacher',
      description: 'Ask questions or get help',
      icon: MessageCircle,
      color: 'bg-pink-500 hover:bg-pink-600',
      textColor: 'text-white',
      onClick: onOpenMessageModal
    },
    {
      id: 'practice',
      title: 'Practice',
      description: 'Work on vocabulary & grammar',
      icon: Zap,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      textColor: 'text-white',
      onClick: () => navigate('/student?tab=practice')
    },
    {
      id: 'progress',
      title: 'View Progress',
      description: 'Check your learning stats',
      icon: Target,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      textColor: 'text-white',
      onClick: () => navigate('/student?tab=progress')
    }
  ];

  const featuredActions = [
    {
      id: 'study-group',
      title: 'Join Study Group',
      description: 'Connect with other learners',
      icon: Users,
      gradient: 'from-cyan-400 to-blue-500',
      onClick: () => navigate('/study-groups')
    },
    {
      id: 'achievements',
      title: 'View Achievements',
      description: 'See your badges and rewards',
      icon: Award,
      gradient: 'from-yellow-400 to-orange-500',
      onClick: () => navigate('/achievements')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Quick Actions Grid */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-gray-800">Quick Actions</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={action.id}
                onClick={action.onClick}
                className={`group h-auto p-4 ${action.color} ${action.textColor} hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredActions.map((action, index) => (
          <Card 
            key={action.id}
            className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
            onClick={action.onClick}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`h-1 bg-gradient-to-r ${action.gradient}`}></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};