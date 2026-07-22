import React, { useState } from 'react';
import { Save, Rocket, Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useCreator } from './CreatorContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { persistLesson } from './persistLesson';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export const StudioHeader: React.FC = () => {
  const {
    workingTitle,
    isDirty,
    currentStep,
    activeLessonData,
    setActiveLessonData,
    setCurrentStep,
    setDirty,
  } = useCreator();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Sign out failed — redirecting anyway.');
      navigate('/login', { replace: true });
    }
  };

  const inSlideStudio =
    currentStep === 'playground-creator' ||
    currentStep === 'academy-creator' ||
    currentStep === 'success-creator';
  const hasSlides = !!activeLessonData?.slides?.length;

  const buildExtra = (): { kind: 'standard' | 'trial' | 'story'; extra?: Record<string, unknown> } => {
    if (!activeLessonData) return { kind: 'standard' };
    const kind = activeLessonData.kind ?? 'standard';
    const extra: Record<string, unknown> = {};
    if (activeLessonData.visual_style) extra.visual_style = activeLessonData.visual_style;
    if (activeLessonData.story_layout) extra.story_layout = activeLessonData.story_layout;
    if (activeLessonData.parent_lesson_id !== undefined) extra.linked_lesson_id = activeLessonData.parent_lesson_id;
    if (activeLessonData.linked_lesson_title !== undefined) extra.linked_lesson_title = activeLessonData.linked_lesson_title;
    return { kind, extra: Object.keys(extra).length ? extra : undefined };
  };

  const handleSaveDraft = async () => {
    if (!inSlideStudio || !activeLessonData) {
      toast.message('Open a lesson in the Slide Studio to save a draft.');
      return;
    }
    setSavingDraft(true);
    const { kind, extra } = buildExtra();
    const res = await persistLesson(activeLessonData, activeLessonData.slides, false, kind, extra);
    setSavingDraft(false);
    if (res.ok === false) {
      toast.error(`Could not save draft: ${res.error}`);
      return;
    }
    // Stamp the row id back into context so the next save UPDATEs instead of
    // creating a duplicate row.
    if (!activeLessonData.lesson_id) {
      setActiveLessonData({ ...activeLessonData, lesson_id: res.lesson_id });
    }
    setDirty(false);
    toast.success('Draft saved');
  };

  const handlePublish = async () => {
    if (!inSlideStudio || !activeLessonData) {
      toast.message('Open a lesson in the Slide Studio to publish.');
      return;
    }
    if (!hasSlides) {
      toast.error('Generate or add slides before publishing.');
      return;
    }
    setPublishing(true);
    const { kind, extra } = buildExtra();
    const res = await persistLesson(activeLessonData, activeLessonData.slides, true, kind, extra);
    setPublishing(false);
    if (res.ok === false) {
      toast.error(`Publish failed: ${res.error}`);
      return;
    }
    toast.success('Lesson published to the Master Library 🎉');
    setDirty(false);
    setActiveLessonData(null);
    setCurrentStep('library');
  };

  const publishLabel = inSlideStudio ? t('nav.publish_to_library') : t('nav.publish');

  return (
    <header className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {currentStep === 'blueprint' ? t('nav.blueprint')
            : inSlideStudio ? t('nav.slide_studio')
            : t('nav.master_library')}
        </div>
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate">
          {workingTitle}
          {isDirty && <span className="ms-2 text-xs font-medium text-amber-500">• {t('nav.unsaved')}</span>}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <LanguageSwitcher variant="ghost" size="sm" align="end" compact className="hidden md:inline-flex" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          disabled={savingDraft || publishing || !inSlideStudio}
          className="gap-1.5"
        >
          {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="hidden sm:inline">{savingDraft ? t('nav.saving') : t('nav.save_draft')}</span>
        </Button>
        <Button
          size="sm"
          onClick={handlePublish}
          disabled={publishing || savingDraft || (inSlideStudio && !hasSlides)}
          className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-md"
        >
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          <span className="hidden sm:inline">💾 {publishing ? t('nav.publishing') : publishLabel}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label={t('nav.logout', { defaultValue: 'Sign out' })}
          className="gap-1.5 min-w-11 min-h-11 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400"
        >
          {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          <span className="hidden lg:inline">{t('nav.logout', { defaultValue: 'Sign out' })}</span>
        </Button>
      </div>
    </header>
  );
};
