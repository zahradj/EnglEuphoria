import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Globe, Mail, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoWhite from '@/assets/logo-white.png';
import logoBlack from '@/assets/logo-black.png';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useRef } from 'react';

type TFn = (k: string) => string;

const getFooterLinks = (t: TFn) => ({
  worlds: {
    heading: t('lp.footer.col.worlds'),
    items: [
      { label: t('lp.footer.link.playground'), href: '/student-signup' },
      { label: t('lp.footer.link.academy'), href: '/student-signup' },
      { label: t('lp.footer.link.proHub'), href: '/student-signup' },
    ],
  },
  learn: {
    heading: t('lp.footer.col.learn'),
    items: [
      { label: t('lp.footer.link.methodology'), href: '/methodology' },
      { label: t('lp.footer.link.curriculum'), href: '/curriculum' },
      { label: t('lp.footer.link.teachers'), href: '/teachers' },
      { label: t('lp.footer.link.pricing'), href: '/pricing' },
    ],
  },
  company: {
    heading: t('lp.footer.col.company'),
    items: [
      { label: t('lp.footer.link.about'), href: '/about' },
      { label: t('lp.footer.link.careers'), href: '/for-teachers' },
      { label: t('lp.footer.link.blog'), href: '/blog' },
      { label: t('lp.footer.link.contact'), href: 'mailto:hello@engleuphoria.com' },
    ],
  },
  legal: {
    heading: t('lp.footer.col.legal'),
    items: [
      { label: t('lp.footer.link.terms'), href: '/terms-of-service' },
      { label: t('lp.footer.link.privacy'), href: '/privacy-policy' },
      { label: t('lp.footer.link.refund'), href: '/refund-policy' },
    ],
  },
});

export function FooterSection() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();
  const logoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: logoRef, offset: ['start end', 'end start'] });
  const logoY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const footerLinks = getFooterLinks(t);

  return (
    <footer className={`relative transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-t border-white/10' : 'bg-[#FAFAFA] border-t border-slate-200'
    }`}>
      <div className="absolute top-0 left-0 right-0 h-[1px]">
        <div className={`h-full w-full bg-gradient-to-r ${
          isDark
            ? 'from-transparent via-indigo-500/50 to-transparent'
            : 'from-transparent via-indigo-400/30 to-transparent'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <img src={isDark ? logoWhite : logoBlack} alt="EnglEuphoria" className="w-10 h-10 object-contain" />
              <h3 className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                EnglEuphoria
              </h3>
            </Link>
            <p className={`mb-6 max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('lp.footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              {[Globe, Mail, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className={`p-3 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 hover:shadow-md'
                }`}>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, col]) => (
            <div key={key}>
              <h4 className={`font-display font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.items.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className={`text-sm transition-colors story-link ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        <motion.div
          className={`mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            © {new Date().getFullYear()} EnglEuphoria. {t('lp.footer.copyright')}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/login" className={`text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              {t('lp.footer.teacherLogin')}
            </Link>
            <Link
              to="/student-signup"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t('lp.nav.getStarted')}
            </Link>
          </div>
        </motion.div>
      </div>

      <div ref={logoRef} className="relative overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <div className="max-w-[100vw] overflow-hidden text-center pb-4">
          <motion.p
            className={`font-display font-extrabold uppercase leading-none tracking-tighter text-[100px] md:text-[180px] lg:text-[260px] translate-y-[30%] ${
              isDark ? 'text-white/[0.04]' : 'text-slate-900/[0.03]'
            }`}
            style={{ y: logoY }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            ENGLEUPHORIA
          </motion.p>
        </div>
        <p className={`text-center text-sm pb-8 -mt-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          {t('lp.footer.bigTagline')}
        </p>
      </div>
    </footer>
  );
}
