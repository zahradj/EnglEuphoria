import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFocusManagement, useScreenReader } from '@/hooks/useAccessibility';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  description,
  size = 'md',
}: AccessibleModalProps) {
  const { saveFocus, restoreFocus, trapFocus } = useFocusManagement();
  const { announce } = useScreenReader();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      saveFocus();
      announce(`${title} dialog opened`);
      
      // Trap focus within modal
      const cleanup = trapFocus(contentRef);
      
      return () => {
        cleanup?.();
        restoreFocus();
        announce(`${title} dialog closed`);
      };
    }
  }, [isOpen, title, saveFocus, restoreFocus, trapFocus, announce]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={contentRef}
        className={`
          ${size === 'sm' ? 'max-w-sm' : ''}
          ${size === 'md' ? 'max-w-md' : ''}
          ${size === 'lg' ? 'max-w-lg' : ''}
          ${size === 'xl' ? 'max-w-xl' : ''}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle id="modal-title" className="text-lg font-semibold">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close dialog"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description && (
            <p id="modal-description" className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}