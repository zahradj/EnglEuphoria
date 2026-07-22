import { useState, forwardRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Upload, CheckCircle, Loader2, FileText, X, XCircle, Sparkles } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { RECRUITMENT_GRAMMAR_QUESTIONS, type GrammarQuestion } from '@/data/recruitmentGrammarQuestions';

import { COUNTRIES } from '@/lib/countries';
const countries = COUNTRIES;

const languages = [
  'English', 'Spanish', 'French', 'German', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Other'
];

const educationLevels = [
  "Bachelor's Degree", "Master's Degree", "PhD / Doctorate",
  "TEFL/TESOL Certificate", "CELTA/DELTA", "Other Certification"
];

const methodologies = [
  'Communicative Language Teaching (CLT)',
  'Task-Based Learning (TBL)',
  'Total Physical Response (TPR)',
  'PPP (Presentation, Practice, Production)',
  'Dogme / Unplugged',
  'Blended / Hybrid',
  'Other'
];

const classroomStyles = [
  'Student-centered & collaborative',
  'Structured & curriculum-driven',
  'Game-based & interactive',
  'Conversation-focused & immersive',
  'Project-based learning',
  'Other'
];

const ageGroups = [
  { value: 'kids', label: 'Kids (4–12)' },
  { value: 'teens', label: 'Teens (13–17)' },
  { value: 'adults', label: 'Adults (18+)' },
  { value: 'all', label: 'All Ages' },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  yearsExperience: string;
  hasCertification: boolean;
  primaryLanguage: string;
  education: string;
  preferredAgeGroup: string;
  teachingMethodology: string;
  classroomManagement: string;
  videoDescription: string;
  whyTeaching: string;
  cvFile: File | null;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  yearsExperience: '',
  hasCertification: false,
  primaryLanguage: '',
  education: '',
  preferredAgeGroup: '',
  teachingMethodology: '',
  classroomManagement: '',
  videoDescription: '',
  whyTeaching: '',
  cvFile: null
};

const GRAMMAR_TEST_LENGTH = 15;
const GRAMMAR_PASS_PCT = 85;

const hubPreferenceForAgeGroup = (ageGroup: string): 'playground' | 'academy' | 'success' | null => {
  if (ageGroup === 'kids') return 'playground';
  if (ageGroup === 'teens') return 'academy';
  if (ageGroup === 'adults') return 'success';
  return null;
};

function drawGrammarQuestions(): GrammarQuestion[] {
  const pool = [...RECRUITMENT_GRAMMAR_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, GRAMMAR_TEST_LENGTH);
}

type GrammarPhase = 'intro' | 'taking' | 'failed';

const SimpleTeacherForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // Grammar test state (Step 2)
  const grammarQuestions = useMemo(() => drawGrammarQuestions(), []);
  const [grammarPhase, setGrammarPhase] = useState<GrammarPhase>('intro');
  const [grammarAnswers, setGrammarAnswers] = useState<Record<string, number>>({});
  const [grammarPassed, setGrammarPassed] = useState(false);
  const [grammarScore, setGrammarScore] = useState<number | null>(null);

  const totalSteps = 6;
  const stepLabels = ['Basics', 'Grammar Test', 'Experience', 'Methodology', 'About You', 'CV Upload'];

  const updateField = (field: keyof FormData, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.country) newErrors.country = 'Please select your country';
    }

    if (step === 3) {
      if (!formData.yearsExperience) newErrors.yearsExperience = 'Please enter years of experience';
      if (!formData.primaryLanguage) newErrors.primaryLanguage = 'Please select your primary language';
      if (!formData.education) newErrors.education = 'Please select your education level';
      if (!formData.preferredAgeGroup) newErrors.preferredAgeGroup = 'Please select a preferred age group';
    }

    if (step === 4) {
      if (!formData.teachingMethodology) newErrors.teachingMethodology = 'Please select your teaching methodology';
      if (!formData.classroomManagement) newErrors.classroomManagement = 'Please select your classroom style';
    }

    if (step === 5) {
      if (!formData.videoDescription.trim()) newErrors.videoDescription = 'Please describe your intro video plan';
      else if (formData.videoDescription.length < 30) {
        newErrors.videoDescription = 'Please write at least 30 characters';
      }
      if (!formData.whyTeaching.trim()) newErrors.whyTeaching = 'Please tell us why you love teaching';
      else if (formData.whyTeaching.length < 50) {
        newErrors.whyTeaching = 'Please write at least 50 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const gradeGrammarLocally = () => {
    let correct = 0;
    for (const q of grammarQuestions) {
      if (grammarAnswers[q.id] === q.correct) correct++;
    }
    const pct = (correct / grammarQuestions.length) * 100;
    setGrammarScore(pct);
    if (pct >= GRAMMAR_PASS_PCT) {
      setGrammarPassed(true);
      setCurrentStep(3);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } else {
      setGrammarPassed(false);
      setGrammarPhase('failed');
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (grammarPhase === 'intro') {
        setGrammarPhase('taking');
        return;
      }
      if (grammarPhase === 'taking') {
        const answered = grammarQuestions.every(q => typeof grammarAnswers[q.id] === 'number');
        if (!answered) {
          toast({ title: 'Please answer every question', variant: 'destructive' });
          return;
        }
        gradeGrammarLocally();
        return;
      }
      return;
    }
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    if (currentStep === 3 && grammarPassed) {
      // Don't let them retake the test
      setCurrentStep(1);
      return;
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Please upload a PDF or Word document.', variant: 'destructive' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Please upload a file smaller than 10MB.', variant: 'destructive' });
        return;
      }
      updateField('cvFile', file);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    if (!grammarPassed) {
      toast({ title: 'Grammar test not passed', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      let cvUrl: string | null = null;

      if (formData.cvFile) {
        const fileExt = formData.cvFile.name.split('.').pop();
        const fileName = `applications/${Date.now()}-${formData.email.replace(/[^a-z0-9]/gi, '_')}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('teacher-applications')
          .upload(fileName, formData.cvFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('teacher-applications')
          .getPublicUrl(fileName);
        cvUrl = publicUrl;
      }

      const applicationPayload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        nationality: formData.country,
        teaching_experience_years: parseInt(formData.yearsExperience) || 0,
        esl_certification: formData.hasCertification ? 'Yes' : 'No',
        languages_spoken: [formData.primaryLanguage],
        education: formData.education,
        teaching_methodology: formData.teachingMethodology,
        classroom_management: formData.classroomManagement,
        preferred_age_groups: formData.preferredAgeGroup === 'all'
          ? ['kids', 'teens', 'adults']
          : [formData.preferredAgeGroup],
        hub_preference: hubPreferenceForAgeGroup(formData.preferredAgeGroup),
        video_description: formData.videoDescription,
        cover_letter: formData.whyTeaching,
        cv_url: cvUrl,
        grammar_test_status: 'in_progress',
      };

      // Use a SECURITY DEFINER RPC so anonymous applicants can submit AND
      // receive the new id back (direct INSERT with .select() fails RLS
      // because anon has no SELECT policy on teacher_applications).
      const { data: newId, error } = await supabase.rpc('submit_teacher_application', {
        p_payload: applicationPayload as never,
      });
      if (error) throw error;
      const insertedApp = { id: newId as unknown as string };

      // Server-side re-grade + persistence; mints invite token on pass.
      const answersPayload = grammarQuestions.map(q => ({
        questionId: q.id,
        selected: grammarAnswers[q.id],
      }));

      const { data: gradeData, error: gradeErr } = await supabase.functions.invoke(
        'grade-grammar-test',
        { body: { applicationId: insertedApp.id, email: formData.email, answers: answersPayload } },
      );
      if (gradeErr) throw gradeErr;

      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'application-received',
            recipientEmail: formData.email,
            idempotencyKey: `app-received-${insertedApp.id}`,
            templateData: { name: `${formData.firstName} ${formData.lastName}` },
          },
        });
      } catch {
        /* non-blocking */
      }

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      const graded = gradeData as { inviteToken?: string; roomToken?: string; bookingLink?: string } | null;
      if (graded?.roomToken) {
        navigate(`/interview/${graded.roomToken}`);
      } else if (graded?.bookingLink) {
        window.location.href = graded.bookingLink;
      } else if (graded?.inviteToken) {
        const token = graded.inviteToken;
        navigate(`/teacher/interview/schedule/${token}`);
      } else {
        navigate(`/teach-with-us/grammar-test/result?passed=1`);
      }
    } catch (error: unknown) {
      const anyErr = error as any;
      const rawMsg = error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? ('message' in error && typeof anyErr.message === 'string'
              ? anyErr.message
              : JSON.stringify(error))
          : String(error);
      const isDuplicateEmail =
        anyErr?.code === '23505' ||
        /duplicate key|already exists|teacher_applications_email_key/i.test(rawMsg || '');
      const description = isDuplicateEmail
        ? 'An application with this email already exists. If this is you, please check your inbox for our follow-up email, or contact support@engleuphoria.com.'
        : rawMsg || 'There was an error submitting your application. Please try again.';
      console.error('Application submission error:', { error, message: rawMsg });
      toast({
        title: isDuplicateEmail ? 'Email already used' : 'Application Failed',
        description,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={ref} id="application-form" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Start Your Application
          </h2>
          <p className="text-muted-foreground text-lg">
            It only takes a few minutes to apply
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep}: {stepLabels[currentStep - 1]}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <GlassCard className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Basics */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h3 className="text-xl font-display font-bold text-foreground mb-4">The Basics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-foreground/80">First Name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} className="bg-background border-border text-foreground mt-1" placeholder="John" />
                      {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-foreground/80">Last Name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} className="bg-background border-border text-foreground mt-1" placeholder="Doe" />
                      {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground/80">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="bg-background border-border text-foreground mt-1" placeholder="john@example.com" />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground/80">Country</Label>
                    <Select value={formData.country} onValueChange={(v) => updateField('country', v)}>
                      <SelectTrigger className="bg-background border-border text-foreground mt-1">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (<SelectItem key={country} value={country}>{country}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Grammar Test */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {grammarPhase === 'intro' && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-foreground">English Grammar Check</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Before we move on, please complete a short grammar test ({GRAMMAR_TEST_LENGTH} questions, ~7 minutes).
                        You need <span className="text-emerald-400 font-semibold">{GRAMMAR_PASS_PCT}%</span> to continue your application.
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Questions range from A2 to C1 level. Choose the best option for each.
                      </p>
                    </div>
                  )}

                  {grammarPhase === 'taking' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-display font-bold text-foreground">Grammar Test</h3>
                        <span className="text-muted-foreground text-sm">
                          {Object.keys(grammarAnswers).length} / {grammarQuestions.length} answered
                        </span>
                      </div>
                      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                        {grammarQuestions.map((q, idx) => (
                          <div key={q.id} className="rounded-lg bg-muted/40 border border-border p-4">
                            <p className="text-foreground mb-3">
                              <span className="text-muted-foreground/70 mr-2">{idx + 1}.</span>{q.question}
                            </p>
                            <div className="grid gap-2">
                              {q.options.map((opt, i) => {
                                const selected = grammarAnswers[q.id] === i;
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setGrammarAnswers(prev => ({ ...prev, [q.id]: i }))}
                                    className={`text-left px-3 py-2 rounded-md border transition-colors ${
                                      selected
                                        ? 'border-emerald-400 bg-emerald-500/15 text-foreground'
                                        : 'border-border bg-muted/40 text-foreground/80 hover:bg-muted'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {grammarPhase === 'failed' && (
                    <div className="text-center space-y-4 py-6">
                      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                        <XCircle className="w-10 h-10 text-destructive" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-foreground">Application Closed</h3>
                      <p className="text-muted-foreground">
                        You scored <span className="font-semibold text-foreground">{grammarScore?.toFixed(0)}%</span>.
                        Our grammar threshold is {GRAMMAR_PASS_PCT}%, so we can't move you forward this time.
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Thank you for your interest in Engleuphoria. You're welcome to reapply in the future.
                      </p>
                      <GlassButton onClick={() => (window.location.href = '/')} className="bg-muted/60 hover:bg-muted mt-4">
                        Back to Home
                      </GlassButton>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Experience & Education */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h3 className="text-xl font-display font-bold text-foreground mb-4">Experience & Education</h3>
                  <div>
                    <Label htmlFor="experience" className="text-foreground/80">Years of Teaching Experience</Label>
                    <Input id="experience" type="number" min="0" max="50" value={formData.yearsExperience} onChange={(e) => updateField('yearsExperience', e.target.value)} className="bg-background border-border text-foreground mt-1" placeholder="e.g., 5" />
                    {errors.yearsExperience && <p className="text-destructive text-sm mt-1">{errors.yearsExperience}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground/80">Education / Certification</Label>
                    <Select value={formData.education} onValueChange={(v) => updateField('education', v)}>
                      <SelectTrigger className="bg-background border-border text-foreground mt-1">
                        <SelectValue placeholder="Select your highest qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (<SelectItem key={level} value={level}>{level}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {errors.education && <p className="text-destructive text-sm mt-1">{errors.education}</p>}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="certification" checked={formData.hasCertification} onCheckedChange={(checked) => updateField('hasCertification', !!checked)} />
                    <Label htmlFor="certification" className="text-foreground/80">I have TEFL/TESOL certification</Label>
                  </div>
                  <div>
                    <Label className="text-foreground/80">Primary Language</Label>
                    <Select value={formData.primaryLanguage} onValueChange={(v) => updateField('primaryLanguage', v)}>
                      <SelectTrigger className="bg-background border-border text-foreground mt-1">
                        <SelectValue placeholder="Select your primary language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (<SelectItem key={lang} value={lang}>{lang}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {errors.primaryLanguage && <p className="text-destructive text-sm mt-1">{errors.primaryLanguage}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground/80">Preferred Age Group to Teach</Label>
                    <Select value={formData.preferredAgeGroup} onValueChange={(v) => updateField('preferredAgeGroup', v)}>
                      <SelectTrigger className="bg-background border-border text-foreground mt-1">
                        <SelectValue placeholder="Select preferred age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map((ag) => (<SelectItem key={ag.value} value={ag.value}>{ag.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {errors.preferredAgeGroup && <p className="text-destructive text-sm mt-1">{errors.preferredAgeGroup}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Teaching Methodology & Classroom Style */}
              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h3 className="text-xl font-display font-bold text-foreground mb-4">Teaching Style</h3>
                  <div>
                    <Label className="text-foreground/80">Teaching Methodology</Label>
                    <p className="text-muted-foreground/70 text-sm mb-2">What approach best describes your teaching?</p>
                    <Select value={formData.teachingMethodology} onValueChange={(v) => updateField('teachingMethodology', v)}>
                      <SelectTrigger className="bg-background border-border text-foreground mt-1">
                        <SelectValue placeholder="Select your methodology" />
                      </SelectTrigger>
                      <SelectContent>
                        {methodologies.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {errors.teachingMethodology && <p className="text-destructive text-sm mt-1">{errors.teachingMethodology}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground/80">Classroom Management Style</Label>
                    <p className="text-muted-foreground/70 text-sm mb-2">How do you keep students engaged?</p>
                    <Select value={formData.classroomManagement} onValueChange={(v) => updateField('classroomManagement', v)}>
                      <SelectTrigger className="bg-background border-border text-foreground mt-1">
                        <SelectValue placeholder="Select your style" />
                      </SelectTrigger>
                      <SelectContent>
                        {classroomStyles.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {errors.classroomManagement && <p className="text-destructive text-sm mt-1">{errors.classroomManagement}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Video & Motivation */}
              {currentStep === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h3 className="text-xl font-display font-bold text-foreground mb-4">Tell Us About You</h3>
                  <div>
                    <Label htmlFor="videoDescription" className="text-foreground/80">AI Video Pre-check: Describe Your Intro Video</Label>
                    <p className="text-muted-foreground/70 text-sm mb-2">
                      We'll ask you to record a 60-second intro video. Describe what you'd cover (e.g., greeting style, teaching energy, topic preview).
                    </p>
                    <Textarea id="videoDescription" value={formData.videoDescription} onChange={(e) => updateField('videoDescription', e.target.value)} className="bg-background border-border text-foreground mt-1 min-h-[100px]" placeholder="I would introduce myself warmly, show my classroom setup, and demonstrate a quick vocabulary game..." />
                    <div className="flex justify-between mt-1">
                      {errors.videoDescription && <p className="text-destructive text-sm">{errors.videoDescription}</p>}
                      <p className="text-muted-foreground/70 text-sm ml-auto">{formData.videoDescription.length} / 30 min</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="whyTeaching" className="text-foreground/80">Why do you love teaching?</Label>
                    <Textarea id="whyTeaching" value={formData.whyTeaching} onChange={(e) => updateField('whyTeaching', e.target.value)} className="bg-background border-border text-foreground mt-1 min-h-[120px]" placeholder="Share your passion for teaching and what makes you a great educator..." />
                    <div className="flex justify-between mt-1">
                      {errors.whyTeaching && <p className="text-destructive text-sm">{errors.whyTeaching}</p>}
                      <p className="text-muted-foreground/70 text-sm ml-auto">{formData.whyTeaching.length} / 50 min</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 6: CV Upload */}
              {currentStep === 6 && (
                <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h3 className="text-xl font-display font-bold text-foreground mb-4">Upload Your CV / Resume</h3>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors">
                    <input type="file" id="cvUpload" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                    {formData.cvFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-emerald-400" />
                        <div className="text-left">
                          <p className="text-foreground font-medium">{formData.cvFile.name}</p>
                          <p className="text-muted-foreground text-sm">{(formData.cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={() => updateField('cvFile', null)} className="ml-4 p-1 rounded-full hover:bg-muted transition-colors">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="cvUpload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-muted-foreground/70 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">Click to upload your CV</p>
                        <p className="text-muted-foreground/70 text-sm">PDF or Word document, max 10MB</p>
                      </label>
                    )}
                  </div>
                  <p className="text-muted-foreground/70 text-sm text-center">CV upload is optional but highly recommended</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation — hidden when test failed */}
            {!(currentStep === 2 && grammarPhase === 'failed') && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {currentStep > 1 && !(currentStep === 2 && grammarPhase === 'taking') ? (
                  <GlassButton onClick={handleBack} className="bg-muted/40 hover:bg-muted">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </GlassButton>
                ) : (<div />)}

                {currentStep < totalSteps ? (
                  <GlassButton onClick={handleNext} className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500">
                    {currentStep === 2 && grammarPhase === 'intro' && (<>Start Test<ChevronRight className="w-4 h-4 ml-2" /></>)}
                    {currentStep === 2 && grammarPhase === 'taking' && (<>Submit Answers<CheckCircle className="w-4 h-4 ml-2" /></>)}
                    {currentStep !== 2 && (<>Next<ChevronRight className="w-4 h-4 ml-2" /></>)}
                  </GlassButton>
                ) : (
                  <GlassButton onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500">
                    {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>) : (<>Submit Application<CheckCircle className="w-4 h-4 ml-2" /></>)}
                  </GlassButton>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
});

SimpleTeacherForm.displayName = 'SimpleTeacherForm';

export default SimpleTeacherForm;
