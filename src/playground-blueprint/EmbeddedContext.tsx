import { createContext, useContext, type ReactNode } from "react";

const EmbeddedContext = createContext<boolean>(false);

export function EmbeddedProvider({ embedded, children }: { embedded: boolean; children: ReactNode }) {
  return <EmbeddedContext.Provider value={embedded}>{children}</EmbeddedContext.Provider>;
}

export function useEmbedded(): boolean {
  return useContext(EmbeddedContext);
}
