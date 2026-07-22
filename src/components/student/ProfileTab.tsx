import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Camera, Clock, Globe, Loader2, Check, X, Plus, Mail } from "lucide-react";
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { toast } from 'sonner';

interface ProfileTabProps {
  studentName: string;
}

type LanguageCode = 'en' | 'es' | 'ar' | 'fr' | 'tr' | 'it';

const LANGUAGES: { code: LanguageCode; flag: string; nativeName: string }[] = [
  { code: 'en', flag: '🇬🇧', nativeName: 'English' },
  { code: 'es', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'ar', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'tr', flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'it', flag: '🇮🇹', nativeName: 'Italiano' },
];

const CEFR_FULL: Record<string, string> = {
  'PRE-A1': 'Pre-A1 (Pre-Beginner)',
  'A1': 'A1 (Beginner)',
  'A2': 'A2 (Elementary)',
  'B1': 'B1 (Intermediate)',
  'B2': 'B2 (Upper Intermediate)',
  'C1': 'C1 (Advanced)',
  'C2': 'C2 (Proficient)',
};
const cefrFullLabel = (c: string) => CEFR_FULL[c.toUpperCase()] || c.toUpperCase();

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'career', label: 'Work / Career' },
  { value: 'school', label: 'School / Exams' },
  { value: 'travel', label: 'Travel' },
  { value: 'fun', label: 'Fun / Social' },
  { value: 'family', label: 'Family / Relationships' },
  { value: 'moving', label: 'Moving abroad' },
  { value: 'other', label: 'Other' },
];

const HUB_PROFILE_COLORS: Record<string, {
  iconColor: string;
  avatarBorder: string;
  avatarGradient: string;
  badgeBg: string;
  badgeText: string;
  buttonGradient: string;
}> = {
  playground: {
    iconColor: 'text-orange-500',
    avatarBorder: 'border-orange-300',
    avatarGradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    buttonGradient: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600',
  },
  academy: {
    iconColor: 'text-indigo-500',
    avatarBorder: 'border-indigo-300',
    avatarGradient: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    buttonGradient: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600',
  },
  professional: {
    iconColor: 'text-emerald-500',
    avatarBorder: 'border-emerald-300',
    avatarGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    buttonGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600',
  },
};

// Resize an image File to a square data URL (max 256px) to keep DB payload small.
async function fileToResizedDataUrl(file: File, max = 256): Promise<string> {
  const buf = await file.arrayBuffer();
  const blob = new Blob([buf], { type: file.type });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const size = Math.min(max, Math.max(img.width, img.height));
    const scale = size / Math.max(img.width, img.height);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unsupported');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const ProfileTab = ({ studentName }: ProfileTabProps) => {
  const { studentLevel } = useStudentLevel();
  const { user } = useAuth();
  const { t } = useTranslation();
  const hubId = studentLevel || 'playground';
  const colors = HUB_PROFILE_COLORS[hubId] || HUB_PROFILE_COLORS.playground;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);

  const [fullName, setFullName] = useState(studentName);
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [language, setLanguage] = useState<LanguageCode>(
    (i18n.language?.substring(0, 2) as LanguageCode) || 'en'
  );
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [cefr, setCefr] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [learningReason, setLearningReason] = useState<string>('');
  const [longTermGoal, setLongTermGoal] = useState<string>('');
  const [weeklyGoal, setWeeklyGoal] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const [userRes, profileRes, placementRes] = await Promise.all([
        supabase
          .from('users')
          .select('full_name, email, preferred_language, created_at, cefr_level')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('student_profiles')
          .select('final_cefr_level, cefr_level, interests, learning_reason, long_term_goal, weekly_goal, profile_image_url')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('placement_results')
          .select('cefr_level, created_at')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;

      const data = (userRes as any)?.data;
      const profile = (profileRes as any)?.data;
      const placement = (placementRes as any)?.data;

      if (data) {
        setFullName(data.full_name || studentName);
        setEmail(data.email || user.email || '');
        setNewEmail(data.email || user.email || '');
        if (data.preferred_language) setLanguage(data.preferred_language as LanguageCode);
        if (data.created_at) {
          const d = new Date(data.created_at);
          setMemberSince(d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
        }
      } else if (user.email) {
        setEmail(user.email);
        setNewEmail(user.email);
      }
      const resolvedCefr = (placement?.cefr_level || profile?.final_cefr_level || profile?.cefr_level || data?.cefr_level || '').toString().toUpperCase();
      setCefr(resolvedCefr);
      setInterests(Array.isArray(profile?.interests) ? profile.interests : []);
      setLearningReason(profile?.learning_reason || '');
      setLongTermGoal(profile?.long_term_goal || '');
      setWeeklyGoal(profile?.weekly_goal || '');
      setAvatarUrl(profile?.profile_image_url || '');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id, studentName]);

  const handleLanguagePreview = (next: LanguageCode) => {
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user?.id) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file, 256);
      const { error } = await supabase
        .from('student_profiles')
        .upsert(
          { user_id: user.id, profile_image_url: dataUrl, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
      setAvatarUrl(dataUrl);
      toast.success('Profile picture updated');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      toast.error('Could not update picture', { description: err?.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEmailChange = async () => {
    const next = newEmail.trim().toLowerCase();
    if (!next || next === email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      toast.error('Please enter a valid email');
      return;
    }
    setUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: next });
      if (error) throw error;
      toast.success('Confirmation email sent', {
        description: `Open the link sent to ${next} to confirm the change.`,
      });
    } catch (err: any) {
      console.error('Email change failed:', err);
      toast.error('Could not change email', { description: err?.message });
    } finally {
      setUpdatingEmail(false);
    }
  };

  const addInterest = () => {
    const v = newInterest.trim();
    if (!v) return;
    if (interests.includes(v)) {
      setNewInterest('');
      return;
    }
    setInterests([...interests, v]);
    setNewInterest('');
  };

  const removeInterest = (v: string) => {
    setInterests(interests.filter(i => i !== v));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    setSaving(true);
    try {
      const { error: userErr } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          preferred_language: language,
        })
        .eq('id', user.id);
      if (userErr) throw userErr;

      const { error: profErr } = await supabase
        .from('student_profiles')
        .upsert(
          {
            user_id: user.id,
            interests,
            learning_reason: learningReason || null,
            long_term_goal: longTermGoal || null,
            weekly_goal: weeklyGoal || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (profErr) throw profErr;

      toast.success(t('sd.profile.saved', 'Profile updated'));
    } catch (e: any) {
      console.error('Error saving profile:', e);
      toast.error(t('sd.profile.saveError', 'Could not save profile'), {
        description: e?.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const initial = (fullName || studentName || '?').charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className={cn('h-5 w-5', colors.iconColor)} />
            {t('sd.profile.title', 'Your Profile')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative shrink-0">
                <Avatar className={cn('h-24 w-24 border-4', colors.avatarBorder)}>
                  {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
                  <AvatarFallback className={cn(colors.avatarGradient, 'text-white text-2xl font-bold')}>
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  aria-label="Change profile picture"
                >
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex-1 w-full space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('sd.profile.fullName', 'Full Name')}</Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('sd.profile.fullNamePlaceholder', 'Your full name')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className={cn('h-3.5 w-3.5', colors.iconColor)} />
                      {t('sd.profile.email', 'Email')}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEmailChange}
                        disabled={updatingEmail || !newEmail || newEmail.trim().toLowerCase() === email}
                      >
                        {updatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      We'll email a confirmation link to verify the change.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="language" className="flex items-center gap-1.5">
                    <Globe className={cn('h-3.5 w-3.5', colors.iconColor)} />
                    {t('sd.profile.dashboardLanguage', 'Dashboard language')}
                  </Label>
                  <Select value={language} onValueChange={(v) => handleLanguagePreview(v as LanguageCode)}>
                    <SelectTrigger id="language" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span aria-hidden>{lang.flag}</span>
                            <span>{lang.nativeName}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {t('sd.profile.dashboardLanguageHelp', 'Translates the dashboard interface only. Lessons stay in English.')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('sd.profile.englishLevel', 'English Level')}</Label>
                    <div className="mt-2">
                      <Badge variant="outline" className={cn(colors.badgeBg, colors.badgeText)}>
                        {cefr ? cefrFullLabel(cefr) : t('sd.profile.notPlaced', 'Not placed yet')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reason">{t('sd.profile.learningReason', 'Why are you learning English?')}</Label>
                    <Select value={learningReason} onValueChange={setLearningReason}>
                      <SelectTrigger id="reason" className="mt-1">
                        <SelectValue placeholder="Choose a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {REASON_OPTIONS.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="longGoal">Long-term goal</Label>
                  <Textarea
                    id="longGoal"
                    value={longTermGoal}
                    onChange={(e) => setLongTermGoal(e.target.value)}
                    placeholder="e.g. Speak confidently in business meetings within 6 months"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="weeklyGoal">This week's focus</Label>
                  <Input
                    id="weeklyGoal"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    placeholder="e.g. Learn 20 new travel words"
                  />
                </div>

                <div>
                  <Label>{t('sd.profile.interests', 'Your interests')}</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {interests.map((it) => (
                      <Badge
                        key={it}
                        variant="outline"
                        className={cn('flex items-center gap-1.5 pr-1', colors.badgeBg, colors.badgeText)}
                      >
                        {it}
                        <button
                          type="button"
                          onClick={() => removeInterest(it)}
                          className="ml-1 rounded hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
                          aria-label={`Remove ${it}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {interests.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        {t('sd.profile.noInterests', 'No interests on file yet.')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                      placeholder="Add an interest (e.g. football, movies, coding)"
                    />
                    <Button type="button" variant="outline" onClick={addInterest}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {memberSince && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{t('sd.profile.memberSince', 'Member since')} {memberSince}</span>
                  </div>
                )}

                <Button onClick={handleSave} disabled={saving} className={colors.buttonGradient}>
                  {saving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('sd.profile.saving', 'Saving...')}</>
                  ) : (
                    <><Check className="h-4 w-4 mr-2" /> {t('sd.profile.save', 'Save Changes')}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
