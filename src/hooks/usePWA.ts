import { useState, useEffect, useCallback } from 'react';

interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  supportsNotifications: boolean;
  supportsPush: boolean;
  hasMediaCapabilities: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    supportsNotifications: 'Notification' in window,
    supportsPush: 'serviceWorker' in navigator && 'PushManager' in window,
    hasMediaCapabilities: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  });

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const appVersion = __APP_VERSION__;

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    setCapabilities(prev => ({ ...prev, isInstalled }));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCapabilities(prev => ({ ...prev, isInstallable: true }));
    };

    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect waiting service worker for update prompt
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) return;

        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setUpdateAvailable(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setUpdateAvailable(true);
            }
          });
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    setUpdateAvailable(false);
    setWaitingWorker(null);
    // controllerchange listener in main.tsx will reload the page
  }, [waitingWorker]);

  const installApp = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
        setCapabilities(prev => ({ ...prev, isInstallable: false, isInstalled: true }));
        return true;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }

    return false;
  };

  const requestNotificationPermission = async () => {
    if (!capabilities.supportsNotifications) return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!capabilities.supportsNotifications || Notification.permission !== 'granted') {
      return;
    }

    return new Notification(title, {
      icon: '/placeholder.svg',
      badge: '/placeholder.svg',
      ...options
    });
  };

  return {
    capabilities,
    appVersion,
    updateAvailable,
    applyUpdate,
    installApp,
    requestNotificationPermission,
    sendNotification
  };
};
