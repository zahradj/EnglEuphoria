import { useMemo, useState } from "react";
import { Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getPinnedGolden,
  pinGolden,
  unpinGolden,
} from "@/qa/data/pinnedGoldens";
import type { Cefr, GoldenLesson, Hub } from "@/qa/data/goldenLessons";

interface Props {
  hub: Hub;
  cefr?: string | null;
  title: string;
  objective?: string;
  pages: Array<{ type?: string; kind?: string; activity_type?: string; phase?: string; title?: string }>;
}

const norm = (c?: string | null): Cefr =>
  ((c || "a1").toLowerCase().replace("pre_a1", "pre-a1") as Cefr);

export default function PinGoldenButton({ hub, cefr, title, objective, pages }: Props) {
  const c = norm(cefr);
  const [pinned, setPinned] = useState<GoldenLesson | null>(() => getPinnedGolden(c, hub));

  const golden: GoldenLesson = useMemo(
    () => ({
      id: `pinned-${hub}-${c}-${Date.now()}`,
      cefr: c,
      hub,
      title: title || `Lesson (${hub}/${c})`,
      objective: objective || "User-pinned exemplar.",
      beats: pages.slice(0, 16).map((p, i) => ({
        slide: i + 1,
        phase: String(p.phase ?? "slide"),
        activity: String(p.type ?? p.kind ?? p.activity_type ?? "slide"),
        note: (p.title ?? "").slice(0, 60),
      })),
    }),
    [hub, c, title, objective, pages],
  );

  return (
    <div className="flex items-center gap-2 text-xs">
      {pinned ? (
        <>
          <span className="text-emerald-700">📌 Pinned as golden for {hub}/{c}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              unpinGolden(c, hub);
              setPinned(null);
              toast.success("Unpinned golden lesson");
            }}
          >
            <PinOff className="h-3 w-3 mr-1" /> Unpin
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            pinGolden(golden);
            setPinned(golden);
            toast.success(`Pinned as golden for ${hub}/${c.toUpperCase()}`, {
              description: "Future generations will use this lesson as a few-shot anchor.",
            });
          }}
        >
          <Pin className="h-3 w-3 mr-1" /> Pin as Golden
        </Button>
      )}
    </div>
  );
}
