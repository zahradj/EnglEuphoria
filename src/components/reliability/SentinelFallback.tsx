import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface Props {
  incidentId?: string | null;
  diagnosing: boolean;
  onReload: () => void;
}

export function SentinelFallback({ incidentId, diagnosing, onReload }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Something went off-script</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {diagnosing
            ? "Sentinel-1 is diagnosing this incident…"
            : incidentId
              ? "Sentinel-1 has filed an incident for review."
              : "Please reload to continue."}
        </p>
        <Button onClick={onReload} className="w-full">Reload</Button>
        {incidentId && (
          <p className="mt-4 text-[10px] text-muted-foreground/70 font-mono">
            Incident #{incidentId.slice(0, 8)}
          </p>
        )}
      </div>
    </div>
  );
}
