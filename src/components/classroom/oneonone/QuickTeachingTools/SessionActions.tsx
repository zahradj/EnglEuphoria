
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Clock, Sparkles, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SessionActions() {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} activated`,
      description: `${action} tool is now ready to use`,
    });
  };

  const sessionActions = [
    {
      name: "Set Goal",
      icon: Target,
      description: "Set lesson objective"
    },
    {
      name: "Quick Break",
      icon: Clock,
      description: "5-minute break timer"
    },
    {
      name: "AI Assist",
      icon: Sparkles,
      description: "Get teaching suggestions"
    },
    {
      name: "Student Check",
      icon: MessageCircle,
      description: "Quick comprehension check"
    }
  ];

  return (
    <Card className="p-3 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-blue-950/50 border-purple-200/50 dark:border-purple-700/50 shadow-md">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-sm flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent font-bold">
          <Target size={14} className="text-purple-500" />
          📋 Session Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        {sessionActions.map((action, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-100/50 hover:via-pink-100/50 hover:to-blue-100/50 cursor-pointer transition-all hover:shadow-sm"
            onClick={() => handleQuickAction(action.name)}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center shadow-sm">
              <action.icon size={10} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-purple-900 dark:text-purple-100">{action.name}</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">{action.description}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
