import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { ChildCard, type ChildCardData } from "./ChildCard";
import { ParentLessonFeedbackCard } from "./ParentLessonFeedbackCard";

interface ParentStudentListProps {
  children: ChildCardData[];
  onViewProgress: (studentId: string) => void;
  /** "Add a child" trigger shown in the empty state. */
  addChildAction?: ReactNode;
}

export function ParentStudentList({ children: kids, onViewProgress, addChildAction }: ParentStudentListProps) {
  const { t } = useTranslation();

  if (kids.length === 0) {
    return (
      <div className="fd-surface fd-empty">
        <span
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--fd-track)", color: "var(--fd-ink-soft)" }}
          aria-hidden
        >
          <Users className="h-8 w-8" />
        </span>
        <h2 className="text-xl font-bold">{t("pd.students.empty.title")}</h2>
        <p className="mx-auto mt-1 max-w-sm" style={{ color: "var(--fd-ink-soft)" }}>
          {t("pd.empty.invite")}
        </p>
        {addChildAction && <div className="mt-5 flex justify-center">{addChildAction}</div>}
      </div>
    );
  }

  return (
    <div className="grid gap-x-5 gap-y-8 pt-1 md:grid-cols-2 xl:grid-cols-3">
      {kids.map((child) => (
        <div key={child.studentId} className="flex flex-col gap-3">
          <ChildCard child={child} onViewProgress={onViewProgress} />
          <ParentLessonFeedbackCard studentId={child.studentId} studentName={child.name} />
        </div>
      ))}
    </div>
  );
}
