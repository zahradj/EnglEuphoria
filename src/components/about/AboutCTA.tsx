import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';

const AboutCTA = () => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { theme } = useHeroTheme();

  return (
    <section className={`py-24 md:py-32 relative overflow-hidden ${
      isDark ? 'bg-[#09090B]' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className={`max-w-4xl mx-auto text-center rounded-[2rem] p-12 md:p-16 relative overflow-hidden ${
            isDark
              ? 'bg-gradient-to-br from-indigo-950/80 to-violet-950/80 border border-indigo-500/20'
              : 'bg-gradient-to-br from-indigo-600 to-violet-700'
          }`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] bg-violet-500/20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[60px] bg-indigo-500/20" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Join the community
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Ready to Find
              <br />
              Your World?
            </h2>

            <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
              Join thousands of learners who've discovered their perfect English learning path.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/student-signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 transition-all duration-700 hover:shadow-2xl hover:-translate-y-0.5"
                style={{ background: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})`, color: 'white' }}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="mailto:hello@engleuphoria.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 text-white font-semibold text-lg backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/20"
              >
                <MessageCircle className="w-5 h-5" />
                Talk to Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCTA;
