import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  content: string;
  defaultOpen?: boolean;
  tone?: "default" | "destructive";
}

export function CodeBlock({ title, content, defaultOpen = false, tone = "default" }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-muted/30 overflow-hidden",
        tone === "destructive" && "border-destructive/30",
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {title}
        </button>
        {open && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={copy}>
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
      {open && (
        <pre
          className={cn(
            "px-3 py-3 text-[11px] font-mono whitespace-pre-wrap break-words max-h-80 overflow-auto",
            tone === "destructive" ? "text-destructive" : "text-foreground/90",
          )}
        >
          {content || "(empty)"}
        </pre>
      )}
    </div>
  );
}
