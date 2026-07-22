import { motion, useInView } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import founderImage from '@/assets/founder-fatima.png';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useRef } from 'react';

const TeamGrid = () => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`py-24 md:py-32 transition-colors duration-300 ${
      isDark ? 'bg-[#09090B]' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full blur-[80px] bg-violet-500 opacity-[0.08]" />
            <div className={`relative rounded-[2rem] overflow-hidden ${
              isDark
                ? 'border border-white/5 shadow-2xl'
                : 'border border-slate-200/60 shadow-xl shadow-slate-200/50'
            }`}>
              <img
                src={founderImage}
                alt="Fatima Zahra Djaanine — Founder & CEO"
                className="w-full aspect-[3/4] object-cover"
              />
              {/* Overlay gradient */}
              <div className={`absolute inset-0 bg-gradient-to-t ${
                isDark ? 'from-black/60 via-transparent' : 'from-black/30 via-transparent'
              }`} />
              {/* Name overlay at bottom */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-lg mb-2">
                  Founder & CEO
                </span>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  Fatima Zahra Djaanine
                </h3>
              </div>
            </div>

            {/* LinkedIn floating card */}
            <motion.a
              href="https://www.linkedin.com/in/fatima-zahra-djaanine"
              target="_blank"
              rel="noopener noreferrer"
              className={`absolute -right-4 top-8 lg:-right-6 backdrop-blur-xl rounded-2xl px-5 py-4 z-10 flex items-center gap-3 ${
                isDark
                  ? 'bg-slate-900/80 border border-white/10 shadow-xl'
                  : 'bg-white/90 border border-slate-200/60 shadow-xl shadow-slate-200/50'
              }`}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Connect</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>LinkedIn</p>
              </div>
            </motion.a>
          </motion.div>

          {/* Right: Story */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border ${
              isDark
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <span className="text-sm font-medium">Meet the Founder</span>
            </div>

            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Built by a Teacher,{' '}
              <span className="bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent">
                for Learners.
              </span>
            </h2>

            <div className={`space-y-4 text-base leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <p>
                In 2020, amid a world searching for new ways to connect, 
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}> Fatima Zahra Djaanine </span>
                saw an opportunity to reimagine English education.
              </p>
              <p>
                What started as a vision to make language learning accessible, engaging, 
                and personalized for every age has grown into EnglEuphoria — three distinct 
                learning worlds united by one mission.
              </p>
              <p>
                With a background in language education and technology, Fatima built a platform 
                where children play, teens thrive, and professionals succeed — bridging the gap 
                between traditional teaching and modern learning experiences.
              </p>
            </div>

            {/* Values chips */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['Accessibility', 'Innovation', 'Inclusion', 'Excellence'].map((value) => (
                <span
                  key={value}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-slate-300'
                      : 'bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  {value}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TeamGrid;
