import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gift, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useThemeMode } from '@/hooks/useThemeMode';

export const AmbassadorSection: React.FC = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  return (
    <section className={`py-24 px-4 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-[#FAFAFA]'}`}>
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 ${isDark ? 'bg-violet-600/10' : 'bg-violet-600/5'}`} />
        <div className={`absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/5'}`} />
      </div>

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon cluster */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-slate-900 shadow-md">
              +1
            </div>
          </div>
        </div>

        <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Join the Engleuphoria Ambassador Program
        </h2>
        <p className={`text-lg max-w-2xl mx-auto mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Education is better with friends. Share the future of language learning and earn free sessions for every successful referral.
        </p>

        {/* Social proof avatars */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex -space-x-3">
            {[
              'bg-gradient-to-br from-violet-400 to-violet-600',
              'bg-gradient-to-br from-cyan-400 to-cyan-600',
              'bg-gradient-to-br from-amber-400 to-amber-600',
            ].map((bg, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ${bg} border-2 flex items-center justify-center ${isDark ? 'border-slate-950' : 'border-[#FAFAFA]'}`}
              >
                <Users className="h-4 w-4 text-white" />
              </div>
            ))}
          </div>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Join 200+ ambassadors already sharing</span>
        </div>

        {/* CTA */}
        <Link to={user ? '/student-dashboard' : '/student-signup'}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 gap-2"
          >
            Start Sharing
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
};
