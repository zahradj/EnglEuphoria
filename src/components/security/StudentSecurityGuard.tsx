import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityAudit } from './SecurityAuditLogger';
import { useRoleBasedSecurity } from '@/hooks/useRoleBasedSecurity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StudentSecurityGuardProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'admin';
  requireVerification?: boolean;
}

export const StudentSecurityGuard: React.FC<StudentSecurityGuardProps> = ({
  children,
  requiredRole = 'student',
  requireVerification = false
}) => {
  const { user, session } = useAuth();
  const { hasPermission, isSecureConnection } = useRoleBasedSecurity();
  const { logSecurityEvent } = useSecurityAudit();
  const [securityCheck, setSecurityCheck] = useState({
    passed: false,
    loading: true,
    message: ''
  });

  useEffect(() => {
    performSecurityCheck();
  }, [user, session, requiredRole, requireVerification]);

  const performSecurityCheck = async () => {
    try {
      // Check if user exists and is authenticated
      if (!user || !session) {
        setSecurityCheck({
          passed: false,
          loading: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check role permissions
      if (!hasPermission(requiredRole)) {
        logSecurityEvent('unauthorized_access_attempt', {
          resource: 'student_dashboard',
          resourceId: user.id,
          metadata: {
            requiredRole,
            userRole: user.role,
            timestamp: new Date().toISOString()
          }
        });
        
        setSecurityCheck({
          passed: false,
          loading: false,
          message: `Access denied: ${requiredRole} role required`
        });
        return;
      }

      // Check for secure connection
      if (!isSecureConnection) {
        logSecurityEvent('insecure_connection_attempt', {
          resource: 'student_dashboard',
          resourceId: user.id
        });
        setSecurityCheck({
          passed: false,
          loading: false,
          message: 'Secure connection required'
        });
        return;
      }

      // Additional verification checks for students
      if (requireVerification && user.role === 'student') {
        const { data: profile, error } = await supabase
          .from('student_profiles')
          .select('profile_complete, email_verified')
          .eq('user_id', user.id)
          .single();

        if (error || !profile?.profile_complete) {
          setSecurityCheck({
            passed: false,
            loading: false,
            message: 'Profile completion required'
          });
          return;
        }

        if (requireVerification && !profile?.email_verified) {
          setSecurityCheck({
            passed: false,
            loading: false,
            message: 'Email verification required'
          });
          return;
        }
      }

      // All checks passed
      logSecurityEvent('authorized_dashboard_access', {
        resource: 'student_dashboard',
        resourceId: user.id,
        metadata: {
          userRole: user.role,
          timestamp: new Date().toISOString()
        }
      });

      setSecurityCheck({
        passed: true,
        loading: false,
        message: 'Access granted'
      });

    } catch (error) {
      console.error('Security check failed:', error);
      logSecurityEvent('security_check_error', {
        resource: 'student_dashboard',
        resourceId: user?.id,
        metadata: { error }
      });
      
      setSecurityCheck({
        passed: false,
        loading: false,
        message: 'Security check failed'
      });
    }
  };

  if (securityCheck.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 animate-pulse" />
              Security Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              Verifying access permissions...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!securityCheck.passed) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm">{securityCheck.message}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              If you believe this is an error, please contact support.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Security indicator for authorized users */}
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="outline" className="bg-success/10 border-success/20 text-success">
          <Shield className="h-3 w-3 mr-1" />
          Secure
        </Badge>
      </div>
      {children}
    </div>
  );
};