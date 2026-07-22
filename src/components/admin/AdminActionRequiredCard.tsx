import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, FileText, Users } from 'lucide-react';
import { useAdminPendingCounts } from '@/hooks/useAdminPendingCounts';

interface AdminActionRequiredCardProps {
  onNavigate: (tab: string) => void;
}

/**
 * Surface admin tasks that need attention RIGHT NOW.
 * Renders nothing if both queues are empty.
 */
export const AdminActionRequiredCard: React.FC<AdminActionRequiredCardProps> = ({ onNavigate }) => {
  const { profileApprovals, applications, loading } = useAdminPendingCounts();

  if (loading) return null;
  if (profileApprovals === 0 && applications === 0) return null;

  return (
    <Card className="border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Action Required</h3>
            <p className="text-sm text-muted-foreground">
              Teachers are waiting on you to move forward.
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {profileApprovals > 0 && (
            <Button
              variant="outline"
              className="w-full justify-between h-auto py-3 bg-white/60 dark:bg-white/5 hover:bg-white"
              onClick={() => onNavigate('profile-review')}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-left">
                  <span className="block font-semibold text-foreground">
                    {profileApprovals} profile{profileApprovals === 1 ? '' : 's'} awaiting approval
                  </span>
                  <span className="block text-xs text-muted-foreground">Review bio + intro video</span>
                </span>
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}

          {applications > 0 && (
            <Button
              variant="outline"
              className="w-full justify-between h-auto py-3 bg-white/60 dark:bg-white/5 hover:bg-white"
              onClick={() => onNavigate('teacher-applications')}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-left">
                  <span className="block font-semibold text-foreground">
                    {applications} application{applications === 1 ? '' : 's'} in pipeline
                  </span>
                  <span className="block text-xs text-muted-foreground">Interviews & decisions</span>
                </span>
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
