import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Send, User, Mail, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').max(255, 'Email must be less than 255 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { toast } = useToast();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();
  const { user } = useAuth();

  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<ContactFormData> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_inquiries').insert({
        name: result.data.name,
        email: result.data.email,
        message: result.data.message,
        user_id: user?.id ?? null,
      });
      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: t('lp.contact.toast.title'),
        description: t('lp.contact.toast.body'),
      });

      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Contact submit failed:', err);
      toast({
        title: 'Something went wrong',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <section
      id="contact"
      className={`relative py-24 overflow-hidden transition-colors duration-300 ${isDark ? '' : 'bg-[#FAFAFA]'}`}
      ref={ref}
    >
      <div className={`absolute inset-0 ${
        isDark
          ? 'bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950'
          : 'bg-gradient-to-b from-transparent via-slate-100/50 to-[#FAFAFA]'
      }`} />

      <div className={`absolute top-20 left-10 w-72 h-72 rounded-full filter blur-3xl ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/5'}`} />
      <div className={`absolute bottom-20 right-10 w-80 h-80 rounded-full filter blur-3xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="max-w-2xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <span className={`inline-block px-4 py-1.5 backdrop-blur-sm rounded-full text-sm font-medium mb-4 ${
              isDark ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'
            }`}>
              {t('lp.contact.badge')}
            </span>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('lp.contact.heading')}{' '}
              <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
                {t('lp.contact.headingAccent')}
              </span>
            </h2>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('lp.contact.subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`relative backdrop-blur-xl rounded-2xl p-8 shadow-2xl ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-lg'
            }`}
          >
            <div className={`absolute -z-10 inset-0 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-500/10'
                : 'bg-gradient-to-br from-violet-500/5 via-transparent to-emerald-500/5'
            }`} />

            {isSubmitted ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('lp.contact.thanks.title')}
                </h3>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('lp.contact.thanks.body')}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                    <User className="w-4 h-4" />
                    {t('lp.contact.label.name')}
                  </label>
                  <Input
                    placeholder={t('lp.contact.placeholder.name')}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`h-12 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500/50'
                    } ${errors.name ? 'border-red-500/50' : ''}`}
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                    <Mail className="w-4 h-4" />
                    {t('lp.contact.label.email')}
                  </label>
                  <Input
                    type="email"
                    placeholder={t('lp.contact.placeholder.email')}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-12 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500/50'
                    } ${errors.email ? 'border-red-500/50' : ''}`}
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                    <MessageSquare className="w-4 h-4" />
                    {t('lp.contact.label.message')}
                  </label>
                  <Textarea
                    placeholder={t('lp.contact.placeholder.message')}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={5}
                    className={`resize-none ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500/50'
                    } ${errors.message ? 'border-red-500/50' : ''}`}
                  />
                  {errors.message && <p className="text-red-400 text-sm">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-semibold text-lg shadow-lg shadow-violet-500/25 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 me-2 animate-spin" />
                      {t('lp.contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 me-2" />
                      {t('lp.contact.send')}
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
