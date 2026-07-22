
import { Card } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";

interface RewardItemProps {
  title: string;
  description: string;
  points: number;
  unlocked: boolean;
}

export function RewardItem({ title, description, points, unlocked }: RewardItemProps) {
  return (
    <Card className={`p-4 transition-all ${
      unlocked ? "bg-gradient-to-br from-primary-50 to-primary-100/50" : "bg-muted/50"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          unlocked ? "bg-primary-100 text-primary-700" : "bg-muted text-muted-foreground"
        }`}>
          <Trophy size={24} className={unlocked ? "fill-primary-700" : ""} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          
          <div className="flex items-center gap-1 mt-2">
            <Star size={16} className={`${
              unlocked ? "fill-primary text-primary-700" : "text-muted-foreground"
            }`} />
            <span className={`text-sm ${
              unlocked ? "text-primary-700 font-bold" : "text-muted-foreground"
            }`}>
              {points} points
            </span>
          </div>
        </div>
        
        <div className={`text-xs uppercase font-bold px-2 py-1 rounded ${
          unlocked 
            ? "bg-primary-100/30 text-primary-700"
            : "bg-muted text-muted-foreground"
        }`}>
          {unlocked ? "Unlocked" : "Locked"}
        </div>
      </div>
    </Card>
  );
}
