import React, { useCallback, useRef, useState } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';

/**
 * Wraps SidebarProvider with controlled `open` state so the sidebar
 * auto-expands when the cursor approaches the left edge of the viewport
 * and auto-collapses when the cursor moves away.
 *
 * Use together with:
 *  - <SidebarHoverZone />  → invisible left-edge hot zone that opens it
 *  - <SidebarHoverArea>...</SidebarHoverArea> → wrap the actual <Sidebar/>
 *      so leaving its bounds closes it after a short grace delay.
 */

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  cancelClose: () => void;
  scheduleClose: () => void;
};

const HoverCtx = React.createContext<Ctx | null>(null);

export const SidebarHoverShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 250);
  }, [cancelClose]);

  return (
    <HoverCtx.Provider value={{ open, setOpen, cancelClose, scheduleClose }}>
      <SidebarProvider open={open} onOpenChange={setOpen}>
        {children}
      </SidebarProvider>
    </HoverCtx.Provider>
  );
};

const useHoverCtx = () => {
  const ctx = React.useContext(HoverCtx);
  if (!ctx) throw new Error('SidebarHover* must be used inside <SidebarHoverShell>');
  return ctx;
};

/** Invisible left-edge hot zone — opens the sidebar on hover. Desktop only. */
export const SidebarHoverZone: React.FC = () => {
  const { setOpen, cancelClose } = useHoverCtx();
  return (
    <div
      aria-hidden
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      className="hidden md:block fixed top-0 left-0 h-full w-3 z-40"
    />
  );
};

/** Wrap the sidebar so leaving its bounds schedules a close (with grace). */
export const SidebarHoverArea: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cancelClose, scheduleClose } = useHoverCtx();
  // Try to call useSidebar — only available inside provider (which it is).
  // We do not need its state directly here.
  try { useSidebar(); } catch { /* no-op */ }
  return (
    <div
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      className="contents"
    >
      {children}
    </div>
  );
};
