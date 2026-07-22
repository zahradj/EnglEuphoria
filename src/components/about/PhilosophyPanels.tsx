import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Rocket, Briefcase, ArrowRight } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import heroKid from '@/assets/hero-kid.png';
import heroTeen from '@/assets/hero-teen.png';
import heroAdult from '@/assets/hero-adult.png';

const panels = [
  {
    id: 'spark',
    icon: Sparkles,
    label: 'The Spark',
    ageLabel: 'Kids 5–12',
    headline: 'For Kids, we believe in Magic.',
    body: "In our Playground, every lesson is an adventure. Kids explore a gamified forest world where learning English feels like playing their favorite game. Animated mascots guide them, rewards celebrate every milestone, and laughter is part of the curriculum.",
    gradient: 'from-[#FF9F1C] to-[#FFBF00]',
    glowColor: '#FF9F1C',
    glowColorAlt: '#FFBF00',
    iconBgDark: 'bg-[#FF9F1C]/15',
    iconBgLight: 'bg-orange-50',
    cardBorderDark: 'border-[#FF9F1C]/10',
    cardBorderLight: 'border-orange-200/60',
    cardGlowDark: 'shadow-[#FF9F1C]/5',
    cardGlowLight: 'shadow-orange-200/40',
    image: heroKid,
  },
  {
    id: 'drive',
    icon: Rocket,
    label: 'The Drive',
    ageLabel: 'Teens 13–17',
    headline: 'For Teens, we believe in Agency.',
    body: "The Academy puts teens in the driver's seat. Project-based learning, real-world challenges, and creative expression help them build confidence. No boring textbooks — just skills that matter for their future.",
    gradient: 'from-[#6366F1] to-[#A855F7]',
    glowColor: '#6366F1',
    glowColorAlt: '#A855F7',
    iconBgDark: 'bg-[#6366F1]/15',
    iconBgLight: 'bg-indigo-50',
    cardBorderDark: 'border-[#6366F1]/10',
    cardBorderLight: 'border-indigo-200/60',
    cardGlowDark: 'shadow-[#6366F1]/5',
    cardGlowLight: 'shadow-indigo-200/40',
    image: heroTeen,
  },
  {
    id: 'goal',
    icon: Briefcase,
    label: 'The Goal',
    ageLabel: 'Adults 18+',
    headline: 'For Adults, we believe in Results.',
    body: "The Professional Hub is designed for busy professionals who need English for career growth. Structured business English courses, interview preparation, and presentation skills — all delivered efficiently with measurable progress.",
    gradient: 'from-[#10B981] to-[#059669]',
    glowColor: '#10B981',
    glowColorAlt: '#059669',
    iconBgDark: 'bg-[#10B981]/15',
    iconBgLight: 'bg-emerald-50',
    cardBorderDark: 'border-[#10B981]/10',
    cardBorderLight: 'border-emerald-200/60',
    cardGlowDark: 'shadow-[#10B981]/5',
    cardGlowLight: 'shadow-emerald-200/40',
    image: heroAdult,
  },
];

function PanelCard({ panel, index, isDark }: { panel: typeof panels[0]; index: number; isDark: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isReversed = index % 2 === 1;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`relative rounded-[2rem] overflow-hidden transition-colors duration-300 ${
        isDark
          ? `bg-slate-900/60 border ${panel.cardBorderDark} shadow-2xl ${panel.cardGlowDark}`
          : `bg-white border ${panel.cardBorderLight} shadow-xl ${panel.cardGlowLight}`
      }`}
    >
      {/* Ambient glow behind entire card */}
      <div
        className={`absolute -top-20 ${isReversed ? '-left-20' : '-right-20'} w-72 h-72 rounded-full blur-[100px] transition-opacity duration-300`}
        style={{ backgroundColor: panel.glowColor, opacity: isDark ? 0.08 : 0.06 }}
      />
      <div
        className={`absolute -bottom-16 ${isReversed ? '-right-16' : '-left-16'} w-56 h-56 rounded-full blur-[80px] transition-opacity duration-300`}
        style={{ backgroundColor: panel.glowColorAlt, opacity: isDark ? 0.06 : 0.04 }}
      />

      <div className={`grid md:grid-cols-2 gap-0 ${isReversed ? 'md:direction-rtl' : ''}`}>
        {/* Image side */}
        <div className={`relative overflow-hidden aspect-[4/3] md:aspect-auto min-h-[320px] ${isReversed ? 'md:order-2' : ''}`}>
          {/* Color glow behind image */}
          <div
            className="absolute inset-0 blur-[60px] opacity-30"
            style={{ background: `radial-gradient(circle at center, ${panel.glowColor}40, transparent 70%)` }}
          />
          <img
            src={panel.image}
            alt={panel.headline}
            className="relative w-full h-full object-contain object-bottom drop-shadow-2xl p-4"
            loading="lazy"
          />
          {/* Group chip */}
          <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${panel.gradient} text-white shadow-lg`}>
            {panel.label}
          </div>
          {/* Age label */}
          <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            isDark ? 'bg-white/10 text-white/80' : 'bg-black/5 text-slate-700'
          }`}>
            {panel.ageLabel}
          </div>
        </div>

        {/* Content side */}
        <div className={`p-8 md:p-10 lg:p-12 flex flex-col justify-center relative z-10 ${isReversed ? 'md:order-1' : ''}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
            isDark ? panel.iconBgDark : panel.iconBgLight
          }`}>
            <panel.icon className="w-6 h-6" style={{ color: panel.glowColor }} />
          </div>

          <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight mb-4 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {panel.headline}
          </h3>

          <p className={`text-base leading-relaxed mb-6 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {panel.body}
          </p>

          <div
            className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer group"
            style={{ color: panel.glowColor }}
          >
            <span>Learn more</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const PhilosophyPanels = () => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section
      id="philosophy"
      className={`py-24 md:py-32 transition-colors duration-300 ${
        isDark ? 'bg-[#0F172A]' : 'bg-[#FAFAFA]'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border ${
            isDark
              ? 'bg-violet-500/10 border-violet-500/20 text-violet-300'
              : 'bg-violet-50 border-violet-200 text-violet-700'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Our Philosophy</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Three Worlds,{' '}
            <span className="bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent">
              One Mission
            </span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Every learner deserves an experience crafted for their stage of life.
          </p>
        </motion.div>

        {/* Stacked panels */}
        <div className="space-y-8 max-w-5xl mx-auto">
          {panels.map((panel, index) => (
            <PanelCard key={panel.id} panel={panel} index={index} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhilosophyPanels;
