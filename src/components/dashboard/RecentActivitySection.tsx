
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Video } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function RecentActivitySection() {
  const { languageText } = useLanguage();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{languageText.recentActivity}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="bg-purple/20 p-1 rounded">
            <Video className="text-purple h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{languageText.attendedClass}</p>
            <p className="text-xs text-muted-foreground">Fun with Phonics</p>
          </div>
          <div className="text-xs text-muted-foreground">2h ago</div>
        </div>
        
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="bg-teal/20 p-1 rounded">
            <BookOpen className="text-teal h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{languageText.completedActivity}</p>
            <p className="text-xs text-muted-foreground">Animal Vocabulary</p>
          </div>
          <div className="text-xs text-muted-foreground">1d ago</div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-yellow/20 p-1 rounded">
            <ArrowRight className="text-yellow-dark h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{languageText.earnedBadge}</p>
            <p className="text-xs text-muted-foreground">Vocabulary Master</p>
          </div>
          <div className="text-xs text-muted-foreground">2d ago</div>
        </div>
      </CardContent>
    </Card>
  );
}
