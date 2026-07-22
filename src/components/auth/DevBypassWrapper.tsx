import React, { createContext, useContext } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DevBypassContextType {
  user: {
    id: string;
    email: string;
    role: string;
  };
  isDevMode: true;
}

const DevBypassContext = createContext<DevBypassContextType | null>(null);

export const useDevBypassContext = () => useContext(DevBypassContext);

interface DevBypassWrapperProps {
  role: 'student' | 'teacher' | 'admin' | 'parent';
  children: React.ReactNode;
}

export const DevBypassWrapper: React.FC<DevBypassWrapperProps> = ({ role, children }) => {
  const mockUser = {
    id: 'dev-bypass-user-id',
    email: `dev-${role}@test.local`,
    role
  };

  const handleRoleSwitch = (newRole: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('as_role', newRole);
    window.location.href = url.toString();
  };

  return (
    <DevBypassContext.Provider value={{ user: mockUser, isDevMode: true }}>
      <div className="relative min-h-dvh">
        {/* Dev Bypass Warning Banner */}
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-amber-950 py-2 px-4 flex items-center justify-center gap-4 shadow-lg">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold text-sm">
            ⚠️ DEV BYPASS ACTIVE — Role: <span className="uppercase">{role}</span> — Frontend Only (RLS still enforced)
          </span>
          <div className="flex gap-2 ml-4">
            {(['student', 'teacher', 'admin', 'parent'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  r === role
                    ? 'bg-amber-950 text-amber-100'
                    : 'bg-amber-600 text-amber-950 hover:bg-amber-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {/* Content with top padding for banner */}
        <div className="pt-10">
          {children}
        </div>
      </div>
    </DevBypassContext.Provider>
  );
};
