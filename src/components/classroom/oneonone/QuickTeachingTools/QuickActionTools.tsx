
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Timer, 
  Star, 
  Award, 
  Upload, 
  Gamepad2, 
  BookOpen,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickActionToolsProps {
  currentUser?: {
    role: 'teacher' | 'student';
    name: string;
  };
}

export function QuickActionTools({ 
  currentUser = { role: 'teacher', name: 'Teacher' }
}: QuickActionToolsProps) {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} activated`,
      description: `${action} tool is now ready to use`,
    });
  };

  const quickTools = [
    {
      name: "Start Timer",
      icon: Timer,
      color: "bg-blue-500 hover:bg-blue-600",
      shortcut: "T",
      action: () => handleQuickAction("Timer")
    },
    {
      name: "Award Star",
      icon: Star,
      color: "bg-yellow-500 hover:bg-yellow-600",
      shortcut: "S",
      action: () => handleQuickAction("Star Award")
    },
    {
      name: "Show Rewards",
      icon: Award,
      color: "bg-purple-500 hover:bg-purple-600",
      shortcut: "R",
      action: () => handleQuickAction("Rewards Panel")
    },
    {
      name: "Upload Material",
      icon: Upload,
      color: "bg-green-500 hover:bg-green-600",
      shortcut: "U",
      action: () => handleQuickAction("Material Upload")
    },
    {
      name: "Quick Games",
      icon: Gamepad2,
      color: "bg-orange-500 hover:bg-orange-600",
      shortcut: "G",
      action: () => handleQuickAction("Games Library")
    },
    {
      name: "Homework",
      icon: BookOpen,
      color: "bg-indigo-500 hover:bg-indigo-600",
      shortcut: "H",
      action: () => handleQuickAction("Homework Assignment")
    }
  ];

  return (
    <Card className="p-3 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-blue-950/50 border-purple-200/50 dark:border-purple-700/50 shadow-md">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-sm flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent font-bold">
          <Sparkles size={14} className="text-purple-500" />
          ✨ Quick Tools
          <Badge variant="secondary" className="text-xs ml-auto bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300">
            👨‍🏫 Teacher
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-2">
          {quickTools.map((tool, index) => (
            <Button
              key={index}
              size="sm"
              className={`${tool.color} text-white text-xs h-8 relative group`}
              onClick={tool.action}
            >
              <tool.icon size={12} className="mr-1" />
              <span className="hidden sm:inline">{tool.name}</span>
              <span className="sm:hidden">{tool.icon.name}</span>
              <kbd className="absolute -top-1 -right-1 bg-white text-gray-800 text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {tool.shortcut}
              </kbd>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
