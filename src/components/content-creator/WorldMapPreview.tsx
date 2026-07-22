import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ThemedUnitSpec } from '@/curriculum';

interface Props {
  specs: ThemedUnitSpec[];
}

/**
 * Renders the bound world map: one card per unit, palette swatches, mascots,
 * emotional tone, gameplay identity. Lets the creator preview rotation before
 * committing to generation.
 */
export const WorldMapPreview: React.FC<Props> = ({ specs }) => {
  if (!specs.length) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">World Map</h3>
      <p className="text-xs text-muted-foreground">
        CEFR objectives drive learning. Worlds rotate to keep students emotionally engaged.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {specs.map((s) => (
          <Card key={s.bucket.index} className="p-3 border border-border">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Unit {s.bucket.unitNumber}</div>
                <div className="font-semibold text-foreground truncate">{s.world.name}</div>
                <div className="text-xs text-muted-foreground truncate">{s.bucket.unitTitle}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                {s.world.palette.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: c }}
                    aria-label={`palette swatch ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">{s.world.emotionalTone}</Badge>
              <Badge variant="outline" className="text-[10px]">{s.world.gameplayIdentity}</Badge>
              {s.fitReason === 'topic-fit' && (
                <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30">topic fit</Badge>
              )}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Mascots:</span> {s.world.mascots.join(', ')}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
