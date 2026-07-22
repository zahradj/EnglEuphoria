import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';

export function ThemeToggle() {
  return (
    <Card className="p-4 border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Theme</h3>
      </div>
      
      <div className="space-y-3">
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Clean Professional</p>
              <p className="text-sm text-muted-foreground">Modern teal and neutrals</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary border border-border"></div>
              <div className="w-4 h-4 rounded-full bg-muted border border-border"></div>
              <Check className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card opacity-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Coming Soon</p>
              <p className="text-sm text-muted-foreground">More themes in development</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-muted border border-border"></div>
              <div className="w-4 h-4 rounded-full bg-muted border border-border"></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}