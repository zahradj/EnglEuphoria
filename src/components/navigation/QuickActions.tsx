import React, { memo } from 'react';
import { Plus, Calendar, MessageSquare, BookOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

export const QuickActions: React.FC = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getQuickActions = (): QuickAction[] => {
    if (!user) return [];

    const baseActions: QuickAction[] = [
      {
        icon: Settings,
        label: 'Site Map',
        action: () => navigate('/sitemap'),
        variant: 'outline'
      }
    ];

    switch (user.role) {
      case 'student':
        return [
          {
            icon: Plus,
            label: 'Book Lesson',
            action: () => navigate('/find-teacher'),
            variant: 'default'
          },
          {
            icon: Calendar,
            label: 'My Schedule',
            action: () => navigate('/student/schedule'),
            variant: 'outline'
          },
          {
            icon: BookOpen,
            label: 'Speaking Practice',
            action: () => navigate('/student/speaking-practice'),
            variant: 'outline'
          },
          ...baseActions
        ];

      case 'teacher':
        return [
          {
            icon: MessageSquare,
            label: 'Messages',
            action: () => navigate('/teacher'),
            variant: 'outline'
          },
          ...baseActions
        ];

      case 'admin':
        return [
          {
            icon: Plus,
            label: 'Add User',
            action: () => navigate('/super-admin'),
            variant: 'default'
          },
          {
            icon: Calendar,
            label: 'All Schedules',
            action: () => navigate('/super-admin'),
            variant: 'outline'
          },
          ...baseActions
        ];

      default:
        return baseActions;
    }
  };

  const actions = getQuickActions();

  return null;
});

QuickActions.displayName = 'QuickActions';