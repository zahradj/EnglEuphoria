import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserSilhouette } from './icons/UserSilhouette';

const SIZE_CLASSES: Record<string, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-24 w-24',
};

interface ProfileAvatarProps {
  size?: keyof typeof SIZE_CLASSES;
  clickable?: boolean;
  className?: string;
}

/**
 * Academy ProfileAvatar — flat-vector silhouette fallback, real avatar when present.
 * No mascot, no childish ring. Click navigates to the academy profile.
 */
export default function ProfileAvatar({
  size = 'md',
  clickable = true,
  className = '',
}: ProfileAvatarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setAvatarUrl(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('student_profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) setAvatarUrl((data as any)?.avatar_url ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  const inner = (
    <Avatar className={`${sizeClass} ring-1 ring-border ${className}`}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="Your profile" /> : null}
      <AvatarFallback className="bg-muted text-muted-foreground">
        <UserSilhouette className="h-3/5 w-3/5" />
      </AvatarFallback>
    </Avatar>
  );

  if (!clickable) return inner;
  return (
    <button
      type="button"
      onClick={() => navigate('/dashboard/academy/profile')}
      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Open profile"
    >
      {inner}
    </button>
  );
}
