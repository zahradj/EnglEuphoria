import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye, Sun, VolumeX, Shirt, Home, Clapperboard, Clock, CheckCircle2
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ScriptSegment {
  time: string;
  label: string;
  text: string;
}

const YOUTUBE_STEPS = [
  'Record a clear 1–3 minute introduction video.',
  'Upload the video to your YouTube channel.',
  'Set visibility to Private and share access with reviewers, or switch to Unlisted if private preview is blocked.',
  'Copy the YouTube link and paste it into your Engleuphoria profile.',
];

const INTRO_VIDEO_SUCCESS_TIPS = [
  'Start with your name, teaching style, and who you teach best.',
  'Keep your camera stable, your face well-lit, and your audio clean.',
  'Speak slowly, smile, and show the same energy students will feel in class.',
  'Mention your experience, specialties, and what students will gain from learning with you.',
];

const PROFESSIONAL_SCRIPT: ScriptSegment[] = [
  {
    time: '0:00–0:10',
    label: 'The Hook',
    text: '"Hello! Are you looking to bridge the gap between your technical expertise and your English fluency? I\'m [Name]."',
  },
  {
    time: '0:10–0:30',
    label: 'The Value',
    text: '"I specialize in Business English—from mastering high-stakes negotiations to refining your executive presence in international meetings. My goal is to make sure you never miss a career opportunity because of a language barrier."',
  },
  {
    time: '0:30–0:50',
    label: 'The Method',
    text: '"In our 55-minute sessions, we don\'t just study grammar; we simulate real-world scenarios using Engleuphoria\'s AI-driven insights."',
  },
  {
    time: '0:50–1:00',
    label: 'The Call to Action',
    text: '"Check my schedule below, and let\'s start accelerating your career today."',
  },
];

const KIDS_SCRIPT: ScriptSegment[] = [
  {
    time: '0:00–0:10',
    label: 'Energy',
    text: '"Hi there! I\'m [Name], and welcome to Engleuphoria!"',
  },
  {
    time: '0:10–0:30',
    label: 'Engagement',
    text: '"I love making English feel like an adventure. Whether we are exploring the \'Animal Kingdom\' or translating the latest viral trends, you\'ll be speaking and laughing from minute one."',
  },
  {
    time: '0:30–0:50',
    label: 'The Promise',
    text: '"I use games and interactive stories to help you level up your skills and earn those stars!"',
  },
  {
    time: '0:50–1:00',
    label: 'CTA',
    text: '"I can\'t wait to meet you in the classroom. Book your free trial and let the quest begin!"',
  },
];

interface FilmingTip {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FILMING_TIPS: FilmingTip[] = [
  {
    icon: Eye,
    title: 'Eye Contact is King',
    description:
      'Look directly into the camera lens, not at your own image on the screen. This creates a psychological connection with the student watching your video.',
  },
  {
    icon: Sun,
    title: 'Lighting (The 3-Point Rule)',
    description:
      'Avoid having a window behind you—you will look like a shadow. Face the window or use a ring light so your face is clear and bright.',
  },
  {
    icon: VolumeX,
    title: 'The "Silent" Background',
    description:
      'Ensure there is no fan noise, traffic, or echo. If the audio is bad, the student will assume the lesson quality is also bad.',
  },
  {
    icon: Shirt,
    title: 'Dress for the Price',
    description:
      'Professional Track: business casual (collared shirt/blazer). Playground Track: bright colors and a friendly, high-energy smile.',
  },
  {
    icon: Home,
    title: 'The "Engleuphoria" Background',
    description:
      'If possible, have a clean, uncluttered workspace. A small plant or a bookshelf works perfectly.',
  },
];

interface VideoInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelfReviewComplete: (checked: boolean) => void;
  initialTrack?: 'professional' | 'kids';
}

export const VideoInstructionsModal: React.FC<VideoInstructionsModalProps> = ({
  open,
  onOpenChange,
  onSelfReviewComplete,
  initialTrack = 'professional',
}) => {
  const [checklist, setChecklist] = useState({ audio: false, lighting: false, script: false });

  const allChecked = checklist.audio && checklist.lighting && checklist.script;

  const toggleCheck = (key: keyof typeof checklist) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    onSelfReviewComplete(next.audio && next.lighting && next.script);
  };

  const handleReady = () => {
    onOpenChange(false);
  };

  const renderScript = (segments: ScriptSegment[]) => (
    <div className="space-y-4 mt-2">
      {segments.map((seg, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <Badge variant="outline" className="text-xs whitespace-nowrap font-mono">
              <Clock className="h-3 w-3 mr-1" />
              {seg.time}
            </Badge>
            {i < segments.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1" />
            )}
          </div>
          <div className="pb-3">
            <p className="text-sm font-semibold text-foreground">{seg.label}</p>
            <p className="text-sm text-muted-foreground italic leading-relaxed">{seg.text}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clapperboard className="h-5 w-5 text-primary" />
            Teacher Success Guide
          </DialogTitle>
          <DialogDescription>
            Follow these YouTube upload steps, script ideas, and filming tips to create a strong introduction video for review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            📺 How to upload your video on YouTube
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {YOUTUBE_STEPS.map((step) => (
              <p key={step}>{step}</p>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            🎯 What makes a successful introduction video
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {INTRO_VIDEO_SUCCESS_TIPS.map((tip) => (
              <p key={tip}>{tip}</p>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            🎬 The "60-Second Mastery" Script
          </h3>
          <Tabs defaultValue={initialTrack}>
            <TabsList className="w-full">
              <TabsTrigger value="professional" className="flex-1">Professional / Executive</TabsTrigger>
              <TabsTrigger value="kids" className="flex-1">Playground / Academy</TabsTrigger>
            </TabsList>
            <TabsContent value="professional">
              {renderScript(PROFESSIONAL_SCRIPT)}
            </TabsContent>
            <TabsContent value="kids">
              {renderScript(KIDS_SCRIPT)}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            📸 Professional Photo Requirements
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Use a <strong className="text-foreground">plain white background</strong> — no patterns, no clutter.</p>
            <p>• Wear <strong className="text-foreground">professional attire</strong> (business casual or smart casual).</p>
            <p>• Ensure your face is <strong className="text-foreground">well-lit and clearly visible</strong> — natural daylight or a ring light works best.</p>
            <p>• Frame from the chest up, centered, with a friendly and confident expression.</p>
            <p>• Use a high-resolution image (minimum 400×400 px). No filters or heavy editing.</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            💡 Top 5 Filming Tips
          </h3>
          <Accordion type="multiple" className="w-full">
            {FILMING_TIPS.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <AccordionItem key={i} value={`tip-${i}`}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {tip.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {tip.description}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            ✅ Self-Review Checklist
          </h3>
          {([
            { key: 'audio' as const, label: 'I have checked my audio quality.' },
            { key: 'lighting' as const, label: 'My face is clearly lit.' },
            { key: 'script' as const, label: 'I followed the Engleuphoria script structure.' },
          ]).map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Checkbox
                checked={checklist[item.key]}
                onCheckedChange={() => toggleCheck(item.key)}
              />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleReady} disabled={!allChecked} className="w-full sm:w-auto">
            {allChecked ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I'm Ready
              </>
            ) : (
              'Complete checklist above'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
