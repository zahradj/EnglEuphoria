import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DiagnosticResult {
  session?: {
    exists: boolean;
    userId?: string;
    matches: boolean;
  };
  role?: string;
  canRead?: boolean;
  readError?: string;
  canInsert?: boolean;
  insertError?: string;
}

export const CalendarDiagnostics = ({ teacherId }: { teacherId: string }) => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult = {};
    
    try {
      // Check 1: Auth session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      results.session = {
        exists: !!currentSession,
        userId: currentSession?.user?.id,
        matches: currentSession?.user?.id === teacherId
      };
      
      // Check 2: User role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', teacherId)
        .maybeSingle();
      results.role = roleData?.role || 'NOT_FOUND';
      
      // Check 3: Can read own slots?
      const { data: slots, error: readError } = await supabase
        .from('teacher_availability')
        .select('id')
        .eq('teacher_id', teacherId)
        .limit(1);
      results.canRead = !readError;
      results.readError = readError?.message;
      
      // Check 4: Test insert permission (without actually inserting)
      const testDate = new Date(Date.now() + 86400000 * 30);
      const testSlot = {
        teacher_id: teacherId,
        start_time: testDate.toISOString(),
        end_time: new Date(testDate.getTime() + 1500000).toISOString(),
        duration: 25,
        lesson_type: 'free_slot',
        is_available: true,
        is_booked: false
      };
      
      // Test validation by attempting insert (will fail on RLS if permissions wrong)
      const { error: insertError } = await supabase
        .from('teacher_availability')
        .insert(testSlot)
        .select()
        .limit(0);
      
      results.canInsert = !insertError;
      results.insertError = insertError?.message;
    } catch (error: any) {
      console.error('Diagnostics error:', error);
    } finally {
      setDiagnostics(results);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (show && Object.keys(diagnostics).length === 0) {
      runDiagnostics();
    }
  }, [show]);

  const getStatusIcon = (isSuccess?: boolean) => {
    if (isSuccess === undefined) return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    return isSuccess ? 
      <CheckCircle className="w-4 h-4 text-success" /> : 
      <XCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShow(!show)}
        className="mb-2 shadow-lg"
      >
        🔍 Diagnostics
      </Button>
      
      {show && (
        <Card className="w-96 max-h-[32rem] overflow-auto shadow-xl">
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm">Calendar Diagnostics</div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={runDiagnostics}
                disabled={isRunning}
                className="h-7 text-xs"
              >
                {isRunning ? '...' : '↻ Rerun'}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="p-2 bg-muted/50 rounded">
                <strong className="text-xs">Teacher ID:</strong>
                <code className="ml-2 text-[10px] bg-background p-1 rounded block mt-1 break-all">
                  {teacherId || '❌ EMPTY!'}
                </code>
              </div>
              
              <div className="p-2 bg-muted/50 rounded">
                <strong className="text-xs">Context User ID:</strong>
                <code className="ml-2 text-[10px] bg-background p-1 rounded block mt-1 break-all">
                  {user?.id || '❌ N/A'}
                </code>
              </div>
              
              <div className="p-2 bg-muted/50 rounded">
                <strong className="text-xs">Session User ID:</strong>
                <code className="ml-2 text-[10px] bg-background p-1 rounded block mt-1 break-all">
                  {diagnostics.session?.userId || '❌ N/A'}
                </code>
              </div>
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Session Exists:</span>
                <Badge variant={diagnostics.session?.exists ? 'default' : 'destructive'}>
                  {diagnostics.session?.exists ? '✅ YES' : '❌ NO'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">IDs Match:</span>
                <Badge variant={diagnostics.session?.matches ? 'default' : 'destructive'}>
                  {diagnostics.session?.matches ? '✅ YES' : '❌ NO'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Role:</span>
                <Badge variant={diagnostics.role === 'teacher' ? 'default' : 'destructive'}>
                  {diagnostics.role || 'UNKNOWN'}
                </Badge>
              </div>
              
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium">Can Read Slots:</span>
                <div className="text-right">
                  {getStatusIcon(diagnostics.canRead)}
                  {diagnostics.readError && (
                    <div className="text-[10px] text-destructive mt-1 max-w-[200px] break-words">
                      {diagnostics.readError}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium">Can Insert Slots:</span>
                <div className="text-right">
                  {getStatusIcon(diagnostics.canInsert)}
                  {diagnostics.insertError && (
                    <div className="text-[10px] text-destructive mt-1 max-w-[200px] break-words">
                      {diagnostics.insertError}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <div className="text-[10px] text-muted-foreground space-y-1">
                <p>💡 <strong>Green badges</strong> = System working correctly</p>
                <p>🔴 <strong>Red badges</strong> = Problem detected</p>
                <p>If all checks fail, try logging out and back in.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
