import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ToolOverlayProps {
  side?: "left" | "right";
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ToolOverlay({ side = "left", title, onClose, children }: ToolOverlayProps) {
  const baseSide = side === "left" ? "left-16" : "right-16";
  return (
    <div className={`fixed top-20 ${baseSide} z-40`} role="dialog" aria-label={title}>
      <Card className="w-[360px] max-h-[70vh] overflow-auto shadow-2xl border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <h3 className="text-sm font-medium">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-3">{children}</div>
      </Card>
    </div>
  );
}
