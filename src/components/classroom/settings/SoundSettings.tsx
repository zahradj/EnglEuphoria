import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  VolumeX,
  TestTube,
  Star,
  Trophy,
  Bell,
  MousePointerClick,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { audioService } from "@/services/audioService";
import { RewardToast } from "@/components/classroom/modern/RewardToast";

/**
 * Sound Settings test panel — toggle global mute and play every reward
 * stinger (star, badge, toast, click, success, error) on demand to verify
 * the audio pipeline end-to-end.
 */
export function SoundSettings() {
  const [isMuted, setIsMuted] = useState<boolean>(() => audioService.isSoundMuted());
  const [toastDemo, setToastDemo] = useState<{
    show: boolean;
    type: "xp" | "badge" | "star";
    xp: number;
    message: string;
  }>({ show: false, type: "xp", xp: 10, message: "" });

  // Keep local state in sync if mute changes elsewhere.
  useEffect(() => {
    setIsMuted(audioService.isSoundMuted());
  }, []);

  const handleMuteToggle = (enabled: boolean) => {
    const muted = !enabled;
    setIsMuted(muted);
    audioService.setMuted(muted);
    // Audible confirmation when re-enabling.
    if (!muted) audioService.playButtonClick();
  };

  const fireToast = (type: "xp" | "badge" | "star") => {
    const presets = {
      xp: { xp: 25, message: "Nice combo!" },
      badge: { xp: 50, message: "Badge unlocked!" },
      star: { xp: 5, message: "Star earned!" },
    } as const;
    setToastDemo({ show: false, type, ...presets[type] });
    // Re-mount on next tick so repeated clicks always replay sound + animation.
    requestAnimationFrame(() =>
      setToastDemo({ show: true, type, ...presets[type] })
    );
  };

  const tests: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }> = [
    {
      key: "click",
      label: "Button Click",
      icon: <MousePointerClick size={14} />,
      onClick: () => audioService.playButtonClick(),
    },
    {
      key: "star",
      label: "Star",
      icon: <Star size={14} className="fill-current" />,
      onClick: () => audioService.playStarSound(),
    },
    {
      key: "badge",
      label: "Badge",
      icon: <Trophy size={14} />,
      onClick: () => audioService.playStickerSound(),
    },
    {
      key: "reward",
      label: "Reward (+25)",
      icon: <Bell size={14} />,
      onClick: () => audioService.playRewardSound(25),
    },
    {
      key: "celebration",
      label: "Celebration",
      icon: <Bell size={14} />,
      onClick: () => audioService.playCelebrationSound(),
    },
    {
      key: "success",
      label: "Success",
      icon: <CheckCircle2 size={14} />,
      onClick: () => audioService.playSuccessSound(),
    },
    {
      key: "error",
      label: "Error",
      icon: <XCircle size={14} />,
      onClick: () => audioService.playErrorSound(),
    },
    {
      key: "dice",
      label: "Dice Roll",
      icon: <Bell size={14} />,
      onClick: () => audioService.playDiceSound(),
    },
    {
      key: "timer_warn",
      label: "Timer Warn",
      icon: <Bell size={14} />,
      onClick: () => audioService.playTimerWarningSound(),
    },
    {
      key: "timer_done",
      label: "Timer Done",
      icon: <Bell size={14} />,
      onClick: () => audioService.playTimerDoneSound(),
    },
  ];

  return (
    <>
      <Card className="p-4 w-[320px] max-w-[92vw] backdrop-blur bg-background/80 border-border/60 shadow-lg">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          Sound Settings
        </h3>

        <div className="space-y-4">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-mute">Enable Sounds</Label>
            <Switch
              id="sound-mute"
              checked={!isMuted}
              onCheckedChange={handleMuteToggle}
            />
          </div>

          {/* Direct SFX tests */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TestTube size={14} />
              Test Sounds
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {tests.map((t) => (
                <Button
                  key={t.key}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={t.onClick}
                  disabled={isMuted}
                >
                  {t.icon}
                  <span className="truncate">{t.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Reward Toast tests (sound + visual) */}
          <div className="space-y-2">
            <Label>Reward Toast</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fireToast("star")}
              >
                Star
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fireToast("badge")}
              >
                Badge
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fireToast("xp")}
              >
                XP
              </Button>
            </div>
            {isMuted && (
              <p className="text-xs text-muted-foreground">
                Toast still appears, but sound is muted.
              </p>
            )}
          </div>
        </div>
      </Card>

      <RewardToast
        show={toastDemo.show}
        xp={toastDemo.xp}
        type={toastDemo.type}
        message={toastDemo.message}
        onComplete={() => setToastDemo((p) => ({ ...p, show: false }))}
      />
    </>
  );
}
