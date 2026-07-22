
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'lesson_reminder' | 'payment_due' | 'homework_assigned' | 'system' | 'achievement';
  is_read: boolean;
  action_url?: string;
  scheduled_for?: string;
  created_at: string;
}

class NotificationService {
  async createNotification(notification: Omit<NotificationData, 'id' | 'created_at' | 'is_read'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          is_read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<NotificationData[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Real-time subscription for notifications
  subscribeToNotifications(userId: string, onNotification: (notification: NotificationData) => void): () => void {
    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNotification(payload.new as NotificationData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Convenience methods for common notification types
  async sendLessonReminder(userId: string, lessonTitle: string, scheduledAt: string): Promise<void> {
    return this.createNotification({
      user_id: userId,
      title: 'Lesson Reminder',
      content: `Your lesson "${lessonTitle}" is starting soon`,
      type: 'lesson_reminder',
      scheduled_for: scheduledAt
    });
  }

  async sendHomeworkAssigned(studentId: string, homeworkTitle: string, teacherName: string): Promise<void> {
    return this.createNotification({
      user_id: studentId,
      title: 'New Homework Assigned',
      content: `${teacherName} has assigned you homework: "${homeworkTitle}"`,
      type: 'homework_assigned'
    });
  }

  async sendAchievementUnlocked(userId: string, achievementName: string): Promise<void> {
    return this.createNotification({
      user_id: userId,
      title: 'Achievement Unlocked!',
      content: `Congratulations! You've unlocked: ${achievementName}`,
      type: 'achievement'
    });
  }
}

export const notificationService = new NotificationService();
