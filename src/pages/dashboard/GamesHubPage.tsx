import { GamesTab } from '@/components/student/tabs/GamesTab';

/**
 * Standalone /dashboard/games route — renders the same Student Game Library
 * used by the Games tab inside the dashboard.
 */
export default function GamesHubPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <GamesTab />
      </div>
    </div>
  );
}
