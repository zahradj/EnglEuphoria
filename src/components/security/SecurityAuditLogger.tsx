import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityAuditContextType {
  logSecurityEvent: (action: string, params: {
    resource: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  }) => Promise<void>;
  logAuthEvent: (action: string, metadata?: Record<string, any>) => Promise<void>;
  logDataAccess: (table: string, operation: string, recordId?: string) => Promise<void>;
  logSuspiciousActivity: (description: string, metadata?: Record<string, any>) => Promise<void>;
}

const SecurityAuditContext = createContext<SecurityAuditContextType | null>(null);

export const useSecurityAudit = () => {
  const context = useContext(SecurityAuditContext);
  if (!context) {
    throw new Error('useSecurityAudit must be used within SecurityAuditProvider');
  }
  return context;
};

interface SecurityAuditProviderProps {
  children: ReactNode;
}

export const SecurityAuditProvider: React.FC<SecurityAuditProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const logSecurityEvent = useCallback(async (action: string, params: {
    resource: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      // Get client information
      const clientInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer || null
      };

      // Combine metadata with client info
      const enhancedMetadata = {
        ...params.metadata,
        clientInfo,
        severity: params.metadata?.severity || 'low',
        userId: user?.id || 'anonymous'
      };

      // Log to Supabase security audit table
      const { error } = await supabase
        .from('security_audit_logs')
        .insert({
          user_id: user?.id || null,
          action,
          resource_type: params.resource,
          resource_id: params.resourceId || null,
          metadata: enhancedMetadata
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // For critical events, also log to console for immediate visibility
      if (params.metadata?.severity === 'critical') {
        console.warn('CRITICAL SECURITY EVENT:', { action, ...params });
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }, [user?.id]);

  const logAuthEvent = useCallback(async (action: string, metadata?: Record<string, any>) => {
    await logSecurityEvent(`auth_${action}`, {
      resource: 'authentication',
      metadata: {
        ...metadata,
        authAction: action,
        severity: action.includes('failed') || action.includes('blocked') ? 'high' : 'medium'
      }
    });
  }, [logSecurityEvent]);

  const logDataAccess = useCallback(async (
    table: string, 
    operation: string, 
    recordId?: string
  ) => {
    // Only log sensitive data access
    const sensitiveActions = ['SELECT', 'UPDATE', 'DELETE'];
    const sensitiveTables = [
      'users', 'student_profiles', 'teacher_profiles', 
      'lesson_payments', 'teacher_earnings', 'security_audit_logs'
    ];

    if (sensitiveActions.includes(operation.toUpperCase()) && 
        sensitiveTables.includes(table)) {
      await logSecurityEvent(`data_${operation.toLowerCase()}`, {
        resource: table,
        resourceId: recordId,
        metadata: {
          operation,
          table,
          severity: operation === 'DELETE' ? 'high' : 'low'
        }
      });
    }
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback(async (
    description: string, 
    metadata?: Record<string, any>
  ) => {
    await logSecurityEvent('suspicious_activity', {
      resource: 'security',
      metadata: {
        description,
        ...metadata,
        severity: 'critical'
      }
    });
  }, [logSecurityEvent]);

  const value: SecurityAuditContextType = {
    logSecurityEvent,
    logAuthEvent,
    logDataAccess,
    logSuspiciousActivity
  };

  return (
    <SecurityAuditContext.Provider value={value}>
      {children}
    </SecurityAuditContext.Provider>
  );
};

// HOC for automatic component security logging
export const withSecurityLogging = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const { logSecurityEvent } = useSecurityAudit();

    React.useEffect(() => {
      // Log component access for sensitive components
      const sensitiveComponents = [
        'AdminPanel', 'UserManagement', 'PaymentSettings', 
        'SecuritySettings', 'TeacherApplications'
      ];

      if (sensitiveComponents.includes(componentName)) {
        logSecurityEvent('component_access', {
          resource: 'ui_component',
          metadata: {
            componentName,
            accessTime: new Date().toISOString(),
            severity: 'low'
          }
        });
      }
    }, [logSecurityEvent]);

    return <WrappedComponent {...props} />;
  };
};