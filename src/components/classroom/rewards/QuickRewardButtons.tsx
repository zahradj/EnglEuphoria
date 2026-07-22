
import React from "react";
import { SoundButton } from "@/components/ui/sound-button";
import { Star, Sparkles, Award, Trophy } from "lucide-react";

interface QuickRewardButtonsProps {
  onReward: (points: number, category: string) => void;
}

const rewardButtons = [
  { points: 5, label: "+5", icon: Star, color: "bg-green-500 hover:bg-green-600", category: "Good Work" },
  { points: 10, label: "+10", icon: Sparkles, color: "bg-blue-500 hover:bg-blue-600", category: "Great Job" },
  { points: 25, label: "+25", icon: Award, color: "bg-purple-500 hover:bg-purple-600", category: "Excellent" },
  { points: 50, label: "+50", icon: Trophy, color: "bg-orange-500 hover:bg-orange-600", category: "Outstanding" }
];

export function QuickRewardButtons({ onReward }: QuickRewardButtonsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Quick Rewards</h3>
      <div className="grid grid-cols-2 gap-2">
        {rewardButtons.map((reward) => {
          const IconComponent = reward.icon;
          return (
            <SoundButton
              key={reward.points}
              onClick={() => onReward(reward.points, reward.category)}
              className={`${reward.color} text-white text-xs py-2 px-3 flex items-center justify-center gap-1 hover:scale-105 transition-transform`}
              soundType="reward"
              rewardPoints={reward.points}
            >
              <IconComponent size={14} />
              {reward.label}
            </SoundButton>
          );
        })}
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600">Category Rewards</h4>
        <div className="grid grid-cols-1 gap-1">
          <SoundButton
            variant="outline"
            size="sm"
            onClick={() => onReward(15, "Speaking Practice")}
            className="text-xs py-1 px-2 hover:scale-105 transition-transform"
            soundType="reward"
            rewardPoints={15}
          >
            🗣️ Speaking +15
          </SoundButton>
          <SoundButton
            variant="outline"
            size="sm"
            onClick={() => onReward(10, "Participation")}
            className="text-xs py-1 px-2 hover:scale-105 transition-transform"
            soundType="reward"
            rewardPoints={10}
          >
            ✋ Participation +10
          </SoundButton>
          <SoundButton
            variant="outline"
            size="sm"
            onClick={() => onReward(20, "Perfect Answer")}
            className="text-xs py-1 px-2 hover:scale-105 transition-transform"
            soundType="reward"
            rewardPoints={20}
          >
            💯 Perfect Answer +20
          </SoundButton>
        </div>
      </div>
    </div>
  );
}
