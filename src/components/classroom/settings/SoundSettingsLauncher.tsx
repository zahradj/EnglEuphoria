import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bug, X } from "lucide-react";
import { SoundSettings } from "./SoundSettings";

/**
 * Hidden debug-only launcher for the Sound Settings test panel.
 *
 * Visible only when ANY of these are true:
 *   - URL contains `?debug=sound` (or `?debug=1`, `?debug=true`)
 *   - `localStorage.lovable_debug_sound === "1"`
 *   - User presses the secret combo:  Ctrl/Cmd + Shift + D
 *
 * Lives bottom-left so it never collides with the bottom-right reward toast.
 */
export function SoundSettingsLauncher() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const compute = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const debugParam = (params.get("debug") || "").toLowerCase();
        const ls = localStorage.getItem("lovable_debug_sound");
        return (
          debugParam === "sound" ||
          debugParam === "1" ||
          debugParam === "true" ||
          ls === "1"
        );
      } catch {
        return false;
      }
    };
    setVisible(compute());

    const onKey = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + D toggles the debug launcher session-wide.
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setVisible((v) => {
          const next = !v;
          try { localStorage.setItem("lovable_debug_sound", next ? "1" : "0"); } catch { /* noop */ }
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[95] flex flex-col items-start gap-2">
      {open && <SoundSettings />}
      <Button
        size="icon"
        variant={open ? "secondary" : "outline"}
        className="rounded-full shadow-lg backdrop-blur bg-background/80 opacity-70 hover:opacity-100"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close sound debug panel" : "Open sound debug panel"}
        title="Sound debug (Ctrl/Cmd+Shift+D to hide)"
      >
        {open ? <X className="w-4 h-4" /> : <Bug className="w-4 h-4" />}
      </Button>
    </div>
  );
}
