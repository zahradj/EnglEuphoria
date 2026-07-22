import { Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HeroThemeProvider } from '@/contexts/HeroThemeContext';
import {
  HeroSection,
  NavHeader,
  CursorTrail,
  TrustLogosBand,
  StickyMobileCTA,
} from '@/components/landing';
import { AdaptiveLandingBand } from '@/components/locale/AdaptiveLandingBand';


// Below-the-fold: lazy-load to drastically reduce initial JS on mobile
const TrustBarSection = lazy(() => import('@/components/landing/TrustBarSection').then(m => ({ default: m.TrustBarSection })));
const CourseOfferingsSection = lazy(() => import('@/components/landing/CourseOfferingsSection').then(m => ({ default: m.CourseOfferingsSection })));
const BentoGridSection = lazy(() => import('@/components/landing/BentoGridSection').then(m => ({ default: m.BentoGridSection })));
const ActivityMarquee = lazy(() => import('@/components/landing/ActivityMarquee').then(m => ({ default: m.ActivityMarquee })));
const HowItWorksSection = lazy(() => import('@/components/landing/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })));
const PersonalizedPathSection = lazy(() => import('@/components/landing/PersonalizedPathSection').then(m => ({ default: m.PersonalizedPathSection })));
const GamificationSection = lazy(() => import('@/components/landing/GamificationSection').then(m => ({ default: m.GamificationSection })));
const PricingSection = lazy(() => import('@/components/landing/PricingSection').then(m => ({ default: m.PricingSection })));
const AppDownloadSection = lazy(() => import('@/components/landing/AppDownloadSection').then(m => ({ default: m.AppDownloadSection })));
const TestimonialsSection = lazy(() => import('@/components/landing/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const FinalCTASection = lazy(() => import('@/components/landing/FinalCTASection').then(m => ({ default: m.FinalCTASection })));
const ContactSection = lazy(() => import('@/components/landing/ContactSection').then(m => ({ default: m.ContactSection })));
const FooterSection = lazy(() => import('@/components/landing/FooterSection').then(m => ({ default: m.FooterSection })));
const AutoLanguageToast = lazy(() => import('@/components/landing/AutoLanguageToast').then(m => ({ default: m.AutoLanguageToast })));

// Lightweight placeholder reserves vertical space to avoid layout shift
const SectionFallback = () => <div className="min-h-[200px]" aria-hidden="true" />;

export default function LandingPage() {
  const { user, loading } = useAuth();

  // Reserve space at the bottom of the page for the sticky mobile CTA
  // so it never overlaps the final sections (handled in index.css).
  useEffect(() => {
    document.body.classList.add('has-sticky-cta');
    return () => document.body.classList.remove('has-sticky-cta');
  }, []);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <HeroThemeProvider>
      <main className="min-h-dvh bg-white dark:bg-[#09090B] transition-colors duration-300">
        <CursorTrail />
        <NavHeader />
        <AdaptiveLandingBand />
        <HeroSection />

        <TrustLogosBand />
        <Suspense fallback={<SectionFallback />}>
          <TrustBarSection />
          <CourseOfferingsSection />
          <BentoGridSection />
          <ActivityMarquee />
          <HowItWorksSection />
          <PersonalizedPathSection />
          <GamificationSection />
          <PricingSection />
          <AppDownloadSection />
          <TestimonialsSection />
          <FinalCTASection />
          <ContactSection />
          <FooterSection />
          <AutoLanguageToast />
        </Suspense>
        <StickyMobileCTA />
      </main>
    </HeroThemeProvider>
  );
}
