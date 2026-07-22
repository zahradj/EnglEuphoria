import { motion } from 'framer-motion';
import { Shield, Headphones, Brain, FlaskConical, BarChart3 } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'react-i18next';

export function TrustBarSection() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();

  const trustItems = [
    {
      icon: Shield,
      title: t('lp.trustbar.secure.title'),
      description: t('lp.trustbar.secure.desc'),
      accentDark: 'text-emerald-400 bg-emerald-500/10',
      accentLight: 'text-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50',
      floatDelay: 0,
    },
    {
      icon: Headphones,
      title: t('lp.trustbar.support.title'),
      description: t('lp.trustbar.support.desc'),
      accentDark: 'text-indigo-400 bg-indigo-500/10',
      accentLight: 'text-indigo-600 bg-gradient-to-br from-indigo-50 to-violet-50',
      floatDelay: 0.5,
    },
    {
      icon: Brain,
      title: t('lp.trustbar.curriculum.title'),
      description: t('lp.trustbar.curriculum.desc'),
      accentDark: 'text-amber-400 bg-amber-500/10',
      accentLight: 'text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50',
      floatDelay: 1,
    },
    {
      icon: FlaskConical,
      title: t('lp.trustbar.science.title'),
      description: t('lp.trustbar.science.desc'),
      accentDark: 'text-violet-400 bg-violet-500/10',
      accentLight: 'text-violet-600 bg-gradient-to-br from-violet-50 to-purple-50',
      floatDelay: 1.5,
    },
    {
      icon: BarChart3,
      title: t('lp.trustbar.analytics.title'),
      description: t('lp.trustbar.analytics.desc'),
      accentDark: 'text-cyan-400 bg-cyan-500/10',
      accentLight: 'text-cyan-600 bg-gradient-to-br from-cyan-50 to-sky-50',
      floatDelay: 2,
    },
  ];

  return (
    <section className={`py-16 relative transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-[#FAFAFA]'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`flex flex-col items-center text-center p-6 rounded-2xl backdrop-blur-xl transition-all duration-500 ${
                  isDark
                    ? 'bg-white/5 border border-white/10 hover:border-white/20'
                    : 'bg-white border border-slate-200/60 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-slate-300'
                }`}
              >
                <motion.div
                  className={`p-3.5 rounded-xl mb-4 ${isDark ? item.accentDark : item.accentLight}`}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                    delay: item.floatDelay,
                  }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
