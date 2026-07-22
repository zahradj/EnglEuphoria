import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Target,
  Layers,
  Sparkles,
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  MessageCircle,
  Repeat,
  Trophy,
  Compass,
} from 'lucide-react';

/**
 * Teacher-facing Methodology reference.
 * Explains how Engleuphoria lessons are designed so teachers can deliver
 * with confidence. No mention of automated content generation.
 */
export const TeacherMethodologyTab = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-3">
        <Badge variant="secondary" className="uppercase tracking-wider">
          Teaching Methodology
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          The Engleuphoria Method
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A CEFR-aligned, communicative framework built on decades of ELT research —
          designed to move every learner from silent recognition to confident production.
        </p>
      </header>

      {/* Three Hubs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Playground</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Ages 4–9 · 30 min · Pre-A1 → B1</p>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Story-driven, song-led, movement-based. Grammar stays implicit; learning happens through play, phonics, and repetition with Pip and friends.</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Academy</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Ages 10–17 · 60 min · Pre-A1 → C1</p>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Identity-aware, culturally relevant. Balances communicative fluency with exam readiness (Cambridge YLE, PET, FCE, IELTS/TOEFL prep at upper levels).</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">Success</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Adults 18+ · 60 min · Pre-A1 → C1</p>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Professional register from the first lesson. Focus on workplace communication, negotiation, presentations, and lexical precision.</p>
          </CardContent>
        </Card>
      </section>

      {/* Core Principles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <CardTitle>Core Pedagogical Principles</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Principle
            icon={<MessageCircle className="h-4 w-4" />}
            title="Communicative Approach (CLT)"
            body="Every lesson targets one observable Can-Do micro-task. Language is a tool for meaning, not an object of study."
          />
          <Principle
            icon={<Layers className="h-4 w-4" />}
            title="Task-Based Learning (TBL)"
            body="Learners produce real outcomes — a request made, a story told, a problem solved — with language emerging from the task."
          />
          <Principle
            icon={<Target className="h-4 w-4" />}
            title="CEFR-Aligned Progression"
            body="Every objective maps to a CEFR descriptor. No lesson exceeds the learner's level ceiling; each pushes just past the current floor."
          />
          <Principle
            icon={<Repeat className="h-4 w-4" />}
            title="Spaced Retrieval (SM-2+)"
            body="Vocabulary and grammar are recycled on a forgetting-curve schedule. Every lesson revisits ≥3 prior items before introducing new ones."
          />
        </CardContent>
      </Card>

      {/* Lesson Arc */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>The 6-Slide Lesson Arc</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Every lesson follows a Gradual Release of Responsibility (I do → We do → You do).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ['Warm-Up', 'Activate schema, lower affective filter, hook attention.'],
            ['Prime', 'Expose target language in context — noticing before rules.'],
            ['Mimic', 'Guided imitation and controlled practice with immediate feedback.'],
            ['Practice', 'Semi-controlled drills, form cards, and structured pair work.'],
            ['Produce', 'Free communicative output — the learner uses the language for real.'],
            ['Cool-Off', 'Consolidation, self-reflection, and preview of the next lesson.'],
          ].map(([title, body], i) => (
            <div key={title} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </div>
              <div>
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-sm text-muted-foreground">{body}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Unit Structure */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle>Unit Structure & Mastery Gate</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>
            Each unit is 6 lessons: <strong>Discovery → Build → Expand → Apply → Consolidate → Mastery Quiz</strong>.
            Students must score <strong>≥80%</strong> on the Mastery Quiz to unlock the next unit.
          </p>
          <p>
            If mastery isn't reached, the learner receives a targeted reinforcement lesson focused on the specific
            items they struggled with — never a generic re-run of the same content.
          </p>
        </CardContent>
      </Card>

      {/* Four Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>The Four Skills, Balanced</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            ['Listening', 'Comprehensible input above and at level; multiple accents.'],
            ['Speaking', 'Bravery over correctness. Density floor per hub. Delayed feedback.'],
            ['Reading', 'Extensive + intensive; comprehension questions overlap the passage.'],
            ['Writing', 'Guided scaffolds first; free composition only after modeling.'],
          ].map(([skill, desc]) => (
            <div key={skill} className="p-3 rounded-lg bg-muted/50">
              <div className="font-semibold">{skill}</div>
              <div className="text-xs text-muted-foreground mt-1">{desc}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Teacher Role */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Your Role as the Teacher</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            You are the <strong>facilitator</strong>, not the performer. The materials do the heavy lifting on
            structure and progression — you bring warmth, elicitation, correction, and real human connection.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Maximize student talking time (target ≥65% STT in Academy/Success, ≥50% in Playground).</li>
            <li>Use delayed correction during fluency tasks; immediate correction only during accuracy drills.</li>
            <li>Elicit before explaining — always ask before telling.</li>
            <li>Celebrate attempts, not just correct answers.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

const Principle = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
      {icon}
    </div>
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-muted-foreground text-xs mt-0.5">{body}</div>
    </div>
  </div>
);

export default TeacherMethodologyTab;
