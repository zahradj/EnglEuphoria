import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedSecurity } from '@/hooks/useRoleBasedSecurity';

export const SecurityStatusBadge: React.FC = () => {
  const { user } = useAuth();
  const { isSecureConnection } = useRoleBasedSecurity();

  if (!user) return null;

  const isSecure = isSecureConnection;

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
      isSecure 
        ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
        : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
    }`}>
      {isSecure ? (
        <ShieldCheck className="h-4 w-4" />
      ) : (
        <ShieldAlert className="h-4 w-4" />
      )}
      <span>
        {isSecure ? 'Secure Connection' : 'Insecure Connection'}
      </span>
    </div>
  );
};
