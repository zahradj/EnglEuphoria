
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Star } from "lucide-react";

interface StudentHeaderProps {
  studentName: string;
  studentId: string;
  hasProfile: boolean;
  studentProfile: any;
}

export const StudentHeader = ({ studentName, studentId, hasProfile, studentProfile }: StudentHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-blue-200">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold">
              {studentName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {studentName} ({studentId}) 👋
            </h2>
            <p className="text-gray-600">
              {hasProfile 
                ? "Ready to continue your English journey?" 
                : "Complete your profile to get started!"
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasProfile && studentProfile?.points && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 gap-1">
              <Star className="h-4 w-4 fill-current" />
              {studentProfile.points} points
            </Badge>
          )}
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};
