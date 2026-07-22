
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Bell, Settings } from "lucide-react";

interface TeacherDashboardHeaderProps {
  teacherName: string;
  onLogout: () => void;
}

export const TeacherDashboardHeader = ({ teacherName, onLogout }: TeacherDashboardHeaderProps) => {
  return (
    <header className="bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 text-white py-6 shadow-lg relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      
      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-16 w-16 border-4 border-white/20 shadow-lg">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {teacherName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold mb-1">Welcome back, {teacherName}! 👋</h1>
              <p className="text-blue-100 text-lg mb-2">Ready to inspire minds today?</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  🎓 Teacher Dashboard
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/30 text-white border-emerald-400/50">
                  ✨ Active Session
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 border border-white/30"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 border border-white/30"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
