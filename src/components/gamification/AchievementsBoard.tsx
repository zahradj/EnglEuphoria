
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementBadge, AchievementBadgeProps } from "./AchievementBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book, Star, Target, Trophy, Video, Clock, Calendar } from "lucide-react";

// Define categories for achievements
type AchievementCategory = "all" | "learning" | "social" | "streak" | "mastery";

interface AchievementsBoardProps {
  achievements: AchievementBadgeProps[];
  className?: string;
}

export function AchievementsBoard({
  achievements,
  className = "",
}: AchievementsBoardProps) {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>("all");
  const { languageText } = useLanguage();

  // Filter achievements by category
  const filteredAchievements = activeCategory === "all" 
    ? achievements 
    : achievements.filter(achievement => achievement.id.startsWith(activeCategory));

  // Calculate overall stats
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.reduce((sum, a) => a.unlocked ? sum + a.pointsAwarded : sum, 0);

  // Get category icon
  const getCategoryIcon = (category: AchievementCategory) => {
    switch(category) {
      case "learning": return <Book className="h-4 w-4" />;
      case "social": return <Video className="h-4 w-4" />;
      case "streak": return <Calendar className="h-4 w-4" />;
      case "mastery": return <Star className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{languageText.achievements}</CardTitle>
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            <Trophy className="h-4 w-4" />
            <span>
              {unlockedAchievements}/{totalAchievements} • {totalPoints} {languageText.points}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="all" 
          value={activeCategory} 
          onValueChange={(value) => setActiveCategory(value as AchievementCategory)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">{languageText.all}</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">{languageText.learning}</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">{languageText.social}</span>
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{languageText.streak}</span>
            </TabsTrigger>
            <TabsTrigger value="mastery" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">{languageText.mastery}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {filteredAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  {...achievement}
                />
              ))}
              
              {filteredAchievements.length === 0 && (
                <div className="col-span-2 py-8 text-center text-muted-foreground">
                  <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>{languageText.noAchievementsFound}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
