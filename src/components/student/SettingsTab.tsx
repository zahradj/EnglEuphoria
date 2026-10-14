import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStudentLevel } from "@/hooks/useStudentLevel";
import { cn } from "@/lib/utils";
import { FamilyAccountCard } from "./FamilyAccountCard";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Account settings. Name, email and learning language are edited in My Profile (ProfileTab);
 * this tab changes the password. Lesson times follow the device's time zone, which is shown
 * here read-only so it is clear what the student will see.
 */
export const SettingsTab = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { studentLevel } = useStudentLevel();
  const isSuccess = studentLevel === "professional";

  const primaryBtn = isSuccess
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "";
  const iconAccent = isSuccess ? "text-emerald-600" : "text-blue-500";
  const iconAccent2 = isSuccess ? "text-emerald-600" : "text-green-500";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const deviceTimeZone = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; }
  })();

  const fail = (description: string) =>
    toast({ title: t('st.set.pwFail', 'Could not update your password'), description, variant: "destructive" });

  const handleUpdatePassword = async () => {
    if (saving) return;
    if (!currentPassword) return fail(t('st.set.pwWrong', 'Your current password is not correct.'));
    if (newPassword.length < MIN_PASSWORD_LENGTH) return fail(t('st.set.pwShort', 'Use at least 8 characters for your new password.'));
    if (newPassword !== confirmPassword) return fail(t('st.set.pwMismatch', "The new passwords don't match."));
    if (!user?.email) return fail(t('st.fam.again', 'Please try again.'));

    setSaving(true);
    try {
      // Prove it is really them before changing anything: re-check the current password.
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
      if (verifyError) return fail(t('st.set.pwWrong', 'Your current password is not correct.'));

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return fail(error.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: t('st.set.pwUpdated', 'Password updated'),
        description: t('st.set.pwUpdatedDesc', 'Your password was changed.'),
      });
    } catch (err) {
      fail(err instanceof Error ? err.message : t('st.fam.again', 'Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const openProfile = () =>
    window.dispatchEvent(new CustomEvent('student-dashboard:open-tab', { detail: { tab: 'profile' } }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('st.set.title', 'Settings')}</h1>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className={cn("h-5 w-5", iconAccent)} />
            {t('st.set.profile', 'Profile Settings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('st.set.profileHint', 'Your name, email and learning language are in My Profile.')}
          </p>
          <Button variant="outline" onClick={openProfile}>{t('st.set.openProfile', 'Open My Profile')}</Button>
          <p className="text-sm text-muted-foreground">
            {t('st.set.tzInfo', { tz: deviceTimeZone, defaultValue: "Lesson times are shown in your device's time zone: {{tz}}." })}
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className={cn("h-5 w-5", iconAccent2)} />
            {t('st.set.security', 'Security')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); void handleUpdatePassword(); }}
          >
            <div>
              <Label htmlFor="current-password">{t('st.set.curPw', 'Current Password')}</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">{t('st.set.newPw', 'New Password')}</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">{t('st.set.confPw', 'Confirm New Password')}</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className={primaryBtn} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('st.set.updPw', 'Update Password')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <FamilyAccountCard />
    </div>
  );
};
