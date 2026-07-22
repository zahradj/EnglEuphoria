
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, Calendar } from "lucide-react";

interface TeacherHeaderProps {
  teacherName: string;
}

export const TeacherHeader = ({ teacherName }: TeacherHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-teal-200">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold">
              {teacherName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Good morning, {teacherName}! 👋
            </h2>
            <p className="text-gray-600">Ready to inspire your students today?</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-teal-100 text-teal-800">
            Today: 3 classes
          </Badge>
          
          <Button variant="ghost" size="sm" className="relative">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          <Button variant="ghost" size="sm">
            <Calendar className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
