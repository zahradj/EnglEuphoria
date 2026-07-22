
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X,
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
  FolderOpen
} from "lucide-react";
import { Link } from "react-router-dom";

interface MobileTeacherNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  teacherName: string;
}

export function MobileTeacherNav({ activeTab, setActiveTab, onLogout, teacherName }: MobileTeacherNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, type: 'tab' },
    { id: 'ai-assistant', label: 'AI Curriculum', icon: Brain, type: 'tab' },
    { id: 'placement-test', label: 'Placement Test', icon: GraduationCap, type: 'tab' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, type: 'tab' },
    { id: 'students', label: 'Students', icon: Users, type: 'tab' },
    { id: 'reading-library', label: 'Reading Library', icon: Book, type: 'tab' },
    
    { id: 'history', label: 'Lesson History', icon: Clock, type: 'tab' },
    { id: 'assignments', label: 'Assignments', icon: FileText, type: 'tab' },
    { id: 'resources', label: 'Resources', icon: BookOpen, type: 'tab' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, type: 'tab' },
    { id: 'earnings', label: 'Earnings', icon: DollarSign, type: 'tab' },
    { id: 'reports', label: 'Reports', icon: TrendingUp, type: 'tab' },
    { id: 'settings', label: 'Settings', icon: Settings, type: 'tab' }
  ];

  const handleTabClick = (item: any) => {
    if (item.type === 'tab') {
      setActiveTab(item.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b md:hidden bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-purple-200/50 shadow-md">
      {/* Logo and Teacher Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            ✨ Engleuphoria
          </h1>
          <p className="text-xs text-purple-600 font-medium">👨‍🏫 {teacherName}</p>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-purple-200/50">
            <Menu className="h-5 w-5 text-purple-600" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-purple-200/50 bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-lg bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">👨‍🏫 Teacher Panel</h2>
                  <Badge className="mt-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300">
                    {teacherName} ✨
                  </Badge>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-12 text-left transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-md hover:shadow-lg' 
                        : 'text-purple-600 hover:bg-purple-100/50'
                    }`}
                    onClick={() => handleTabClick(item)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-purple-200/50 bg-gradient-to-t from-red-50/50 to-transparent">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 text-red-600 border-red-200 hover:bg-red-100/50 hover:text-red-700"
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
