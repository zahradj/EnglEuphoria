import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette } from 'lucide-react';

interface ThemeSwitcherProps {
  onHueChange?: (hue: number) => void;
}

export function ThemeSwitcher({ onHueChange }: ThemeSwitcherProps) {
  const [selectedHue, setSelectedHue] = useState(270);

  const presetHues = [
    { name: 'Purple', hue: 270, color: 'hsl(270, 70%, 55%)' },
    { name: 'Blue', hue: 220, color: 'hsl(220, 70%, 55%)' },
    { name: 'Green', hue: 140, color: 'hsl(140, 70%, 55%)' },
    { name: 'Orange', hue: 25, color: 'hsl(25, 70%, 55%)' },
    { name: 'Pink', hue: 320, color: 'hsl(320, 70%, 55%)' },
    { name: 'Teal', hue: 180, color: 'hsl(180, 70%, 55%)' }
  ];

  const applyTheme = (hue: number) => {
    const root = document.documentElement;
    
    // Update the brand hue CSS variable
    root.style.setProperty('--brand-hue', hue.toString());
    
    // Update all brand color steps
    root.style.setProperty('--brand-50', `${hue} 40% 98%`);
    root.style.setProperty('--brand-100', `${hue} 40% 95%`);
    root.style.setProperty('--brand-200', `${hue} 45% 88%`);
    root.style.setProperty('--brand-300', `${hue} 50% 75%`);
    root.style.setProperty('--brand-400', `${hue} 60% 65%`);
    root.style.setProperty('--brand-500', `${hue} 70% 55%`);
    root.style.setProperty('--brand-600', `${hue} 75% 45%`);
    root.style.setProperty('--brand-700', `${hue} 80% 35%`);
    root.style.setProperty('--brand-800', `${hue} 85% 25%`);
    root.style.setProperty('--brand-900', `${hue} 90% 15%`);

    setSelectedHue(hue);
    onHueChange?.(hue);
  };

  return (
    <Card className="p-4 border-brand-200">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-brand-600" />
        <h3 className="font-semibold text-foreground">Theme Colors</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {presetHues.map((preset) => (
          <Button
            key={preset.hue}
            variant="outline"
            size="sm"
            className={`p-3 h-auto flex flex-col items-center gap-2 border-2 transition-all duration-200 ${
              selectedHue === preset.hue 
                ? 'border-brand-500 bg-brand-50' 
                : 'border-brand-200 hover:border-brand-300'
            }`}
            onClick={() => applyTheme(preset.hue)}
          >
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: preset.color }}
            />
            <span className="text-xs font-medium text-foreground">{preset.name}</span>
          </Button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-brand-50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          Current hue: <span className="font-medium text-brand-600">{selectedHue}°</span>
        </p>
      </div>
    </Card>
  );
}