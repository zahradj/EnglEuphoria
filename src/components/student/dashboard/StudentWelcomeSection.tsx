import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  TrendingUp, 
  Flame, 
  Target, 
  GraduationCap, 
  Video, 
  Plus,
  Sparkles,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentWelcomeSectionProps {
  studentName: string;
  studentId: string;
  hasProfile: boolean;
  studentProfile: any;
  onJoinClassroom: () => void;
}

export const StudentWelcomeSection = ({ 
  studentName, 
  studentId, 
  hasProfile, 
  studentProfile, 
  onJoinClassroom 
}: StudentWelcomeSectionProps) => {
  const navigate = useNavigate();
  
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const currentDate = new Date();
  const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-student via-student-accent to-student-dark p-8 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-white/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              <span className="text-sm font-medium opacity-90">{dayOfWeek}</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {getTimeBasedGreeting()}, {studentName}!
            </h1>
            <p className="text-lg opacity-90">
              {hasProfile 
                ? "Ready to continue your English adventure?" 
                : "Let's start your English learning journey!"
              }
            </p>
            <p className="text-sm opacity-70 font-mono bg-white/10 rounded-lg px-3 py-1 inline-block">
              Student ID: {studentId}
            </p>
          </div>
          
          <div className="text-right bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <Calendar className="h-6 w-6 mx-auto mb-2 opacity-80" />
            <div className="text-sm opacity-80">Today</div>
            <div className="text-xl font-bold">{currentDate.toLocaleDateString()}</div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {hasProfile && studentProfile?.points && (
            <div className="group bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="bg-yellow-400/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-yellow-300 fill-current" />
              </div>
              <div className="text-2xl font-bold">{studentProfile.points}</div>
              <div className="text-xs opacity-80">Points Earned</div>
            </div>
          )}
          
          {hasProfile && studentProfile?.level && (
            <div className="group bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="bg-blue-400/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-blue-300" />
              </div>
              <div className="text-2xl font-bold">Level {studentProfile.level}</div>
              <div className="text-xs opacity-80">Current Level</div>
            </div>
          )}
          
          <div className="group bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="bg-orange-400/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6 text-orange-300" />
            </div>
            <div className="text-2xl font-bold">{hasProfile ? "7" : "0"}</div>
            <div className="text-xs opacity-80">Day Streak</div>
          </div>
          
          <div className="group bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="bg-green-400/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6 text-green-300" />
            </div>
            <div className="text-2xl font-bold">{hasProfile ? "3/5" : "0/5"}</div>
            <div className="text-xs opacity-80">Weekly Goal</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {!hasProfile && (
            <Button 
              onClick={() => navigate('/student?tab=profile')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm hover:scale-105 transition-all duration-200"
              size="lg"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Complete Profile
            </Button>
          )}
          
          <Button 
            onClick={onJoinClassroom}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <Video className="h-5 w-5 mr-2" />
            Join Classroom
          </Button>
          
          <Button 
            onClick={() => navigate('/discover-teachers')}
            className="bg-white hover:bg-white/90 text-student border-white backdrop-blur-sm hover:scale-105 transition-all duration-200 font-semibold"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Book New Lesson
          </Button>
        </div>
      </div>
    </div>
  );
};