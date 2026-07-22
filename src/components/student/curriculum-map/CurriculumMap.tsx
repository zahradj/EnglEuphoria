import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, CheckCircle2, Trophy, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurriculumMap, type MapLesson, type MapUnit } from './useCurriculumMap';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * CurriculumMap
 * Linear unit rows of 5 lesson nodes. Lesson 5 of each unit is the Assessment.
 * When a student fails the assessment (<80%), a "Bonus Quest" island mounts
 * to the side of L5 with an SVG branch path. Passing the retake collapses
 * the island into a Mastered! badge and unlocks the next unit.
 *
 * Flat 2.0 styling — semantic tokens only, no 3D, no hex.
 */
export function CurriculumMap() {
  const { units, isLoading } = useCurriculumMap();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!units.length) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        Your curriculum map is being prepared. Check back soon.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {units.map((unit, idx) => (
        <UnitRow key={unit.id} unit={unit} index={idx} />
      ))}
    </div>
  );
}

function UnitRow({ unit, index }: { unit: MapUnit; index: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative"
      aria-label={`Unit ${unit.unit_number}: ${unit.title}`}
    >
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
              unit.locked
                ? 'bg-muted text-muted-foreground'
                : unit.cleared
                  ? 'bg-primary/15 text-primary'
                  : 'bg-primary text-primary-foreground'
            }`}
          >
            {unit.unit_number}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              {unit.title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {unit.locked
                ? 'Locked — finish the previous unit first'
                : unit.bonusQuest
                  ? 'Bonus Quest active — finish it to unlock the next unit'
                  : unit.cleared
                    ? 'Mastered'
                    : 'In progress'}
            </p>
          </div>
        </div>
        {unit.locked && <Lock className="h-5 w-5 text-muted-foreground" aria-hidden />}
        {unit.cleared && !unit.bonusQuest && (
          <Trophy className="h-5 w-5 text-primary" aria-hidden />
        )}
      </header>

      <UnitTrunk unit={unit} />
    </motion.section>
  );
}

function UnitTrunk({ unit }: { unit: MapUnit }) {
  const navigate = useNavigate();
  const nodes = unit.lessons;
  // Reserve space for the bonus island on the right when present.
  const hasBonus = !!unit.bonusQuest;

  // SVG branch geometry (positions are responsive via percentages).
  const branchPath = useMemo(() => {
    // Path from the assessment node (right edge of trunk) to the island.
    // Quadratic curve down-right.
    return 'M 0 16 Q 40 16 60 56';
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {nodes.map((lesson, i) => (
          <div key={lesson.id} className="flex items-center gap-3">
            <Node
              lesson={lesson}
              disabled={unit.locked || lesson.status === 'locked'}
              onClick={() =>
                !unit.locked && navigate(`/lesson/${lesson.id}`)
              }
            />
            {i < nodes.length - 1 && (
              <div
                className={`h-0.5 w-8 rounded-full ${
                  unit.locked ? 'bg-muted' : 'bg-primary/30'
                }`}
                aria-hidden
              />
            )}
          </div>
        ))}

        <AnimatePresence>
          {hasBonus && (
            <motion.div
              key="bonus-wrap"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.4 }}
              className="relative ml-2 flex items-center"
            >
              <svg
                width="60"
                height="72"
                viewBox="0 0 60 72"
                aria-hidden
                className="overflow-visible"
              >
                <motion.path
                  d={branchPath}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </svg>
              <BonusQuestIsland unit={unit} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Node({
  lesson,
  disabled,
  onClick,
}: {
  lesson: MapLesson;
  disabled: boolean;
  onClick: () => void;
}) {
  const isAssessment = lesson.is_assessment;
  const completed = lesson.status === 'completed';
  const mastered = lesson.mastered;
  const failed = isAssessment && completed && (lesson.score ?? 0) < 80;

  const baseClasses =
    'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  const state = disabled
    ? 'border-border bg-muted text-muted-foreground cursor-not-allowed'
    : mastered
      ? 'border-primary bg-primary/15 text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]'
      : failed
        ? 'border-destructive bg-destructive/10 text-destructive'
        : completed
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-primary/40 bg-card text-foreground hover:border-primary hover:bg-primary/5';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${state}`}
      aria-label={`Lesson ${lesson.lesson_number}: ${lesson.title}${
        isAssessment ? ' (Assessment)' : ''
      }`}
    >
      {disabled ? (
        <Lock className="h-4 w-4" />
      ) : mastered ? (
        <Trophy className="h-5 w-5" />
      ) : completed ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : isAssessment ? (
        <Target className="h-5 w-5" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      <span className="absolute -bottom-5 text-[10px] font-medium text-muted-foreground">
        {isAssessment ? 'Test' : `L${lesson.lesson_number}`}
      </span>
    </button>
  );
}

function BonusQuestIsland({ unit }: { unit: MapUnit }) {
  const navigate = useNavigate();
  const quest = unit.bonusQuest!;
  return (
    <motion.button
      type="button"
      onClick={() => navigate(quest.route)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      animate={{ y: [0, -3, 0] }}
      transition={{ y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
      className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-accent bg-accent/10 px-4 py-3 text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label="Bonus Quest — extra practice to retake the assessment"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-bold text-foreground">{quest.label}</span>
        <span className="text-[11px] text-muted-foreground">
          Extra practice · tap to begin
        </span>
      </span>
    </motion.button>
  );
}

export function CurriculumMapHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Your Curriculum Map
        </h1>
        <p className="text-sm text-muted-foreground">
          Five lessons per unit · score 80% on the assessment to unlock the next unit.
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <a href="/dashboard/my-path">My Path</a>
      </Button>
    </div>
  );
}
