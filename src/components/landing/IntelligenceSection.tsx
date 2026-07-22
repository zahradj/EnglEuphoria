import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Zap, BookOpen, Gamepad2, TrendingUp } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';

const skills = ['Speaking', 'Listening', 'Reading', 'Writing', 'Vocabulary'];
const skillValues = [0.85, 0.7, 0.9, 0.65, 0.8];

function getPolygonPoints(values: number[], radius: number, cx: number, cy: number) {
  return values.map((v, i) => {
    const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
    return `${cx + v * radius * Math.cos(angle)},${cy + v * radius * Math.sin(angle)}`;
  }).join(' ');
}

function getAxisEnd(index: number, total: number, radius: number, cx: number, cy: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

import mentorPortrait from '@/assets/mentor-portrait.jpg';
const MENTOR_IMG = mentorPortrait;

const feedCards = [
  {
    label: 'Adults',
    tag: 'Business Track',
    title: 'English through Marketing',
    subtitle: 'Negotiation Vocabulary',
    icon: TrendingUp,
    accentDark: 'from-amber-500/20 to-orange-500/10 border-amber-500/20',
    accentLight: 'from-amber-500/10 to-orange-500/5 border-amber-300/30',
    iconColor: 'text-amber-400',
  },
  {
    label: 'Teens',
    tag: 'Academy Track',
    title: 'English through Gaming',
    subtitle: 'In-Game Communication',
    icon: Gamepad2,
    accentDark: 'from-violet-500/20 to-indigo-500/10 border-violet-500/20',
    accentLight: 'from-violet-500/10 to-indigo-500/5 border-violet-300/30',
    iconColor: 'text-violet-400',
  },
];

export function IntelligenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  const cx = 150, cy = 150, radius = 110;
  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const axisStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <section id="intelligence" ref={ref} className={`py-24 relative overflow-hidden scroll-mt-20 transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-[#FAFAFA]'
    }`}>
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] ${
        isDark ? 'from-indigo-500/5 via-transparent to-transparent' : 'from-indigo-500/[0.03] via-transparent to-transparent'
      }`} />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
            isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
          }`}>
            <Brain className="w-4 h-4" />
            Smart Learning
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 transition-colors duration-300 ${isDark ? 'text-white text-glow' : 'text-slate-900 text-ink'}`}>
            Personalized for You.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Perfected by Human Mentors.
            </span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Our system maps your strengths, adapts your curriculum, and delivers lessons tailored to your interests.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Mentor Spotlight — Teacher portrait with radar overlay */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative group">
              {/* Mentor Portrait */}
              <div
                className="w-[250px] h-[250px] md:w-[300px] md:h-[300px] rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700"
                style={{
                  boxShadow: isDark
                    ? '0 0 40px rgba(99,102,241,0.25), 0 0 80px rgba(52,211,153,0.1)'
                    : '0 0 40px rgba(99,102,241,0.15), 0 0 60px rgba(52,211,153,0.08)',
                }}
              >
                <img
                  src={MENTOR_IMG}
                  alt="Mentor"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Radar overlay on top of portrait */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 300 300" className="w-full h-full opacity-50 group-hover:opacity-70 transition-opacity duration-500">
                  {[0.25, 0.5, 0.75, 1].map((scale) => (
                    <polygon
                      key={scale}
                      points={getPolygonPoints(Array(5).fill(scale), radius, cx, cy)}
                      fill="none"
                      stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(99,102,241,0.2)'}
                      strokeWidth="1"
                    />
                  ))}
                  {skills.map((_, i) => {
                    const end = getAxisEnd(i, 5, radius, cx, cy);
                    return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={axisStroke} strokeWidth="1" />;
                  })}
                  <motion.polygon
                    points={getPolygonPoints(isInView ? skillValues : Array(5).fill(0), radius, cx, cy)}
                    fill="url(#radarGradient)"
                    stroke="url(#radarStroke)"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                  {skillValues.map((v, i) => {
                    const end = getAxisEnd(i, 5, (isInView ? v : 0) * radius, cx, cy);
                    return (
                      <motion.circle
                        key={i}
                        cx={end.x} cy={end.y} r="4"
                        fill={isDark ? 'white' : '#6366f1'}
                        initial={{ opacity: 0, r: 0 }}
                        animate={isInView ? { opacity: 1, r: 4 } : {}}
                        transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                      />
                    );
                  })}
                  {skills.map((skill, i) => {
                    const end = getAxisEnd(i, 5, radius + 24, cx, cy);
                    return (
                      <text key={skill} x={end.x} y={end.y} textAnchor="middle" dominantBaseline="middle" className={`text-xs font-semibold ${isDark ? 'fill-white/80' : 'fill-indigo-600/80'}`}>
                        {skill}
                      </text>
                    );
                  })}
                  <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(99,102,241,0.25)" />
                      <stop offset="100%" stopColor="rgba(52,211,153,0.15)" />
                    </linearGradient>
                    <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Caption */}
              <motion.p
                className={`text-center mt-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.2 }}
              >
                Data-driven insights. Mentor-led inspiration.
              </motion.p>
            </div>
          </motion.div>

          {/* Daily Feed Mockup */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Daily Feed</h3>
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lessons adapt to your interests and career goals.</p>
            </motion.div>

            {feedCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                  whileHover={{ x: 4 }}
                  className={`rounded-2xl p-5 backdrop-blur-xl bg-gradient-to-r ${isDark ? card.accentDark : card.accentLight} border transition-all duration-300 cursor-default`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'} ${card.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{card.tag}</span>
                      </div>
                      <h4 className={`font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.title}</h4>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.subtitle}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
