import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    // No theme system - using direct colors
  }, []);

  return { theme: 'default', setTheme: () => {} };
}