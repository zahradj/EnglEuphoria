import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ParentNotificationSettingsProps {
  parentId: string;
}

export function ParentNotificationSettings({ parentId }: ParentNotificationSettingsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["parent-notification-preferences", parentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_notification_preferences")
        .select("*")
        .eq("parent_id", parentId)
        .single();

      if (error) {
        const { data: newPrefs, error: insertError } = await supabase
          .from("parent_notification_preferences")
          .insert({ parent_id: parentId })
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs;
      }

      return data;
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<typeof preferences>) => {
      const { error } = await supabase
        .from("parent_notification_preferences")
        .update(updates)
        .eq("parent_id", parentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-notification-preferences"] });
      toast({
        title: t('pd.notif.toast.saved.title'),
        description: t('pd.notif.toast.saved.body'),
      });
    },
    onError: () => {
      toast({
        title: t('pd.notif.toast.error.title'),
        description: t('pd.notif.toast.error.body'),
        variant: "destructive",
      });
    },
  });

  const togglePreference = (key: string, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  const notificationOptions = [
    { key: "lesson_reminders", label: t('pd.notif.lessonReminders'), description: t('pd.notif.lessonReminders.desc') },
    { key: "progress_reports", label: t('pd.notif.progressReports'), description: t('pd.notif.progressReports.desc') },
    { key: "homework_notifications", label: t('pd.notif.homework'), description: t('pd.notif.homework.desc') },
    { key: "attendance_alerts", label: t('pd.notif.attendance'), description: t('pd.notif.attendance.desc') },
    { key: "payment_reminders", label: t('pd.notif.payment'), description: t('pd.notif.payment.desc') },
    { key: "teacher_messages", label: t('pd.notif.teacherMessages'), description: t('pd.notif.teacherMessages.desc') },
    { key: "weekly_summary", label: t('pd.notif.weeklySummary'), description: t('pd.notif.weeklySummary.desc') },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{t('pd.notif.title')}</h3>
      <div className="space-y-6">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={option.key} className="text-base">
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            <Switch
              id={option.key}
              checked={preferences?.[option.key as keyof typeof preferences] || false}
              onCheckedChange={(checked) => togglePreference(option.key, checked)}
              disabled={updatePreferencesMutation.isPending}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
