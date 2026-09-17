import React from 'react';
import { Helmet } from 'react-helmet-async';
import PlatformMethodology from '@/components/methodology/PlatformMethodology';

/**
 * Public Methodology page — describes EnglEuphoria's own teaching approach:
 * the three hubs, live-lesson structure, placement/progression, and
 * gamification philosophy. Previously rendered a "Levels and Courses" panel
 * modeled directly on a competitor's (Novakid's) course structure and course
 * names — replaced per direct request with the platform's real methodology.
 */
export default function MethodologyPage() {
  return (
    <>
      <Helmet>
        <title>Methodology | EnglEuphoria</title>
        <meta
          name="description"
          content="How EnglEuphoria teaches: live 1-on-1 lessons across three CEFR-aligned hubs, adaptive placement, automatic progression, and gamification built to reinforce learning."
        />
      </Helmet>
      <main className="min-h-screen bg-background py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Our Methodology</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              How EnglEuphoria actually teaches — live teachers, a shared CEFR framework across all three hubs,
              and progress that takes care of itself.
            </p>
          </header>
          <PlatformMethodology />
        </div>
      </main>
    </>
  );
}
