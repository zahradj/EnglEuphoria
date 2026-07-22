import { motion } from 'framer-motion';
import { Send, Video, Presentation, Rocket } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';

const steps = [
  { icon: Send, title: 'Submit Application', description: 'Fill out the form below with your details' },
  { icon: Video, title: 'Video Interview', description: 'Brief online interview with our team' },
  { icon: Presentation, title: 'Demo Lesson', description: 'Conduct a short demo lesson' },
  { icon: Rocket, title: 'Start Teaching', description: 'Complete training and start teaching' },
];

const TeacherProcess = () => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { theme } = useHeroTheme();

  return (
    <section className={`py-24 md:py-32 transition-colors duration-300 ${
      isDark ? 'bg-slate-950/50' : 'bg-[#FAFAFA]'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            How It{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})` }}
            >
              Works
            </span>
          </h2>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Four simple steps to join our team
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-[60%] w-full h-0.5"
                  style={{
                    background: `linear-gradient(to right, ${theme.cssFrom}40, transparent)`,
                  }}
                />
              )}

              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})`,
                  boxShadow: `0 8px 24px ${theme.cssFrom}30`,
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <step.icon className="w-7 h-7" />
              </motion.div>

              <div className={`text-xs font-bold mb-2 transition-colors duration-700`} style={{ color: theme.cssFrom }}>
                STEP {index + 1}
              </div>
              <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {step.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherProcess;
