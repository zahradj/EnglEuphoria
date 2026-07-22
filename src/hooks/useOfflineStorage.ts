import { useState, useEffect } from 'react';

interface OfflineStorageOptions {
  key: string;
  defaultValue?: any;
  syncOnReconnect?: boolean;
}

export const useOfflineStorage = <T>({ key, defaultValue, syncOnReconnect = true }: OfflineStorageOptions) => {
  const [data, setData] = useState<T>(defaultValue);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<any[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
      }

      const pending = localStorage.getItem(`${key}_pending`);
      if (pending) {
        setPendingSync(JSON.parse(pending));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }, [key]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncOnReconnect && pendingSync.length > 0) {
        // Trigger sync of pending changes
        syncPendingChanges();
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync, syncOnReconnect]);

  const save = (newData: T, shouldSync = false) => {
    setData(newData);
    
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      
      if (shouldSync && !isOnline) {
        // Add to pending sync queue
        const newPending = [...pendingSync, { data: newData, timestamp: Date.now() }];
        setPendingSync(newPending);
        localStorage.setItem(`${key}_pending`, JSON.stringify(newPending));
      }
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const clear = () => {
    setData(defaultValue);
    setPendingSync([]);
    
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_pending`);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  };

  const syncPendingChanges = async () => {
    if (pendingSync.length === 0) return;

    try {
      // Here you would implement actual sync logic with your backend
      
      // Clear pending after successful sync
      setPendingSync([]);
      localStorage.removeItem(`${key}_pending`);
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    }
  };

  return {
    data,
    save,
    clear,
    isOnline,
    hasPendingChanges: pendingSync.length > 0,
    syncPendingChanges
  };
};