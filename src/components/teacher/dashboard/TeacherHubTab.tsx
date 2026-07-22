import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Users,
  Clock,
  Shield,
  Heart,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Star,
  Palette,
  BookOpen,
  Handshake,
  RotateCcw,
} from 'lucide-react';
import pipImg from '@/assets/characters/pip-fox.jpg';
import leoImg from '@/assets/characters/leo-teen.jpg';
import elenaImg from '@/assets/characters/elena-professional.jpg';

type HubKey = 'playground' | 'academy' | 'success';

const GOLDEN_RULES: { id: string; title: string; body: string }[] = [
  { id: 'bravery', title: 'Bravery over correctness', body: 'Reward every attempt to speak. Correction comes later — never in the middle of a fluency task.' },
  { id: 'elicit', title: 'Elicit before you explain', body: 'Always ask before telling. Learners remember what they discover, not what they are told.' },
  { id: 'stt', title: 'Maximize student talking time', body: 'Target ≥65% STT in Academy/Success, ≥50% in Playground. If you are talking, they are not learning.' },
  { id: 'english', title: 'Stay in English', body: 'Use gestures, images, and simplification before translation. Translation is a last resort, not a shortcut.' },
  { id: 'punctual', title: 'Punctuality is respect', body: 'Enter the classroom 3 minutes early. Never leave a student waiting.' },
  { id: 'presence', title: 'One learner, full presence', body: 'No multitasking, no phone, no distractions. Camera on, smile on.' },
];

const STORAGE_KEY = 'engleuphoria.teacherHub.rulesChecklist.v1';

const loadState = (): Record<HubKey, string[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { playground: [], academy: [], success: [] };
    const parsed = JSON.parse(raw);
    return {
      playground: parsed.playground ?? [],
      academy: parsed.academy ?? [],
      success: parsed.success ?? [],
    };
  } catch {
    return { playground: [], academy: [], success: [] };
  }
};

export const TeacherHubTab = () => {
  const [checked, setChecked] = useState<Record<HubKey, string[]>>(loadState);
  const [activeHub, setActiveHub] = useState<HubKey>('playground');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch { /* noop */ }
  }, [checked]);

  const toggle = (hub: HubKey, id: string) => {
    setChecked((prev) => {
      const list = prev[hub];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [hub]: next };
    });
  };

  const resetHub = (hub: HubKey) => setChecked((prev) => ({ ...prev, [hub]: [] }));

  const completion = useMemo(() => ({
    playground: Math.round((checked.playground.length / GOLDEN_RULES.length) * 100),
    academy: Math.round((checked.academy.length / GOLDEN_RULES.length) * 100),
    success: Math.round((checked.success.length / GOLDEN_RULES.length) * 100),
  }), [checked]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome */}
      <header className="text-center space-y-3">
        <Badge variant="secondary" className="uppercase tracking-wider">Teacher Hub</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome to Engleuphoria</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about our three hubs, our cast of characters,
          and the golden rules that make every lesson feel like Engleuphoria.
        </p>
      </header>

      {/* Three Hubs */}
      <Card>
        <CardHeader>
          <CardTitle>The Three Hubs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Each hub is a different world with its own audience, tone, and rhythm.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HubCard icon={<Sparkles className="h-5 w-5" />} color="orange" name="Playground"
            audience="Ages 4–9" duration="30-minute sessions" cefr="Pre-A1 → B1"
            vibe="Magical, playful, story-driven. Songs, movement, phonics, and lots of laughter." />
          <HubCard icon={<GraduationCap className="h-5 w-5" />} color="purple" name="Academy"
            audience="Ages 10–17" duration="60-minute sessions" cefr="Pre-A1 → C1"
            vibe="Modern, identity-aware, culturally relevant. Balances fluency with exam readiness." />
          <HubCard icon={<Briefcase className="h-5 w-5" />} color="emerald" name="Success"
            audience="Adults 18+" duration="60-minute sessions" cefr="Pre-A1 → C1"
            vibe="Premium, professional, confidence-first. Workplace fluency and lexical precision." />
        </CardContent>
      </Card>

      {/* Characters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Meet the Main Cast</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Every hub has a signature protagonist. Weave them into your lessons — students bond with them fast.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CharacterCard image={pipImg} name="Pip the Fox" hub="Playground"
            traits="Curious · Brave · Kind-hearted"
            bio="A small bright-orange fox with a green explorer backpack. Loves discovering new words and turning every lesson into a tiny adventure." />
          <CharacterCard image={leoImg} name="Leo" hub="Academy"
            traits="Creative · Witty · A little nerdy"
            bio="A 14-year-old teen who loves music, sci-fi, and skateboarding. Speaks in modern, natural English with gentle humor." />
          <CharacterCard image={elenaImg} name="Elena" hub="Success"
            traits="Confident · Articulate · Goal-oriented"
            bio="A young professional in her late 20s. Polished business English with a warm, approachable tone. Perfect for meetings and negotiation." />
        </CardContent>
        <CardContent className="pt-0">
          <div className="rounded-xl border border-dashed p-4 bg-muted/30 text-sm text-muted-foreground">
            <strong className="text-foreground">Plus a whole extended cast.</strong> Every hub has supporting
            characters — Pip's forest friends, Leo's classmates and bandmates, Elena's colleagues and clients —
            plus a growing <em>Cast Vault</em> where you and your students can pick or design their own protagonist
            for any lesson. Open the Cast Vault from the lesson creator to browse them all.
          </div>
        </CardContent>
      </Card>

      {/* Golden Rules Checklist */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <CardTitle>Golden Rules Checklist</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => resetHub(activeHub)}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset this hub
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Review and tick each rule for the hub you teach. Progress is saved on this device.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Hub selector */}
          <div className="flex flex-wrap gap-2">
            {(['playground', 'academy', 'success'] as HubKey[]).map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => setActiveHub(hub)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  activeHub === hub
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                {hub} · {completion[hub]}%
              </button>
            ))}
          </div>

          {/* Per-hub progress bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {(['playground', 'academy', 'success'] as HubKey[]).map((hub) => (
              <div key={hub} className="space-y-1">
                <div className="flex justify-between capitalize">
                  <span className="text-muted-foreground">{hub}</span>
                  <span className="font-semibold">{checked[hub].length}/{GOLDEN_RULES.length}</span>
                </div>
                <Progress value={completion[hub]} className="h-1.5" />
              </div>
            ))}
          </div>

          <Separator />

          {/* Rules for active hub */}
          <div className="space-y-3">
            {GOLDEN_RULES.map((rule, i) => {
              const id = `rule-${activeHub}-${rule.id}`;
              const isChecked = checked[activeHub].includes(rule.id);
              return (
                <label
                  key={rule.id}
                  htmlFor={id}
                  className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isChecked ? 'bg-primary/10 border-primary/40' : 'bg-background hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    id={id}
                    checked={isChecked}
                    onCheckedChange={() => toggle(activeHub, rule.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${isChecked ? 'text-primary' : ''}`}>
                      {i + 1}. {rule.title}
                    </div>
                    <div className="text-muted-foreground text-xs mt-0.5">{rule.body}</div>
                  </div>
                </label>
              );
            })}
          </div>

          {completion[activeHub] === 100 && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4" />
              You've reviewed every Golden Rule for <span className="capitalize font-semibold">{activeHub}</span>. Nicely done.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classroom Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">Do</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Tip>Warm up with a smile and a genuine question — never dive straight into slides.</Tip>
            <Tip>Use the character's name ("What would Pip say here?") to spark engagement.</Tip>
            <Tip>Model target language twice, then hand the mic to the learner.</Tip>
            <Tip>Celebrate small wins loudly. Confidence is a skill you teach.</Tip>
            <Tip>End every lesson with a preview: "Next time we're going to…"</Tip>
            <Tip>Log observations in the Mistake Repository — it powers reinforcement lessons.</Tip>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Don't</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Tip>Don't correct every mistake — pick the one that matters most.</Tip>
            <Tip>Don't fill silence. Wait 5 seconds. Then wait 5 more.</Tip>
            <Tip>Don't skip the Warm-Up, even when running late — it sets the emotional tone.</Tip>
            <Tip>Don't use childish framing in Success, or corporate language in Playground.</Tip>
            <Tip>Don't cancel with less than 120 hours notice — the 5-Day Rule protects everyone.</Tip>
            <Tip>Don't share personal contact details or move lessons off-platform.</Tip>
          </CardContent>
        </Card>
      </div>

      {/* Hub-Specific Tips */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Hub-Specific Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <HubTips color="text-orange-600" name="Playground" tips={[
            'Use your voice as an instrument — big, animated, sing-song.',
            'Movement every 4–5 minutes. Little bodies need to wiggle.',
            'Keep grammar implicit. Never say "auxiliary verb" to a 6-year-old.',
            'Praise process, not talent. "You worked so hard on that!"',
          ]} />
          <Separator />
          <HubTips color="text-purple-600" name="Academy" tips={[
            'Respect their identity. Ask about their world, then bring English into it.',
            'Real topics: music, gaming, social media, friendships, dreams.',
            'Balance fun and rigor — teens smell condescension a mile away.',
            'At B2+ push argumentation, opinion, and academic register.',
          ]} />
          <Separator />
          <HubTips color="text-emerald-600" name="Success" tips={[
            'Adult register from lesson one — no cartoons, no baby-talk.',
            'Anchor lessons to their real goals: interview, presentation, email.',
            'Respect their expertise. They are a professional learning a language, not a beginner at life.',
            'Use case studies and role-plays from their actual industry when possible.',
          ]} />
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Business Rules You Must Know</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <RuleCard icon={<Clock className="h-4 w-4" />} title="The 5-Day Rule"
            body="Cancel or reschedule at least 120 hours before the session. Inside that window, the credit is forfeited." />
          <RuleCard icon={<Users className="h-4 w-4" />} title="Role Separation"
            body="Playground Specialists teach only Playground. Mentors teach Academy and Success. Never cross without approval." />
          <RuleCard icon={<Handshake className="h-4 w-4" />} title="Platform Integrity"
            body="All communication and payment stays on Engleuphoria. Off-platform arrangements are grounds for removal." />
          <RuleCard icon={<Heart className="h-4 w-4" />} title="Safeguarding"
            body="Under-18 sessions require camera on for both parties, and a parent reachable. Report any concern immediately." />
          <RuleCard icon={<MessageCircle className="h-4 w-4" />} title="Feedback Loop"
            body="Submit lesson feedback within 24 hours. It feeds the student's Linguistic Diagnostic Report." />
          <RuleCard icon={<Star className="h-4 w-4" />} title="Your KPI Matters"
            body="Quality 25% · Retention 15% · Attendance 15% · Progress 15% · Feedback 10% · Curriculum 10% · Response 10%." />
        </CardContent>
      </Card>

      {/* Closing */}
      <Card className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-emerald-500/10 border-primary/20">
        <CardContent className="pt-6 text-center space-y-2">
          <div className="text-2xl">🌟</div>
          <p className="text-lg font-semibold">You are the heart of Engleuphoria.</p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            The materials open the door. You walk the student through it. Bring warmth,
            curiosity, and belief — the rest is craft you can learn.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// ---- Sub-components ----

const HubCard = ({ icon, color, name, audience, duration, cefr, vibe }: {
  icon: React.ReactNode; color: 'orange' | 'purple' | 'emerald';
  name: string; audience: string; duration: string; cefr: string; vibe: string;
}) => {
  const colorMap = {
    orange: 'border-orange-200 text-orange-600 bg-orange-50/50',
    purple: 'border-purple-200 text-purple-600 bg-purple-50/50',
    emerald: 'border-emerald-200 text-emerald-600 bg-emerald-50/50',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 font-semibold text-foreground">{icon}{name}</div>
      <div className="text-xs mt-2 space-y-0.5 text-muted-foreground">
        <div>{audience}</div>
        <div>{duration}</div>
        <div>CEFR {cefr}</div>
      </div>
      <p className="text-sm text-foreground/80 mt-3">{vibe}</p>
    </div>
  );
};

const CharacterCard = ({ image, name, hub, traits, bio }: {
  image: string; name: string; hub: string; traits: string; bio: string;
}) => (
  <div className="rounded-xl border bg-card overflow-hidden">
    <div className="aspect-square bg-muted overflow-hidden">
      <img
        src={image}
        alt={`${name}, ${hub} hub character`}
        loading="lazy"
        width={1024}
        height={1024}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-4">
      <div className="font-semibold">{name}</div>
      <div className="text-xs text-muted-foreground">{hub}</div>
      <div className="text-xs text-primary mt-1">{traits}</div>
      <p className="text-sm text-muted-foreground mt-3">{bio}</p>
    </div>
  </div>
);

const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-2">
    <span className="text-primary flex-shrink-0">•</span>
    <span>{children}</span>
  </div>
);

const HubTips = ({ color, name, tips }: { color: string; name: string; tips: string[] }) => (
  <div>
    <div className={`font-semibold ${color}`}>{name}</div>
    <ul className="mt-2 space-y-1 text-muted-foreground">
      {tips.map((t) => <li key={t} className="flex gap-2"><span>•</span><span>{t}</span></li>)}
    </ul>
  </div>
);

const RuleCard = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
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

export default TeacherHubTab;
