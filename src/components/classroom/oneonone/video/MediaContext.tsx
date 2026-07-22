
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalMedia } from '@/hooks/useLocalMedia';

interface MediaContextType extends ReturnType<typeof useLocalMedia> {
  roomId: string;
}

interface MediaProviderProps {
  children: ReactNode;
  roomId: string;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children, roomId }: MediaProviderProps) {
  const media = useLocalMedia();
  
  return (
    <MediaContext.Provider value={{ ...media, roomId }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaContext() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }
  return context;
}
