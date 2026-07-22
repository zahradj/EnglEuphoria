import { ReactNode, useEffect } from 'react';
import { FooterSection } from '@/components/landing/FooterSection';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Link } from 'react-router-dom';
import logoWhite from '@/assets/logo-white.png';
import logoBlack from '@/assets/logo-black.png';

interface LegalPageLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, description, lastUpdated, children }: LegalPageLayoutProps) {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    document.title = `${title} | EnglEuphoria`;
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', description);
  }, [title, description]);

  return (
    <div className={`min-h-dvh ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#FAFAFA] text-slate-900'}`}>

      {/* Simple top nav */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${
        isDark ? 'bg-slate-950/70 border-white/10' : 'bg-white/70 border-slate-200'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={isDark ? logoWhite : logoBlack} alt="EnglEuphoria" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              EnglEuphoria
            </span>
          </Link>
          <Link to="/" className={`text-sm font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className={`rounded-2xl p-8 md:p-12 backdrop-blur-xl border shadow-xl ${
          isDark
            ? 'bg-white/5 border-white/10'
            : 'bg-white/80 border-slate-200'
        }`}>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className={`text-sm mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Last updated: {lastUpdated}
          </p>
          <div className={`prose prose-lg max-w-none font-body leading-relaxed space-y-6 ${
            isDark ? 'prose-invert' : ''
          }`}>
            {children}
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
