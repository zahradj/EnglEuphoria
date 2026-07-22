import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityAudit } from '@/components/security/SecurityAuditLogger';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high';
  activeThreats: number;
  blockedAttempts: number;
  securityScore: number;
}

interface SecurityRule {
  id: string;
  name: string;
  condition: (context: any) => boolean;
  action: 'log' | 'block' | 'alert';
  severity: 'low' | 'medium' | 'high';
}

export function useAdvancedSecurity() {
  const { user } = useAuth();
  const { logSecurityEvent, logSuspiciousActivity } = useSecurityAudit();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    threatLevel: 'low',
    activeThreats: 0,
    blockedAttempts: 0,
    securityScore: 95
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Define security rules
  const securityRules: SecurityRule[] = [
    {
      id: 'rapid_requests',
      name: 'Rapid API Requests',
      condition: (context) => context.requestCount > 100,
      action: 'block',
      severity: 'high'
    },
    {
      id: 'suspicious_location',
      name: 'Unusual Location Access',
      condition: (context) => context.newLocation && context.riskScore > 0.8,
      action: 'alert',
      severity: 'medium'
    },
    {
      id: 'privilege_escalation',
      name: 'Privilege Escalation Attempt',
      condition: (context) => context.roleChangeAttempt && !context.authorized,
      action: 'block',
      severity: 'high'
    },
    {
      id: 'data_exfiltration',
      name: 'Data Exfiltration Pattern',
      condition: (context) => context.dataVolume > 1000 && context.rapidDownloads,
      action: 'block',
      severity: 'high'
    }
  ];

  const evaluateSecurityRules = useCallback((context: any) => {
    const triggeredRules = securityRules.filter(rule => rule.condition(context));
    
    triggeredRules.forEach(rule => {
      const eventData = {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        action: rule.action,
        context,
        timestamp: new Date().toISOString()
      };

      switch (rule.action) {
        case 'block':
          logSuspiciousActivity('security_rule_triggered', eventData);
          setSecurityMetrics(prev => ({
            ...prev,
            blockedAttempts: prev.blockedAttempts + 1,
            threatLevel: rule.severity === 'high' ? 'high' : prev.threatLevel
          }));
          break;
        case 'alert':
          logSecurityEvent('security_alert', {
            resource: 'security_system',
            resourceId: user?.id,
            metadata: eventData
          });
          setSecurityMetrics(prev => ({
            ...prev,
            activeThreats: prev.activeThreats + 1
          }));
          break;
        case 'log':
          logSecurityEvent('security_rule_triggered', {
            resource: 'security_system',
            resourceId: user?.id,
            metadata: eventData
          });
          break;
      }
    });

    return triggeredRules;
  }, [user?.id, logSecurityEvent, logSuspiciousActivity]);

  const startSecurityMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    // Monitor API request patterns
    const requestTracker = {
      count: 0,
      lastReset: Date.now()
    };

    // Set up real-time monitoring
    const monitoringInterval = setInterval(async () => {
      try {
        // Check for recent security events
        const { data: recentEvents } = await supabase
          .from('security_audit_logs')
          .select('*')
          .gte('created_at', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
          .eq('user_id', user?.id);

        if (recentEvents && recentEvents.length > 0) {
          // Analyze patterns
          const suspiciousPatterns = recentEvents.filter(event =>
            event.action === 'failed_login' || 
            event.action === 'unauthorized_access' ||
            event.metadata?.severity === 'high'
          );

          if (suspiciousPatterns.length > 5) {
            evaluateSecurityRules({
              eventType: 'suspicious_pattern',
              eventCount: suspiciousPatterns.length,
              timeWindow: '5 minutes'
            });
          }
        }

        // Update security score based on recent activity
        const riskFactors = Math.max(0, securityMetrics.activeThreats * 10 - securityMetrics.blockedAttempts * 5);
        const newScore = Math.max(0, Math.min(100, 95 - riskFactors));
        
        setSecurityMetrics(prev => ({
          ...prev,
          securityScore: newScore,
          threatLevel: newScore < 70 ? 'high' : newScore < 90 ? 'medium' : 'low'
        }));

      } catch (error) {
        console.error('Security monitoring error:', error);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(monitoringInterval);
      setIsMonitoring(false);
    };
  }, [isMonitoring, user?.id, evaluateSecurityRules, securityMetrics]);

  const stopSecurityMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const reportSecurityIncident = useCallback(async (incident: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    metadata?: any;
  }) => {
    try {
      // Log the incident
      await logSuspiciousActivity(
        `security_incident_${incident.type}`,
        {
          description: incident.description,
          severity: incident.severity,
          reportedAt: new Date().toISOString(),
          ...incident.metadata
        }
      );

      // Update threat metrics
      setSecurityMetrics(prev => ({
        ...prev,
        activeThreats: prev.activeThreats + 1,
        threatLevel: incident.severity === 'high' ? 'high' : prev.threatLevel
      }));

      return { success: true };
    } catch (error) {
      console.error('Failed to report security incident:', error);
      return { success: false, error };
    }
  }, [user?.id, logSuspiciousActivity]);

  const getSecurityStatus = useCallback(() => {
    return {
      isSecure: securityMetrics.securityScore > 70,
      metrics: securityMetrics,
      isMonitoring,
      recommendations: [
        ...(securityMetrics.securityScore < 70 ? ['Review recent security alerts'] : []),
        ...(securityMetrics.activeThreats > 0 ? ['Investigate active threats'] : []),
        ...(securityMetrics.blockedAttempts > 10 ? ['Consider additional security measures'] : [])
      ]
    };
  }, [securityMetrics, isMonitoring]);

  useEffect(() => {
    if (user) {
      startSecurityMonitoring();
    } else {
      stopSecurityMonitoring();
    }

    return () => stopSecurityMonitoring();
  }, [user, startSecurityMonitoring, stopSecurityMonitoring]);

  return {
    securityMetrics,
    isMonitoring,
    evaluateSecurityRules,
    startSecurityMonitoring,
    stopSecurityMonitoring,
    reportSecurityIncident,
    getSecurityStatus
  };
}