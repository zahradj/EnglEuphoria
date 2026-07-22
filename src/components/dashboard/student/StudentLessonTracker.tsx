import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle, RotateCcw } from "lucide-react";
import { lessonService } from "@/services/lessonService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LessonStats {
  total_booked: number;
  completed_paid: number;
  cancelled_free: number;
  total_spent: number;
  total_refunded: number;
}

export function StudentLessonTracker() {
  const [stats, setStats] = useState<LessonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const data = await lessonService.getStudentLessonStats(user.id);
        setStats(data);
      } catch (error) {
        console.error('Error fetching lesson stats:', error);
        toast({
          title: "Error",
          description: "Failed to load lesson statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id, toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 My Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 My Lessons
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lesson Counts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <CalendarDays className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total_booked}</p>
              <p className="text-sm text-muted-foreground">Total Booked</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed_paid}</p>
              <p className="text-sm text-muted-foreground">Completed & Paid</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <RotateCcw className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.cancelled_free}</p>
              <p className="text-sm text-muted-foreground">Cancelled/Free Reschedules</p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold">Financial Summary</h3>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Spent:</span>
            <Badge variant="outline" className="font-mono">
              €{stats.total_spent.toFixed(2)}
            </Badge>
          </div>

          {stats.total_refunded > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Refunded:</span>
              <Badge variant="outline" className="font-mono text-green-600">
                €{stats.total_refunded.toFixed(2)}
              </Badge>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">Net Spent:</span>
            <Badge className="font-mono">
              €{(stats.total_spent - stats.total_refunded).toFixed(2)}
            </Badge>
          </div>
        </div>

        {/* Transparency Note */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Transparent Billing</p>
          <p>
            You only pay €10 for completed lessons. If your teacher is absent or has 
            technical issues, you get a free reschedule or refund automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}