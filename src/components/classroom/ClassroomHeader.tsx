
import { useLanguage } from "@/contexts/LanguageContext";

interface ClassroomHeaderProps {
  title: string;
  teacher: string;
  time: string;
}

export function ClassroomHeader({ title, teacher, time }: ClassroomHeaderProps) {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-[hsl(var(--classroom-primary))] via-[hsl(var(--classroom-secondary))] to-[hsl(var(--classroom-accent))] rounded-2xl border border-classroom-border shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-2">
        {title}
      </h1>
      <div className="flex items-center gap-3 text-white/90">
        <span className="px-3 py-1 bg-white/20 rounded-full text-white font-medium text-sm backdrop-blur-sm">
          {teacher}
        </span>
        <span className="text-sm">•</span>
        <span className="text-sm">{time}</span>
      </div>
    </div>
  );
}
