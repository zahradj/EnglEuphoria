import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, Gamepad2, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GameMode = 'mechanic' | 'context' | 'application';
export type ImageStyle = 'simple' | 'colorful' | 'realistic';

export interface AdvancedOptions {
  // Game options
  includeGames: boolean;
  gameMode: GameMode;
  questionCount: number;
  gameSlideCount: number;
  
  // Image options
  autoGenerateImages: boolean;
  imageStyle: ImageStyle;
}

interface AdvancedLessonOptionsProps {
  options: AdvancedOptions;
  onChange: (options: AdvancedOptions) => void;
  disabled?: boolean;
}

export const defaultAdvancedOptions: AdvancedOptions = {
  includeGames: true,
  gameMode: 'mechanic',
  questionCount: 5,
  gameSlideCount: 2,
  autoGenerateImages: true,
  imageStyle: 'simple',
};

export const AdvancedLessonOptions: React.FC<AdvancedLessonOptionsProps> = ({
  options,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateOption = <K extends keyof AdvancedOptions>(
    key: K,
    value: AdvancedOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors">
        <span className="text-sm font-medium text-foreground">Advanced Options</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} 
        />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2 space-y-4">
        {/* Game Generation Options */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium text-foreground">Game Slides</h4>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-games" className="text-sm text-muted-foreground">
              Include interactive games in lesson
            </Label>
            <Switch
              id="include-games"
              checked={options.includeGames}
              onCheckedChange={(checked) => updateOption('includeGames', checked)}
              disabled={disabled}
            />
          </div>
          
          {options.includeGames && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Game Mode</Label>
                <Select
                  value={options.gameMode}
                  onValueChange={(value: GameMode) => updateOption('gameMode', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanic">
                      <div className="flex flex-col items-start">
                        <span>Mechanic</span>
                        <span className="text-xs text-muted-foreground">Practice drills & repetition</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="context">
                      <div className="flex flex-col items-start">
                        <span>Context</span>
                        <span className="text-xs text-muted-foreground">Real-world scenarios</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="application">
                      <div className="flex flex-col items-start">
                        <span>Application</span>
                        <span className="text-xs text-muted-foreground">Creative production</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Questions per Game</Label>
                  <span className="text-sm font-medium text-foreground">{options.questionCount}</span>
                </div>
                <Slider
                  value={[options.questionCount]}
                  onValueChange={([value]) => updateOption('questionCount', value)}
                  min={3}
                  max={10}
                  step={1}
                  disabled={disabled}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Game Slides in Lesson</Label>
                  <span className="text-sm font-medium text-foreground">{options.gameSlideCount}</span>
                </div>
                <Slider
                  value={[options.gameSlideCount]}
                  onValueChange={([value]) => updateOption('gameSlideCount', value)}
                  min={1}
                  max={4}
                  step={1}
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Image Generation Options */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium text-foreground">Vocabulary Images</h4>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-images" className="text-sm text-muted-foreground">
              Auto-generate images for vocabulary slides
            </Label>
            <Switch
              id="auto-images"
              checked={options.autoGenerateImages}
              onCheckedChange={(checked) => updateOption('autoGenerateImages', checked)}
              disabled={disabled}
            />
          </div>
          
          {options.autoGenerateImages && (
            <div className="pt-2 border-t border-border">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Image Style</Label>
                <Select
                  value={options.imageStyle}
                  onValueChange={(value: ImageStyle) => updateOption('imageStyle', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">
                      <div className="flex flex-col items-start">
                        <span>Simple</span>
                        <span className="text-xs text-muted-foreground">Clean, educational illustrations</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="colorful">
                      <div className="flex flex-col items-start">
                        <span>Colorful</span>
                        <span className="text-xs text-muted-foreground">Vibrant, kid-friendly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="realistic">
                      <div className="flex flex-col items-start">
                        <span>Realistic</span>
                        <span className="text-xs text-muted-foreground">Photo-like quality</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
