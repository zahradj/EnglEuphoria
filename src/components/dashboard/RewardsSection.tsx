
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RewardItem } from "@/components/RewardItem";
import { useLanguage } from "@/contexts/LanguageContext";

export function RewardsSection() {
  const { languageText } = useLanguage();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{languageText.yourRewards}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <RewardItem
          title="First Class"
          description="Attended your first class"
          points={10}
          unlocked={true}
        />
        
        <RewardItem
          title="Vocabulary Master"
          description="Learned 20 new words"
          points={25}
          unlocked={true}
        />
        
        <RewardItem
          title="Storyteller"
          description="Completed 5 speaking activities"
          points={50}
          unlocked={false}
        />
      </CardContent>
    </Card>
  );
}
