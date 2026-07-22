import { MissionHeader, PhilosophyPanels, TeamGrid, AboutCTA } from '@/components/about';
import { FooterSection } from '@/components/landing';
import { NavHeader } from '@/components/landing/NavHeader';
import { CursorTrail } from '@/components/landing/CursorTrail';
import { HeroThemeProvider } from '@/contexts/HeroThemeContext';

const AboutPage = () => {
  return (
    <HeroThemeProvider>
      <div className="min-h-dvh bg-background transition-colors duration-300">
        <CursorTrail />
        <NavHeader />
        <MissionHeader />
        <PhilosophyPanels />
        <TeamGrid />
        <AboutCTA />
        <FooterSection />
      </div>
    </HeroThemeProvider>
  );
};

export default AboutPage;
