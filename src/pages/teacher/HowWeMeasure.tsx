import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card>
    <CardContent className="space-y-2 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
    </CardContent>
  </Card>
);

/**
 * Teacher-facing, plain-language "what we measure and why". It must stay true to what the app actually does:
 * if a measure is added, changed or switched on, update this page in the same change.
 * (Draft wording: have it reviewed together with the contract addendum before it is relied on.)
 */
export default function HowWeMeasure() {
  return (
    <div className="container mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/teacher/kpi"><ArrowLeft className="mr-2 h-4 w-4" />My teaching</Link>
      </Button>

      <header>
        <h1 className="text-2xl font-bold md:text-3xl">How we measure</h1>
        <p className="text-muted-foreground">
          What your "My teaching" page shows, what it leaves out, and what it is for.
        </p>
      </header>

      <Section title="What it is for">
        <p>
          To help you see how your lessons are going and what to work on next. It is meant for support and coaching. It is not
          a ranking, and no one is compared with other teachers on this page.
        </p>
      </Section>

      <Section title="The five goals">
        <ul className="list-disc space-y-1.5 ps-5">
          <li><strong className="text-foreground">On time:</strong> you joined the classroom within 2 minutes of the start.</li>
          <li><strong className="text-foreground">Lessons delivered:</strong> booked lessons that took place.</li>
          <li><strong className="text-foreground">Report within 24 hours:</strong> your lesson report was sent within a day of the lesson.</li>
          <li>
            <strong className="text-foreground">Student talking time:</strong> how much of the lesson your student speaks.
            It is counted from microphone activity on each person's own device, as a number of seconds. No audio is recorded or
            stored by this feature. It only appears once this feature is switched on.
          </li>
          <li><strong className="text-foreground">Student confidence:</strong> students who said, after the lesson, that they feel more confident.</li>
        </ul>
        <p>
          A goal only gets a colour after there are at least 5 lessons (3 for talking time) behind it. Until then it says "collecting data",
          so a few early lessons never decide anything.
        </p>
      </Section>

      <Section title="What is left out, so it is fair">
        <ul className="list-disc space-y-1.5 ps-5">
          <li>Platform problems and technical faults that were not on your side.</li>
          <li>Lessons a student cancelled, or where the student did not come but you were there.</li>
          <li>The page tells you how many lessons were left out for these reasons.</li>
        </ul>
      </Section>

      <Section title="What we are not using">
        <ul className="list-disc space-y-1.5 ps-5">
          <li>
            <strong className="text-foreground">Star ratings.</strong> Ratings from students and parents can reflect things that have nothing to do with
            teaching quality, such as accent or gender, so they are not used to judge you.
          </li>
          <li>
            <strong className="text-foreground">The old overall score, ranking and "At Risk" label.</strong> They are paused: they are not used to rank, flag
            or pay anyone while the new, coaching-based approach is built.
          </li>
        </ul>
      </Section>

      <Section title="Who can see it">
        <p>
          You see your own page. Your coordinator is able to see the same figures you see, so any conversation starts from shared numbers.
          Nothing here is shown to students or parents.
        </p>
      </Section>

      <Section title="If something looks wrong">
        <p>
          Tell your coordinator. If a lesson was counted that should not have been, or a figure does not match what happened, ask for it to be
          checked. Numbers are a starting point for a conversation, not a verdict.
        </p>
      </Section>

      <Section title="What may come next">
        <p>
          We may add short, planned lesson observations with a clear rubric, and coaching conversations to go with them. If that happens,
          you will be told first, shown the rubric, and given the chance to ask questions before anything starts.
        </p>
      </Section>
    </div>
  );
}
