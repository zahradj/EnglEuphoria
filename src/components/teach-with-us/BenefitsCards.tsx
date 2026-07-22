import { motion } from 'framer-motion';
import { Wand2, ShieldCheck, MonitorPlay } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

const benefits = [
  {
    icon: Wand2,
    headline: 'No Lesson Planning',
    body: 'Our AI generates the slides. You just bring the energy.',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/20'
  },
  {
    icon: ShieldCheck,
    headline: 'Guaranteed Payments',
    body: 'Get paid on time, every time, regardless of cancellations.',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/20'
  },
  {
    icon: MonitorPlay,
    headline: 'Smart Classroom',
    body: 'Our interactive classroom has rewards and tools built-in.',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/20'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const BenefitsCards = () => {
  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Why Teachers Love Us
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            We handle the boring stuff so you can focus on what you do best — inspiring students.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.headline}
              variants={itemVariants}
            >
              <GlassCard className="p-8 h-full group hover:scale-105 transition-all duration-300">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl ${benefit.iconBg} mb-6`}>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${benefit.gradient}`}>
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-display font-bold text-white mb-3">
                  {benefit.headline}
                </h3>
                <p className="text-white/60 text-lg leading-relaxed">
                  {benefit.body}
                </p>

                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsCards;
