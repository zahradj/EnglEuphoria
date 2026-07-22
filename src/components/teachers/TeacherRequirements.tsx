import { motion } from 'framer-motion';
import { CheckCircle2, Shield } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';

const requirements = [
  'Native or near-native English proficiency (C1/C2 level)',
  'Teaching certification (TEFL, TESOL, CELTA, or equivalent preferred)',
  "Bachelor's degree (any field)",
  'Reliable high-speed internet connection',
  'Experience with online teaching platforms (preferred)',
  'Passion for education and helping students succeed',
];

const TeacherRequirements = () => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { theme } = useHeroTheme();

  return (
    <section className={`py-24 md:py-32 transition-colors duration-300 ${
      isDark ? 'bg-[#09090B]' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border transition-colors duration-300 ${
            isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">What We Look For</span>
          </div>
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Requirements
          </h2>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            The qualities we value in our educators
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-8 md:p-10 transition-colors duration-300 ${
            isDark
              ? 'bg-slate-900/60 border border-white/5'
              : 'bg-slate-50 border border-slate-200/60'
          }`}
        >
          <ul className="space-y-5">
            {requirements.map((req, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <CheckCircle2
                  className="w-5 h-5 mt-0.5 flex-shrink-0 transition-colors duration-700"
                  style={{ color: theme.cssFrom }}
                />
                <span className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{req}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default TeacherRequirements;
