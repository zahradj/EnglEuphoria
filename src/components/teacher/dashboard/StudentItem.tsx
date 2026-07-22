
import { Button } from "@/components/ui/button";

interface StudentItemProps {
  name: string;
  level: string;
  lastClass: string;
  progress: number;
  onViewDetails: () => void;
}

export const StudentItem = ({ name, level, lastClass, progress, onViewDetails }: StudentItemProps) => (
  <div className="flex items-center justify-between py-3 border-b border-purple-200/50 dark:border-purple-700/50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-indigo-50/50 hover:to-blue-50/50 dark:hover:from-purple-950/30 dark:hover:via-indigo-950/30 dark:hover:to-blue-950/30 px-2 rounded-lg transition-all">
    <div>
      <h3 className="font-medium text-purple-900 dark:text-purple-100">👤 {name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">{level}</span>
        <span className="text-xs text-purple-600 dark:text-purple-400">📅 Last class: {lastClass}</span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{progress}%</span>
        <div className="w-24 h-2 bg-purple-100 dark:bg-purple-900/50 rounded border border-purple-200/50">
          <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-100/50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/30" onClick={onViewDetails}>View Details</Button>
    </div>
  </div>
);
