import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Map, Palette, Library, LogOut, ChevronLeft, ChevronRight, Zap, BookOpen, Sparkles, GraduationCap, Briefcase, Users, Gamepad2, Wand2, ShieldCheck, Headphones, BarChart3, Award } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { useCreator, CreatorStep } from './CreatorContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const NAV: Array<{ key: CreatorStep; tKey: string; icon: React.ElementType; emoji: string; fallback?: string }> = [
  { key: 'blueprint', tKey: 'nav.blueprint', icon: Map, emoji: '🗺️' },



  { key: 'playground-creator', tKey: 'nav.playground_creator', icon: Sparkles, emoji: '🧒', fallback: 'Playground Creator' },
  { key: 'academy-creator', tKey: 'nav.academy_creator', icon: GraduationCap, emoji: '🎓', fallback: 'Academy Creator' },
  { key: 'success-creator', tKey: 'nav.success_creator', icon: Briefcase, emoji: '💼', fallback: 'Success Creator' },
  { key: 'trial', tKey: 'nav.trial_creator', icon: Zap, emoji: '⚡' },
  { key: 'story', tKey: 'nav.story_creator', icon: BookOpen, emoji: '📖' },
  { key: 'game-maker', tKey: 'nav.game_maker', icon: Gamepad2, emoji: '🎮', fallback: 'Game Maker' },
  { key: 'characters', tKey: 'nav.cast_vault', icon: Users, emoji: '🎭', fallback: 'Cast Vault' },
  { key: 'placement-assets', tKey: 'nav.placement_assets', icon: Headphones, emoji: '🎧', fallback: 'Placement Test' },
  { key: 'lesson-tests', tKey: 'nav.lesson_tests', icon: ShieldCheck, emoji: '🧪', fallback: 'Lesson Tests' },
  { key: 'vocab-games-analytics', tKey: 'nav.vocab_games_analytics', icon: BarChart3, emoji: '📊', fallback: 'Vocab Games Analytics' },
  { key: 'certificates', tKey: 'nav.certificate_designer', icon: Award, emoji: '🏆', fallback: 'Certificate Designer' },
  { key: 'library', tKey: 'nav.master_library', icon: Library, emoji: '📚' },
];

export const StudioSidebar: React.FC = () => {
  const { currentStep, setCurrentStep } = useCreator();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
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
    <aside
      className={cn(
        'relative flex-shrink-0 flex flex-col bg-slate-950 text-slate-100 border-e border-slate-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? t('nav.expand_sidebar') : t('nav.collapse_sidebar')}
        className="absolute -end-3 top-6 z-10 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center shadow"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" /> : <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />}
      </button>

      {/* Brand */}
      <div className={cn('h-16 flex items-center border-b border-slate-800', collapsed ? 'px-2 justify-center' : 'px-5')}>
        <Logo size="small" />
        {!collapsed && (
          <div className="ms-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{t('nav.studio_label')}</div>
            <div className="text-xs text-slate-400 -mt-0.5">{t('nav.studio_tagline')}</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 space-y-1', collapsed ? 'p-2' : 'p-3')}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = currentStep === item.key;
          const label = item.fallback ? t(item.tKey, { defaultValue: item.fallback }) : t(item.tKey);
          return (
            <button
              key={item.key}
              onClick={() => { setCurrentStep(item.key); navigate(`/content-creator/${item.key}`); }}
              title={collapsed ? label : undefined}
              className={cn(
                'w-full flex items-center rounded-lg text-sm font-medium transition-all text-start',
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              )}
            >
              {collapsed ? (
                <Icon className={cn('h-5 w-5', active ? 'text-amber-300' : 'text-slate-400')} />
              ) : (
                <>
                  <span className="text-base leading-none">{item.emoji}</span>
                  <Icon className={cn('h-4 w-4', active ? 'text-amber-300' : 'text-slate-400')} />
                  <span className="truncate">{label}</span>
                </>
              )}
            </button>
          );
        })}

        {/* Playground Library — dedicated, hub-locked view of the Master Library,
            for the growing catalog of generalized Playground units (e.g. Little
            Explorers Phonics) built lesson by lesson. */}
        <button
          onClick={() => { setCurrentStep('library'); navigate('/content-creator/library?hub=playground'); }}
          title={collapsed ? 'Playground Library' : undefined}
          className={cn(
            'w-full flex items-center rounded-lg text-sm font-medium transition-all text-start mt-2 border border-dashed border-orange-800/60',
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            'text-orange-300 hover:bg-orange-900/20 hover:text-orange-200',
          )}
        >
          {collapsed ? (
            <Library className="h-5 w-5" />
          ) : (
            <>
              <span className="text-base leading-none">🎪</span>
              <Library className="h-4 w-4" />
              <span className="truncate">Playground Library</span>
            </>
          )}
        </button>

        {/* External link — Template Marketplace */}
        <button
          onClick={() => navigate('/template-marketplace')}
          title={collapsed ? 'Template Marketplace' : undefined}
          className={cn(
            'w-full flex items-center rounded-lg text-sm font-medium transition-all text-start mt-2 border border-dashed border-slate-700',
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            'text-emerald-300 hover:bg-emerald-900/20 hover:text-emerald-200',
          )}
        >
          {collapsed ? (
            <Sparkles className="h-5 w-5" />
          ) : (
            <>
              <span className="text-base leading-none">🛒</span>
              <Sparkles className="h-4 w-4" />
              <span className="truncate">Marketplace</span>
            </>
          )}
        </button>
      </nav>

      {/* Language switcher */}
      <div className={cn('border-t border-slate-800', collapsed ? 'p-2 flex justify-center' : 'p-3')}>
        <LanguageSwitcher
          variant="ghost"
          size="sm"
          align={collapsed ? 'center' : 'start'}
          compact={collapsed}
          className="w-full justify-start text-slate-300 hover:bg-slate-900 hover:text-white"
        />
      </div>

      {/* Footer */}
      <div className={cn('border-t border-slate-800', collapsed ? 'p-2' : 'p-3')}>
        <button
          onClick={handleLogout}
          disabled={signingOut}
          title={collapsed ? t('nav.logout') : undefined}
          className={cn(
            'w-full flex items-center rounded-lg text-sm text-slate-400 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-start',
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && (signingOut ? t('nav.signing_out') : t('nav.logout'))}
        </button>
      </div>
    </aside>
  );
};
