import { motion } from 'framer-motion';
import { Clock, DollarSign, BookOpen, TrendingUp, Globe, Users } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';

const benefits = [
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description: 'Work from anywhere in the world and set your own teaching hours.',
    cssColor: '#FF9F1C',
  },
  {
    icon: DollarSign,
    title: 'Competitive Pay',
    description: 'Earn competitive rates per lesson with performance bonuses.',
    cssColor: '#10B981',
  },
  {
    icon: BookOpen,
    title: 'Teaching Materials',
    description: 'Access our premium curriculum, lesson plans, and interactive resources.',
    cssColor: '#6366F1',
  },
  {
    icon: TrendingUp,
    title: 'Professional Growth',
    description: 'Ongoing training, certifications, and career development opportunities.',
    cssColor: '#A855F7',
  },
  {
    icon: Globe,
    title: 'Global Students',
    description: 'Connect with learners from around the world and make a real impact.',
    cssColor: '#059669',
  },
  {
    icon: Users,
    title: 'Supportive Community',
    description: 'Join a network of passionate educators who support each other.',
    cssColor: '#FFBF00',
  },
];

const TeacherBenefits = () => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { theme } = useHeroTheme();

  return (
    <section className={`py-24 md:py-32 transition-colors duration-300 ${
      isDark ? 'bg-slate-950/50' : 'bg-[#FAFAFA]'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Why Teach{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})` }}
            >
              With Us?
            </span>
          </h2>
          <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Discover the benefits of joining the Engleuphoria teaching team
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`group relative p-6 rounded-2xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
                isDark
                  ? 'bg-slate-900/60 border border-white/5 hover:border-white/10'
                  : 'bg-white border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at 30% 30%, ${benefit.cssColor}, transparent 70%)` }}
              />

              <div
                className="inline-flex p-3 rounded-xl mb-4"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, ${benefit.cssColor}20, ${benefit.cssColor}10)`
                    : `linear-gradient(135deg, ${benefit.cssColor}18, ${benefit.cssColor}08)`,
                  border: `1px solid ${benefit.cssColor}${isDark ? '20' : '15'}`,
                }}
              >
                <benefit.icon className="w-6 h-6" style={{ color: benefit.cssColor }} />
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {benefit.title}
              </h3>
              <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherBenefits;
