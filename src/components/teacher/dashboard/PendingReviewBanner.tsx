import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, Bell, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PendingReviewBannerProps {
  teacherName: string;
}

export const PendingReviewBanner: React.FC<PendingReviewBannerProps> = ({ teacherName }) => {
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === 'admin';
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800">
        <CardContent className="pt-8 pb-10 px-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your Account is Under Review
              </h2>
              <p className="text-lg text-muted-foreground">
                Thank you for completing your profile, {teacherName.split(' ')[0]}!
              </p>
            </div>

            {/* Message */}
            <div className="bg-white/60 dark:bg-white/5 rounded-xl p-6 space-y-4">
              <p className="text-muted-foreground">
                An admin is reviewing your <span className="font-semibold text-foreground">bio and intro video</span> — usually within{' '}
                <span className="font-semibold text-foreground">24 hours</span>.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Bell className="w-4 h-4" />
                <span>You will receive an email notification once approved.</span>
              </div>
            </div>

            {/* What's Next */}
            <div className="text-left bg-white/40 dark:bg-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-foreground">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span>Our team reviews your profile and introduction video</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span>Once approved, you'll receive full access to your dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span>Set your availability and start teaching!</span>
                </li>
              </ul>
            </div>

            {isAdmin && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>You're signed in as an admin — review this profile now.</span>
                </div>
                <Button asChild size="sm">
                  <Link to="/super-admin?tab=profile-review">
                    Open Profile Approvals
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
