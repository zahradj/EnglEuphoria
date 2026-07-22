import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatSkillTag } from '@/lib/remediation/formatSkillTag';
import { pickGritSticker } from '@/lib/remediation/gritStickers';
import { triggerCelebration } from '@/services/celebration';

export type GritHub = 'playground' | 'academy' | 'professional';
export type GritVariant = 'unit' | 'micro';

interface GritRewardModalProps {
  open: boolean;
  hub: GritHub;
  failedTag?: string | null;
  variant: GritVariant;
  /** Optional ref id (lesson id / remedial id) — sent with the XP event. */
  refId?: string;
  onClose: () => void;
}

/**
 * Cycle 3 — Grit Reward Engine modal.
 *
 * Mounts on success of a remedial lesson (unit) or in-lesson Confidence
 * Builder block (micro). Branches on hub to deliver a hub-native celebration
 * and writes the matching persistent reward (sticker / badge) — server-side
 * XP is doubled via the `award-xp` edge function's `is_remedial` flag.
 */
export default function GritRewardModal({
  open,
  hub,
  failedTag,
  variant,
  refId,
  onClose,
}: GritRewardModalProps) {
  const { user } = useAuth();
  const fired = useRef(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      fired.current = false;
      setXpAwarded(null);
      return;
    }
    if (fired.current) return;
    fired.current = true;

    // Celebrate visually immediately.
    triggerCelebration?.(hub);

    void (async () => {
      const studentId = user?.id;

      // 1) Doubled XP — server enforces the multiplier.
      try {
        const { data } = await supabase.functions.invoke('award-xp', {
          body: {
            action: variant === 'unit' ? 'lesson_complete' : 'mission_complete',
            ref_id: refId,
            is_remedial: true,
          },
        });
        if (data && typeof data === 'object' && 'xp_awarded' in data) {
          setXpAwarded((data as { xp_awarded: number }).xp_awarded ?? null);
        }
      } catch (e) {
        console.warn('[GritReward] award-xp failed', (e as Error).message);
      }

      if (!studentId) return;

      // 2) Hub-specific persistent reward.
      if (hub === 'playground') {
        const sticker = pickGritSticker(failedTag);
        try {
          await supabase.from('student_inventory').insert({
            student_id: studentId,
            item_type: 'sticker',
            item_id: sticker.id,
            source: 'grit_reward',
          } as never);
        } catch (e) {
          console.warn('[GritReward] sticker insert skipped', (e as Error).message);
        }
      } else if (hub === 'academy') {
        try {
          await supabase
            .from('student_badges')
            .insert({
              student_id: studentId,
              badge_name: 'Comeback Grit',
              badge_description: 'Bounced back from a tough quiz — double XP earned.',
              badge_icon: 'trophy',
            } as never);
        } catch (e) {
          // Unique index swallows duplicates — that's expected.
          console.debug('[GritReward] badge already earned');
        }
      }
      // Professional: no persistent reward — the named-skill notification is the reward.
    })();
  }, [open, hub, failedTag, variant, refId, user?.id]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-label="Grit reward"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border-2 border-success/40 bg-card text-card-foreground p-8 shadow-2xl"
            initial={{ scale: 0.6, opacity: 0, rotate: hub === 'playground' ? -6 : 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: 0,
              transition: hub === 'playground'
                ? { type: 'spring', stiffness: 220, damping: 12 }
                : { type: 'spring', stiffness: 280, damping: 22 },
            }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>

            {hub === 'playground' && <PlaygroundBody failedTag={failedTag} xpAwarded={xpAwarded} onClose={onClose} />}
            {hub === 'academy' && <AcademyBody xpAwarded={xpAwarded} onClose={onClose} />}
            {hub === 'professional' && <ProfessionalBody failedTag={failedTag} xpAwarded={xpAwarded} onClose={onClose} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───── Hub variants ───── */

function PlaygroundBody({
  failedTag,
  xpAwarded,
  onClose,
}: {
  failedTag?: string | null;
  xpAwarded: number | null;
  onClose: () => void;
}) {
  const sticker = pickGritSticker(failedTag);
  return (
    <div className="text-center flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 10, delay: 0.1 } }}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-success/20 to-success/40 flex items-center justify-center border-4 border-success shadow-[0_8px_0_hsl(var(--success)/0.4)]"
      >
        <span className="text-7xl" aria-hidden>{sticker.emoji}</span>
        <Sparkles className="absolute -top-2 -right-2 text-success animate-pulse" size={28} />
      </motion.div>
      <h2 className="text-2xl font-extrabold text-success">Sticker Unlocked!</h2>
      <p className="text-base font-semibold text-foreground">{sticker.name}</p>
      <p className="text-sm text-muted-foreground italic">"{sticker.tagline}"</p>
      {xpAwarded != null && (
        <p className="text-sm font-bold text-success">+{xpAwarded} XP · Grit Bonus 2×</p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full rounded-2xl bg-success text-success-foreground font-bold py-3 hover:opacity-90 transition-opacity"
      >
        Keep going! 🎉
      </button>
    </div>
  );
}

function AcademyBody({ xpAwarded, onClose }: { xpAwarded: number | null; onClose: () => void }) {
  const [displayXp, setDisplayXp] = useState(0);
  useEffect(() => {
    if (xpAwarded == null) return;
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setDisplayXp(Math.round(xpAwarded * (0.5 + 0.5 * Math.sin((t - 0.5) * Math.PI))));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplayXp(xpAwarded);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [xpAwarded]);

  return (
    <div className="text-center flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { delay: 0.1, type: 'spring' } }}
        className="w-24 h-24 rounded-2xl bg-gradient-to-br from-success/30 to-success/60 flex items-center justify-center border-2 border-success"
      >
        <Trophy size={48} className="text-success-foreground" />
      </motion.div>
      <h2 className="text-2xl font-extrabold text-success">Double XP Bonus!</h2>
      <p className="text-sm text-muted-foreground">You earned the</p>
      <p className="text-lg font-bold text-foreground">"Comeback Grit" badge</p>
      {xpAwarded != null && (
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-black text-success tabular-nums">+{displayXp}</span>
          <span className="text-sm font-semibold text-success/80">XP · 2× Grit</span>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-xl bg-success text-success-foreground font-bold py-3 hover:opacity-90 transition-opacity"
      >
        Claim & Continue
      </button>
    </div>
  );
}

function ProfessionalBody({
  failedTag,
  xpAwarded,
  onClose,
}: {
  failedTag?: string | null;
  xpAwarded: number | null;
  onClose: () => void;
}) {
  const skill = formatSkillTag(failedTag);
  return (
    <div className="text-left flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="text-success" size={22} />
        <h2 className="text-lg font-semibold text-foreground">Mastery Unlocked</h2>
      </div>
      <p className="text-sm text-muted-foreground">You just conquered:</p>
      <p className="text-xl font-bold text-success">{skill}</p>
      {xpAwarded != null && (
        <p className="text-xs text-muted-foreground">
          +{xpAwarded} XP awarded · Grit multiplier 2× applied
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-2 self-end rounded-lg bg-success text-success-foreground font-semibold px-5 py-2 text-sm hover:opacity-90 transition-opacity"
      >
        Continue
      </button>
    </div>
  );
}
