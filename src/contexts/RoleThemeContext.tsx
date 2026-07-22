import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleThemeContextType {
  currentRole: 'student' | 'teacher' | 'admin' | null;
}

const RoleThemeContext = createContext<RoleThemeContextType>({
  currentRole: null
});

export const useRoleTheme = () => {
  const context = useContext(RoleThemeContext);
  if (!context) {
    throw new Error('useRoleTheme must be used within a RoleThemeProvider');
  }
  return context;
};

export const RoleThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  useEffect(() => {
    const role = user?.role as 'student' | 'teacher' | 'admin' | null;
    
    if (role) {
      // Set CSS custom properties for the current role
      const root = document.documentElement;
      
      // Reset any previous role-specific styling
      root.style.removeProperty('--current-role');
      root.style.removeProperty('--current-role-light');
      root.style.removeProperty('--current-role-dark');
      root.style.removeProperty('--current-role-accent');
      root.style.removeProperty('--current-role-foreground');
      
      // Set new role-specific properties
      root.style.setProperty('--current-role', `var(--${role})`);
      root.style.setProperty('--current-role-light', `var(--${role}-light)`);
      root.style.setProperty('--current-role-dark', `var(--${role}-dark)`);
      root.style.setProperty('--current-role-accent', `var(--${role}-accent)`);
      root.style.setProperty('--current-role-foreground', `var(--${role}-foreground)`);
      
      // Add role class to body for conditional styling
      document.body.classList.remove('role-student', 'role-teacher', 'role-admin');
      document.body.classList.add(`role-${role}`);
    }
  }, [user?.role]);

  return (
    <RoleThemeContext.Provider value={{ currentRole: user?.role as 'student' | 'teacher' | 'admin' | null }}>
      {children}
    </RoleThemeContext.Provider>
  );
};