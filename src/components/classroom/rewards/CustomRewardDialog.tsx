
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SoundButton } from "@/components/ui/sound-button";
import { Plus } from "lucide-react";

interface CustomRewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (points: number, reason: string) => void;
  onOpen: () => void;
}

export function CustomRewardDialog({ isOpen, onClose, onReward, onOpen }: CustomRewardDialogProps) {
  const [points, setPoints] = useState<string>("10");
  const [reason, setReason] = useState<string>("");

  const handleSubmit = () => {
    const pointsNum = parseInt(points);
    if (pointsNum > 0 && reason.trim()) {
      onReward(pointsNum, reason.trim());
      setPoints("10");
      setReason("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={onOpen}
          className="w-full text-xs"
        >
          <Plus size={12} className="mr-1" />
          Custom Reward
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Award Custom Points</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="points">Points to Award</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              max="100"
              placeholder="Enter points..."
            />
          </div>
          
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you awarding these points?"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <SoundButton 
              onClick={handleSubmit}
              disabled={!points || !reason.trim() || parseInt(points) <= 0}
              soundType="success"
            >
              Award Points
            </SoundButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
