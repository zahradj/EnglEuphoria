
import { useState, useCallback } from "react";

interface RewardNotification {
  id: string;
  points: number;
  reason: string;
  timestamp: Date;
}

interface CelebrationData {
  id: string;
  points: number;
  reason: string;
  isVisible: boolean;
}

export function useRewardNotifications() {
  const [notifications, setNotifications] = useState<RewardNotification[]>([]);
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [floatingNotification, setFloatingNotification] = useState<CelebrationData | null>(null);

  const showRewardNotification = useCallback((points: number, reason: string) => {
    const id = Date.now().toString();
    const notification: RewardNotification = {
      id,
      points,
      reason,
      timestamp: new Date()
    };

    // Add to notifications list
    setNotifications(prev => [...prev, notification]);

    // Show center-screen celebration for major rewards
    if (points >= 30) {
      setCelebration({
        id,
        points,
        reason,
        isVisible: true
      });
    }

    // Show floating notification for all rewards
    setFloatingNotification({
      id,
      points,
      reason,
      isVisible: true
    });

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const hideCelebration = useCallback(() => {
    setCelebration(prev => prev ? { ...prev, isVisible: false } : null);
    setTimeout(() => setCelebration(null), 300);
  }, []);

  const hideFloatingNotification = useCallback(() => {
    setFloatingNotification(prev => prev ? { ...prev, isVisible: false } : null);
    setTimeout(() => setFloatingNotification(null), 300);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    celebration,
    floatingNotification,
    showRewardNotification,
    hideCelebration,
    hideFloatingNotification,
    removeNotification
  };
}
