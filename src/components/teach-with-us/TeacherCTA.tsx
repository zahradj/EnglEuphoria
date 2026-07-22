import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, ArrowUp } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-card';

interface TeacherCTAProps {
  onApplyClick: () => void;
}

const TeacherCTA = ({ onApplyClick }: TeacherCTAProps) => {
  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
            Still have questions?
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/faq">
              <GlassButton variant="outline" className="border-white/20 hover:bg-white/10">
                <HelpCircle className="w-4 h-4 mr-2" />
                Read Teacher FAQ
              </GlassButton>
            </Link>
            
            <a href="mailto:careers@engleuphoria.com">
              <GlassButton variant="outline" className="border-white/20 hover:bg-white/10">
                <Mail className="w-4 h-4 mr-2" />
                Contact Hiring Team
              </GlassButton>
            </a>
          </div>

          <GlassButton
            onClick={onApplyClick}
            size="lg"
            className="bg-gradient-to-r from-violet-500 to-emerald-500 hover:from-violet-600 hover:to-emerald-600"
          >
            Apply Now
            <ArrowUp className="w-5 h-5 ml-2" />
          </GlassButton>
        </motion.div>
      </div>
    </section>
  );
};

export default TeacherCTA;
