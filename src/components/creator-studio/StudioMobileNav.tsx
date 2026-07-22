import React, { useState } from 'react';
import { Map, Palette, Library, LogOut, Zap, BookOpen, Sparkles, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useCreator, CreatorStep } from './CreatorContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const NAV: Array<{ key: CreatorStep; tKey: string; icon: React.ElementType; emoji: string; fallback?: string }> = [
  { key: 'blueprint', tKey: 'nav.blueprint', icon: Map, emoji: '🗺️' },
  
  { key: 'playground-creator', tKey: 'nav.playground_creator', icon: Sparkles, emoji: '🧒', fallback: 'Playground' },
  { key: 'academy-creator', tKey: 'nav.academy_creator', icon: GraduationCap, emoji: '🎓', fallback: 'Academy' },
  { key: 'success-creator', tKey: 'nav.success_creator', icon: Briefcase, emoji: '💼', fallback: 'Success' },
  { key: 'trial', tKey: 'nav.trial_creator', icon: Zap, emoji: '⚡' },
  { key: 'story', tKey: 'nav.story_creator', icon: BookOpen, emoji: '📖' },
  { key: 'library', tKey: 'nav.master_library', icon: Library, emoji: '📚' },
];

export const StudioMobileNav: React.FC = () => {
  const { currentStep, setCurrentStep } = useCreator();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
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

  return (
    <nav className="md:hidden fixed bottom-0 start-0 end-0 z-50 bg-slate-950 border-t border-slate-800 safe-area-pb">
      <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto no-scrollbar">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = currentStep === item.key;
          const label = item.fallback ? t(item.tKey, { defaultValue: item.fallback }) : t(item.tKey);
          return (
            <button
              key={item.key}
              onClick={() => { setCurrentStep(item.key); navigate(`/content-creator/${item.key}`); }}
              className={cn(
                'shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors min-w-[64px] min-h-11',
                active
                  ? 'text-amber-300'
                  : 'text-slate-400 active:text-white'
              )}
            >
              <Icon className={cn('h-5 w-5', active ? 'text-amber-300' : 'text-slate-500')} />
              <span className="truncate max-w-[64px]">{label}</span>
            </button>
          );
        })}
        <div className="shrink-0 flex flex-col items-center justify-center gap-0.5 px-2 py-2 min-w-[52px] min-h-11">
          <LanguageSwitcher variant="ghost" size="sm" align="end" compact className="h-auto p-1 text-slate-400" />
        </div>
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] font-medium text-slate-400 active:text-white min-w-[64px] min-h-11 disabled:opacity-50"
        >
          <LogOut className="h-5 w-5 text-slate-500" />
          <span>{signingOut ? '…' : t('nav.logout')}</span>
        </button>
      </div>
    </nav>
  );
};
