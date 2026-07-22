import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Clock,
  Monitor,
  ClipboardCheck,
  ShieldCheck,
  Lightbulb,
  Mail,
  Sparkles,
  Eye,
} from 'lucide-react';

const sections = [
  {
    icon: LayoutDashboard,
    title: '1. The "Smart" Dashboard',
    content: (
      <ul className="space-y-2 text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-destructive shrink-0" />
          <span><strong className="text-foreground">Red Dot:</strong> Indicates a live class starting soon.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
          <span><strong className="text-foreground">Student Context Card:</strong> Click to see the student's AI Placement results, interests, and previous mistakes before you say "Hello."</span>
        </li>
      </ul>
    ),
  },
  {
    icon: Clock,
    title: '2. The 25/55 Minute Rule (The "Buffer")',
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground">We prioritize your mental energy. Our sessions are timed to give you a mandatory break:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-border bg-muted/40">
            <CardContent className="p-4">
              <p className="font-semibold text-foreground">30-Minute Slots</p>
              <p className="text-sm text-muted-foreground">Teach for <strong>25 minutes</strong>. Final 5 minutes to breathe and finalize notes.</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-muted/40">
            <CardContent className="p-4">
              <p className="font-semibold text-foreground">60-Minute Slots</p>
              <p className="text-sm text-muted-foreground">Teach for <strong>55 minutes</strong>. Final 5 minutes for wrap-up.</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-destructive font-medium">⏱ The classroom timer will turn Red when it's time to say goodbye. Please respect this to stay on time for your next student.</p>
      </div>
    ),
  },
  {
    icon: Monitor,
    title: '3. The Interactive Classroom',
    content: (
      <div className="space-y-2">
        <p className="text-muted-foreground">Your classroom is equipped with an AI Co-Pilot:</p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <ClipboardCheck className="w-4 h-4 mt-1 text-primary shrink-0" />
            <span><strong className="text-foreground">Shared Canvas:</strong> Anything you write on the whiteboard or notes is synced instantly to the student.</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-1 text-primary shrink-0" />
            <span><strong className="text-foreground">The "Sparkle" (✨) Icon:</strong> Click this if the conversation stalls. The AI will suggest a topic based on the student's interests (e.g., "Ask them about their recent trip to Japan").</span>
          </li>
          <li className="flex items-start gap-2">
            <Eye className="w-4 h-4 mt-1 text-primary shrink-0" />
            <span><strong className="text-foreground">Zen Mode:</strong> If the student is distracted, toggle this to hide all buttons and focus purely on the video and material.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    icon: ClipboardCheck,
    title: '4. The "Post-Class" Workflow (Critical)',
    content: (
      <div className="space-y-2">
        <p className="text-muted-foreground">Complete the Lesson Wrap-up form in the final 2 minutes to keep the student's Personalized Learning Path updated:</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Check <strong className="text-foreground">mastered goals</strong>.</li>
          <li>Highlight <strong className="text-foreground">"Areas for Improvement"</strong> — this feeds the student's AI for their next daily lesson.</li>
          <li><strong className="text-foreground">Submit.</strong> This triggers the student's "XP Gain" and updates their dashboard.</li>
        </ol>
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    title: '5. Cancellation & Attendance',
    content: (
      <ul className="space-y-2 text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span><strong className="text-foreground">24-Hour Rule:</strong> If a student cancels with more than 24 hours' notice, the slot becomes available again.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-warning shrink-0" />
          <span><strong className="text-foreground">Late Cancellations:</strong> If they cancel within 24 hours or don't show up, you still get paid for that slot. Please remain in the classroom for at least <strong>10 minutes</strong> before marking a "No-Show."</span>
        </li>
      </ul>
    ),
  },
  {
    icon: Lightbulb,
    title: '6. Tips for Success',
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-border bg-muted/40">
          <CardContent className="p-4">
            <p className="font-semibold text-foreground">🎓 Academy (Teens)</p>
            <p className="text-sm text-muted-foreground">Use the "Daily Feed" topics. They like to talk about trends and creators.</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-muted/40">
          <CardContent className="p-4">
            <p className="font-semibold text-foreground">💼 Professional (Adults)</p>
            <p className="text-sm text-muted-foreground">Focus on ROI. Use the "Skill Radar" to show them exactly where they are improving.</p>
          </CardContent>
        </Card>
      </div>
    ),
  },
];

export const TeacherGuideTab: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📘 Teacher Onboarding Guide</h1>
        <p className="text-muted-foreground mt-1">Everything you need to know to deliver outstanding lessons on Engleuphoria.</p>
      </div>

      <Separator />

      {sections.map((section, idx) => {
        const Icon = section.icon;
        return (
          <Card key={idx} className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="w-5 h-5 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>{section.content}</CardContent>
          </Card>
        );
      })}

      <Separator />

      <div className="flex justify-center pb-8">
        <Button asChild size="lg" className="gap-2">
          <a href="mailto:f.zahra.djaanine@engleuphoria.com?subject=Teacher%20Support%20Request">
            <Mail className="w-4 h-4" />
            Contact Admin
          </a>
        </Button>
      </div>
    </div>
  );
};
