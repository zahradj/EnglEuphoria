import { motion } from 'framer-motion';
import { ArrowDown, Calendar, FileText, Video } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-card';

interface TeacherHeroProps {
  onApplyClick: () => void;
}

const TeacherHero = ({ onApplyClick }: TeacherHeroProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-slate-900 pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
      
      {/* Floating icons */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-[10%] hidden md:block"
      >
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
          <Calendar className="w-8 h-8 text-white/80" />
        </div>
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-48 right-[15%] hidden md:block"
      >
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
          <FileText className="w-8 h-8 text-white/80" />
        </div>
      </motion.div>
      
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-32 left-[20%] hidden md:block"
      >
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
          <Video className="w-8 h-8 text-white/80" />
        </div>
      </motion.div>

      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Teach on Your Terms.{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent">
                Inspire the Future.
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Join Engleuphoria and get access to our AI-powered lesson plans, 
              automated scheduling, and a global classroom.
            </p>

            <GlassButton
              onClick={onApplyClick}
              size="lg"
              className="bg-white text-violet-700 hover:bg-white/90 px-8 py-4 text-lg font-bold group"
            >
              Apply to Teach
              <ArrowDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </GlassButton>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-emerald-500 blur-3xl opacity-30 rounded-3xl" />
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop"
              alt="Teacher at laptop"
              className="relative rounded-2xl shadow-2xl w-full object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TeacherHero;
