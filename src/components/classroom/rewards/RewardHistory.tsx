
import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RewardData {
  id: string;
  points: number;
  reason: string;
  timestamp: Date;
  category: string;
}

interface RewardHistoryProps {
  rewards: RewardData[];
}

export function RewardHistory({ rewards }: RewardHistoryProps) {
  if (rewards.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-4">
        No rewards given yet this session
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">Recent Rewards</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="secondary" className="text-xs">
                +{reward.points} XP
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(reward.timestamp, { addSuffix: true })}
              </span>
            </div>
            <p className="text-xs text-gray-700">{reward.reason}</p>
            <p className="text-xs text-gray-500 mt-1">{reward.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
