import React, { createContext, useContext } from 'react';

type HubId = 'academy' | 'playground' | 'success';

const AcademyHubContext = createContext<HubId | null>(null);

export function AcademyHubProvider({ children }: { children: React.ReactNode }) {
  return <AcademyHubContext.Provider value="academy">{children}</AcademyHubContext.Provider>;
}

export function useIsAcademy(): boolean {
  return useContext(AcademyHubContext) === 'academy';
}
