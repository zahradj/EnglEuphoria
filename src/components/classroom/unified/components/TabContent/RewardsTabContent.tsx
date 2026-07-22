
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Calendar, 
  Zap, 
  Crown,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export function RewardsTabContent() {
  const [expandedAll, setExpandedAll] = useState(false);

  const rewardCategories = [
    {
      id: "recent",
      title: "Recent Rewards",
      icon: Trophy,
      count: 3,
      rewards: [
        {
          id: 1,
          title: "Perfect Pronunciation!",
          points: 25,
          icon: Star,
          time: "2 min ago",
          category: "skill"
        },
        {
          id: 2,
          title: "Quick Learner",
          points: 15,
          icon: Award,
          time: "5 min ago",
          category: "achievement"
        },
        {
          id: 3,
          title: "Lesson Complete",
          points: 50,
          icon: Target,
          time: "1 hour ago",
          category: "milestone"
        }
      ]
    },
    {
      id: "daily",
      title: "Daily Challenges",
      icon: Calendar,
      count: 2,
      rewards: [
        {
          id: 4,
          title: "Daily Login Streak",
          points: 10,
          icon: Zap,
          time: "Today",
          category: "daily"
        },
        {
          id: 5,
          title: "Practice Session",
          points: 20,
          icon: Star,
          time: "Today",
          category: "daily"
        }
      ]
    },
    {
      id: "achievements",
      title: "Special Achievements",
      icon: Crown,
      count: 1,
      rewards: [
        {
          id: 6,
          title: "First Week Champion",
          points: 100,
          icon: Crown,
          time: "Yesterday",
          category: "special"
        }
      ]
    }
  ];

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case "skill":
        return "bg-mint-50 border-mint-200 hover:bg-mint-100";
      case "achievement":
        return "bg-mint-100 border-mint-300 hover:bg-mint-200";
      case "milestone":
        return "bg-mint-200 border-mint-400 hover:bg-mint-300";
      case "daily":
        return "bg-mint-light border-mint-100 hover:bg-mint-50";
      case "special":
        return "bg-gradient-to-br from-mint-100 to-mint-200 border-mint-300 hover:from-mint-200 hover:to-mint-300";
      default:
        return "bg-mint-50 border-mint-200 hover:bg-mint-100";
    }
  };

  const getIconColorClass = (category: string) => {
    switch (category) {
      case "skill":
        return "text-mint-600";
      case "achievement":
        return "text-mint-700";
      case "milestone":
        return "text-mint-800";
      case "daily":
        return "text-mint-500";
      case "special":
        return "text-mint-900";
      default:
        return "text-mint-600";
    }
  };

  const toggleExpandAll = () => {
    setExpandedAll(!expandedAll);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Trophy size={16} className="text-mint-600" />
          <span className="bg-gradient-to-r from-mint-600 to-mint-800 bg-clip-text text-transparent">
            Rewards & Achievements
          </span>
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpandAll}
          className="text-xs text-mint-600 hover:text-mint-800 hover:bg-mint-50"
        >
          {expandedAll ? (
            <>
              <ChevronUp size={14} className="mr-1" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown size={14} className="mr-1" />
              Expand All
            </>
          )}
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2" value={expandedAll ? rewardCategories.map(cat => cat.id) : undefined}>
        {rewardCategories.map((category) => (
          <AccordionItem
            key={category.id}
            value={category.id}
            className="border border-mint-100 rounded-lg bg-mint-light/50 hover:bg-mint-light transition-all duration-300"
          >
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <div className="p-1.5 rounded-full bg-mint-100">
                  <category.icon size={14} className="text-mint-700" />
                </div>
                <div>
                  <div className="font-medium text-sm text-mint-800">{category.title}</div>
                  <div className="text-xs text-mint-600">{category.count} rewards</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-2">
                {category.rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-mint-200/50 ${getCategoryColorClass(reward.category)}`}
                  >
                    <div className={`p-2 rounded-full bg-white/80 ${getIconColorClass(reward.category)} animate-pulse-subtle`}>
                      <reward.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-mint-900">{reward.title}</div>
                      <div className="text-xs text-mint-700 font-semibold">+{reward.points} XP</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-mint-100 text-mint-800 border-mint-200 hover:bg-mint-200"
                      >
                        {reward.time}
                      </Badge>
                      <div className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Mint Green Glow Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-mint-300/30 rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute bottom-4 right-1/4 w-24 h-24 bg-mint-400/25 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-1/2 left-4 w-16 h-16 bg-mint-500/20 rounded-full blur-xl animate-bounce-light"></div>
      </div>
    </div>
  );
}
