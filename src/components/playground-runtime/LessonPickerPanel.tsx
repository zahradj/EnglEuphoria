import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadSampleLesson } from '@/game-runtime';
import type { LessonJSON } from '@/game-runtime';

interface Props {
  onPick: (lesson: LessonJSON) => void;
}

export function LessonPickerPanel({ onPick }: Props) {
  const sample = loadSampleLesson();
  const items: LessonJSON[] = [sample];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Lessons
      </h3>
      {items.map((lesson) => (
        <Card key={lesson.id} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-foreground">{lesson.title}</div>
              <div className="text-xs text-muted-foreground">
                {lesson.hub} · {lesson.cefr} ·{' '}
                {lesson.moments?.reduce((n, m) => n + m.blocks.length, 0) ?? lesson.blocks?.length ?? 0}{' '}
                blocks
              </div>
            </div>
            <Button size="sm" onClick={() => onPick(lesson)}>Launch</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
