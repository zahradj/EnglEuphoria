import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useLessonPayments } from '@/hooks/useLessonPayments';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function EarningsOverview() {
  const { user } = useAuth();
  const { teacherEarnings, loading, fetchTeacherEarnings } = useLessonPayments();
  const { toast } = useToast();
  const [realtimeData, setRealtimeData] = useState<any>(null);

  // Real-time subscription for payment updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('teacher-earnings-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'teacher_earnings',
          filter: `teacher_id=eq.${user.id}`
        },
        (payload: any) => {
          toast({
            title: "Payment Received! 💰",
            description: `You've earned €${Number(payload.new.teacher_amount || 0).toFixed(2)} from a completed lesson`,
            duration: 5000,
          });
          fetchTeacherEarnings();
          setRealtimeData({ teacher_payout: payload.new.teacher_amount });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'class_bookings',
          filter: `teacher_id=eq.${user.id}`
        },
        (payload: any) => {
          if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
            fetchTeacherEarnings();
          }
        }
      )
      .subscribe();


    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast, fetchTeacherEarnings]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const earnings = teacherEarnings || {
    total_earned: 0,
    lessons_completed: 0,
    pending_penalties: 0,
    recent_absences: 0,
    can_teach: true,
    net_earnings: 0
  };

  const canTeachStatus = earnings.can_teach ? 'Active' : 'Suspended';
  const statusVariant = earnings.can_teach ? 'default' : 'destructive';

  return (
    <div className="space-y-6">
      {/* Real-time notification banner */}
      {realtimeData && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">
                New payment: €{realtimeData.teacher_payout} just received! 
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setRealtimeData(null)}
                  className="h-auto p-0 ml-2 text-green-600"
                >
                  Dismiss
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{earnings.total_earned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {earnings.lessons_completed} completed lessons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{earnings.net_earnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              After penalties (€{earnings.pending_penalties.toFixed(2)})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.lessons_completed}</div>
            <p className="text-xs text-muted-foreground">
              Total lessons taught
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teaching Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant}>{canTeachStatus}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {earnings.recent_absences} recent absences
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning for penalties */}
      {earnings.pending_penalties > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Penalties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              You have €{earnings.pending_penalties.toFixed(2)} in pending penalties. 
              Contact support if you need clarification.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}