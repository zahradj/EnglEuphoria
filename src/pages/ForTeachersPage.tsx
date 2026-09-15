import { Helmet } from 'react-helmet-async';
import { NavHeader } from '@/components/landing/NavHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { CursorTrail } from '@/components/landing/CursorTrail';
import { HeroThemeProvider } from '@/contexts/HeroThemeContext';
import TeacherHero from '@/components/teachers/TeacherHero';
import TeacherBenefits from '@/components/teachers/TeacherBenefits';
import TeacherRequirements from '@/components/teachers/TeacherRequirements';
import TeacherProcess from '@/components/teachers/TeacherProcess';
import { SimpleTeacherForm } from '@/components/teach-with-us';

export default function ForTeachersPage() {
  return (
    <>
      <Helmet>
        <title>Teach English Online — Careers at EnglEuphoria</title>
        <meta
          name="description"
          content="Join EnglEuphoria as an online English teacher. Flexible hours, live 1-on-1 lessons with kids, teens, and adults, and competitive pay. Apply today."
        />
      </Helmet>
      <HeroThemeProvider>
        <div className="min-h-dvh bg-background transition-colors duration-300">
          <CursorTrail />
          <NavHeader />
          <TeacherHero />
          <TeacherBenefits />
          <TeacherRequirements />
          <TeacherProcess />
          <SimpleTeacherForm />

          <FooterSection />
        </div>
      </HeroThemeProvider>
    </>
  );
}
