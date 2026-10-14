import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield } from "lucide-react";
import { useStudentLevel } from "@/hooks/useStudentLevel";
import { cn } from "@/lib/utils";
import { FamilyAccountCard } from "./FamilyAccountCard";

export const SettingsTab = () => {
  const { t } = useTranslation();
  const { studentLevel } = useStudentLevel();
  const isSuccess = studentLevel === "professional";

  const primaryBtn = isSuccess
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "";
  const iconAccent = isSuccess ? "text-emerald-600" : "text-blue-500";
  const iconAccent2 = isSuccess ? "text-emerald-600" : "text-green-500";

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
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('st.set.name', 'Full Name')}</Label>
              <Input id="name" placeholder={t('st.set.namePh', 'Your name')} />
            </div>
            <div>
              <Label htmlFor="email">{t('st.set.email', 'Email')}</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="phone">{t('st.set.phone', 'Phone')}</Label>
              <Input id="phone" placeholder="+213 xxx xxx xxx" />
            </div>
            <div>
              <Label htmlFor="timezone">{t('st.set.tz', 'Timezone')}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('st.set.tzPh', 'Select timezone')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="africa/algiers">Africa/Algiers (UTC+1)</SelectItem>
                  <SelectItem value="europe/paris">Europe/Paris (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className={cn("mt-4", primaryBtn)}>{t('st.set.save', 'Save Changes')}</Button>
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">{t('st.set.curPw', 'Current Password')}</Label>
              <Input id="current-password" type="password" />
            </div>
            <div>
              <Label htmlFor="new-password">{t('st.set.newPw', 'New Password')}</Label>
              <Input id="new-password" type="password" />
            </div>
            <div>
              <Label htmlFor="confirm-password">{t('st.set.confPw', 'Confirm New Password')}</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button className={primaryBtn}>{t('st.set.updPw', 'Update Password')}</Button>
          </div>
        </CardContent>
      </Card>

      <FamilyAccountCard />
    </div>
  );
};
