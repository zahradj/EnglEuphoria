import { useMemo } from 'react';

export type ExportFormat = 'scorm' | 'h5p' | 'html5';

export interface LMSTheme {
  containerClass: string;
  slideClass: string;
  navigationClass: string;
  headerClass: string;
  phaseColors: {
    presentation: string;
    practice: string;
    production: string;
  };
  formatLabel: string;
  formatBadgeClass: string;
}

export function useLMSPreviewStyles(format: ExportFormat): LMSTheme {
  return useMemo(() => {
    const baseTheme = {
      phaseColors: {
        presentation: 'hsl(217, 91%, 60%)',
        practice: 'hsl(142, 71%, 45%)',
        production: 'hsl(259, 84%, 55%)'
      }
    };

    switch (format) {
      case 'scorm':
        return {
          ...baseTheme,
          containerClass: 'bg-background border-2 border-primary/20 rounded-xl shadow-xl',
          slideClass: 'bg-card rounded-lg p-8 min-h-[500px]',
          navigationClass: 'bg-muted/50 border-t',
          headerClass: 'bg-primary text-primary-foreground',
          formatLabel: 'SCORM 2004',
          formatBadgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30'
        };
      case 'h5p':
        return {
          ...baseTheme,
          containerClass: 'bg-background border-2 border-violet-500/20 rounded-2xl shadow-xl',
          slideClass: 'bg-gradient-to-br from-card to-violet-50/10 rounded-xl p-8 min-h-[500px]',
          navigationClass: 'bg-violet-50/50 border-t border-violet-200/50',
          headerClass: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white',
          formatLabel: 'H5P Interactive',
          formatBadgeClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30'
        };
      case 'html5':
        return {
          ...baseTheme,
          containerClass: 'bg-background border border-border rounded-lg shadow-lg',
          slideClass: 'bg-card rounded p-8 min-h-[500px]',
          navigationClass: 'bg-muted border-t',
          headerClass: 'bg-slate-800 text-white',
          formatLabel: 'HTML5 Standalone',
          formatBadgeClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30'
        };
      default:
        return {
          ...baseTheme,
          containerClass: 'bg-background rounded-lg shadow-lg',
          slideClass: 'bg-card p-8 min-h-[500px]',
          navigationClass: 'bg-muted border-t',
          headerClass: 'bg-primary text-primary-foreground',
          formatLabel: 'Preview',
          formatBadgeClass: 'bg-muted text-muted-foreground'
        };
    }
  }, [format]);
}
