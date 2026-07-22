import React from 'react';
import { Helmet } from 'react-helmet-async';
import LevelsAndCourses from '@/components/methodology/LevelsAndCourses';

/**
 * Public Methodology page — Levels & Courses reference for Playground + Academy,
 * mirroring the Novakid age-band structure.
 */
export default function MethodologyPage() {
  return (
    <>
      <Helmet>
        <title>Methodology — Levels & Courses | Engleuphoria</title>
        <meta
          name="description"
          content="Engleuphoria English levels from pre-school (Playground) to Flyers and speaking courses (Academy), aligned with CEFR Pre-A1 to B1+."
        />
      </Helmet>
      <main className="min-h-screen bg-background py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Methodology</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              How our Playground (ages 4–9) and Academy (ages 11+) curricula progress, level by level.
            </p>
          </header>
          <LevelsAndCourses />
        </div>
      </main>
    </>
  );
}
