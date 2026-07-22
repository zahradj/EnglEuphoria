
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RewardNotificationProps {
  points: number;
  reason: string;
  isVisible: boolean;
  onClose: () => void;
}

export function RewardNotification({ points, reason, isVisible, onClose }: RewardNotificationProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      const timer = setTimeout(() => {
        setShouldShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 4000); // Show for 4 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !shouldShow) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      shouldShow ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg min-w-72">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Star size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Reward Earned!</span>
                <Badge className="bg-white/20 text-white border-white/30">
                  +{points} XP
                </Badge>
              </div>
              <p className="text-sm text-green-100 mt-1">{reason}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShouldShow(false)}
            className="text-white hover:bg-white/20 h-6 w-6 p-0"
          >
            <X size={12} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
