import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TouchFriendlyButton } from './TouchFriendlyButton';
import { usePWA } from '@/hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { capabilities, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt if app is installable and not already installed
    if (capabilities.isInstallable && !capabilities.isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [capabilities.isInstallable, capabilities.isInstalled]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!isVisible || isDismissed || capabilities.isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-primary/20 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground mb-1">
                Install Engleuphoria
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Add to your home screen for quick access and offline learning!
              </p>
              
              <div className="flex gap-2">
                <TouchFriendlyButton
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 h-8 text-xs"
                  hapticFeedback
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </TouchFriendlyButton>
                
                <TouchFriendlyButton
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8 px-2"
                >
                  <X className="h-3 w-3" />
                </TouchFriendlyButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};