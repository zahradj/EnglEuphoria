import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Brain,
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  LogOut,
  GraduationCap,
  Book,
  FolderOpen,
  User,
  Sparkles,
  Video
} from "lucide-react";

interface TeacherSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const TeacherSidebar = ({ activeTab, setActiveTab, onLogout }: TeacherSidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, type: 'tab' },
    { id: 'classroom', label: 'Live Classroom', icon: Video, type: 'tab' },
    { id: 'profile', label: 'My Profile', icon: User, type: 'tab' },
    { id: 'assessments', label: 'Assessments', icon: FileText, type: 'tab' },
    { id: 'ai-assistant', label: 'AI Curriculum', icon: Brain, type: 'tab' },

    { id: 'calendar', label: 'Calendar', icon: Calendar, type: 'tab' },
    { id: 'students', label: 'Students', icon: Users, type: 'tab' },
    { id: 'reading-library', label: 'Reading Library', icon: Book, type: 'tab' },
    { id: 'history', label: 'Lesson History', icon: Clock, type: 'tab' },
    { id: 'homework', label: 'Homework', icon: BookOpen, type: 'tab' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, type: 'tab' },
    { id: 'resources', label: 'Resources', icon: FolderOpen, type: 'tab' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, type: 'tab' },
    { id: 'earnings', label: 'Earnings', icon: DollarSign, type: 'tab' },
    { id: 'reports', label: 'Reports', icon: TrendingUp, type: 'tab' },
    { id: 'enterprise', label: 'Enterprise Hub', icon: BarChart3, type: 'tab' },
    { id: 'settings', label: 'Settings', icon: Settings, type: 'tab' }
  ];

  return (
    <div className="w-64 flex-shrink-0 border-r border-purple-200/50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 dark:border-purple-700/50 flex flex-col shadow-lg">
      <div className="h-16 flex items-center justify-center border-b border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-blue-100/50 dark:from-purple-900/50 dark:via-pink-900/50 dark:to-blue-900/50">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="ml-2 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">✨ Teacher Panel</span>
      </div>
      
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={`justify-start w-full transition-all ${
              activeTab === item.id 
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-md hover:shadow-lg' 
                : 'text-purple-600 hover:bg-purple-100/50 dark:text-purple-300 dark:hover:bg-purple-900/30'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
      
      <div className="p-4 border-t border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-t from-red-50/50 to-transparent dark:from-red-950/30">
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-100/50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};
