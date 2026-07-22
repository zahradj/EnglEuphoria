
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, MessageCircle, Users, UserPlus, DollarSign } from "lucide-react";

interface QuickActionsCardProps {
  onScheduleClass: () => void;
  onCreateAssignment: () => void;
  onSendMessage: () => void;
  onManageStudents: () => void;
  onAddStudent: () => void;
  onViewEarnings: () => void;
}

export const QuickActionsCard = ({ 
  onScheduleClass, 
  onCreateAssignment, 
  onSendMessage, 
  onManageStudents,
  onAddStudent,
  onViewEarnings
}: QuickActionsCardProps) => {
  const actions = [
    {
      icon: UserPlus,
      label: "Add New Student",
      onClick: onAddStudent,
      variant: "default" as const,
      className: "bg-primary hover:bg-primary/90 text-primary-foreground",
      description: "Invite new students to join your classes"
    },
    {
      icon: Calendar,
      label: "Schedule Class",
      onClick: onScheduleClass,
      variant: "outline" as const,
      description: "Plan and organize upcoming lessons"
    },
    {
      icon: FileText,
      label: "Create Assignment",
      onClick: onCreateAssignment,
      variant: "outline" as const,
      description: "Design homework and practice materials"
    },
    {
      icon: DollarSign,
      label: "View Earnings",
      onClick: onViewEarnings,
      variant: "outline" as const,
      description: "Track your teaching income and performance"
    },
    {
      icon: MessageCircle,
      label: "Send Message",
      onClick: onSendMessage,
      variant: "outline" as const,
      description: "Communicate with students and parents"
    },
    {
      icon: Users,
      label: "Manage Students",
      onClick: onManageStudents,
      variant: "outline" as const,
      description: "View student progress and information"
    }
  ];

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-xl">
            <Calendar className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Manage your teaching workflow</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button 
            key={action.label}
            variant={action.variant}
            className={`w-full justify-start group/btn hover:scale-105 transition-all duration-300 h-auto p-4 animate-fade-in ${action.className || "hover:bg-accent hover:text-accent-foreground"}`}
            onClick={action.onClick}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-background/50 rounded-lg group-hover/btn:scale-110 transition-transform duration-300">
                <action.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{action.label}</div>
                <div className="text-xs opacity-70 mt-1">{action.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
