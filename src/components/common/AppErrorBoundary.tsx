import { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 App Error Boundary caught an error:', error, errorInfo);
    // This boundary sits closer to the crash than GlobalErrorBoundary
    // (main.tsx), so React always hands the error to THIS one first —
    // GlobalErrorBoundary's own system_errors logging never runs for
    // anything caught here. Previously that meant every crash this
    // boundary caught (including live classroom crashes) left no record
    // anywhere once the tab closed — "something went wrong" with no way
    // to find out what. Log here too, same shape, so there's always a
    // queryable trace.
    void this.logError(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const componentName =
        errorInfo.componentStack?.trim().split('\n')[0]?.trim().replace(/^in\s+/i, '') ?? null;
      await supabase.from('system_errors').insert({
        error_message: error.message?.slice(0, 4000) ?? 'Unknown error',
        stack_trace: [error.stack, errorInfo.componentStack].filter(Boolean).join('\n\n---\n\n'),
        component_name: componentName,
        route: typeof window !== 'undefined' ? window.location.pathname : null,
        user_id: auth.user?.id ?? null,
        status: 'open',
      });
    } catch (logErr) {
      console.warn('[AppErrorBoundary] Failed to log error:', logErr);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onReset: () => void;
}

const ErrorFallback = ({ onReset }: ErrorFallbackProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (user?.role === 'student') {
      navigate('/student');
    } else if (user?.role === 'teacher') {
      navigate('/teacher');
    } else if (user?.role === 'admin') {
      navigate('/super-admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={onReset} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};