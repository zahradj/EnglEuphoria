import { useEffect, useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BroadcastNotification {
  id: string;
  title: string;
  content: string;
  action_url?: string | null;
}

interface AdminBroadcastBannerProps {
  teacherId: string;
  profileImageUrl?: string | null;
}

/**
 * Purple banner that surfaces the most recent unread admin broadcast
 * (type = 'broadcast' in `notifications`) to teachers, styled like the
 * Novakid announcement pattern. Dismissing marks the notification as read.
 */
export const AdminBroadcastBanner = ({
  teacherId,
  profileImageUrl,
}: AdminBroadcastBannerProps) => {
  const [notif, setNotif] = useState<BroadcastNotification | null>(null);

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id, title, content, action_url')
        .eq('user_id', teacherId)
        .eq('type', 'broadcast')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) setNotif(data as BroadcastNotification);
    };

    load();

    const channel = supabase
      .channel(`admin-broadcast-${teacherId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${teacherId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row?.type === 'broadcast' && !row.is_read) {
            setNotif({
              id: row.id,
              title: row.title,
              content: row.content,
              action_url: row.action_url,
            });
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [teacherId]);

  const dismiss = async () => {
    if (!notif) return;
    const id = notif.id;
    setNotif(null);
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  if (!notif) return null;

  return (
    <div className="w-full bg-[hsl(258_60%_28%)] text-white">
      <div className="container mx-auto flex items-start gap-4 px-4 py-4 md:items-center">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt=""
            className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-white/80 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
            <Megaphone className="h-6 w-6" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {notif.title && (
            <p className="text-sm font-semibold leading-snug md:text-base">
              {notif.title}
            </p>
          )}
          <p className="text-sm leading-snug text-white/90 md:text-[15px]">
            {notif.content}
          </p>
          {notif.action_url && (
            <a
              href={notif.action_url}
              className="mt-3 inline-flex items-center rounded-full bg-yellow-300 px-4 py-1.5 text-sm font-semibold text-[hsl(258_60%_28%)] shadow-sm transition hover:bg-yellow-200"
            >
              Learn more
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="flex-shrink-0 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
