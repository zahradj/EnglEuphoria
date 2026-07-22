import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IPA_KEYBOARD_LAYOUT, getIPADescription } from '@/lib/ipaUtils';

interface PhoneticKeyboardProps {
  onSymbolClick: (symbol: string) => void;
  onClose?: () => void;
}

export function PhoneticKeyboard({ onSymbolClick, onClose }: PhoneticKeyboardProps) {
  const [activeTab, setActiveTab] = useState('vowels');

  const tabCategories = {
    vowels: ['Short Vowels', 'Long Vowels', 'Diphthongs'],
    consonants: ['Plosives', 'Fricatives', 'Affricates', 'Nasals', 'Approximants'],
    markers: ['Markers'],
  };

  const renderSymbolButton = (symbol: string) => (
    <TooltipProvider key={symbol}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 text-lg font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onSymbolClick(symbol)}
          >
            {symbol}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getIPADescription(symbol)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderCategory = (categoryName: string) => {
    const symbols = IPA_KEYBOARD_LAYOUT[categoryName as keyof typeof IPA_KEYBOARD_LAYOUT];
    if (!symbols) return null;

    return (
      <div key={categoryName} className="mb-3">
        <div className="text-xs text-muted-foreground mb-1.5 font-medium">
          {categoryName}
        </div>
        <div className="flex flex-wrap gap-1">
          {symbols.map((symbol) => renderSymbolButton(symbol))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">IPA Keyboard</span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 px-2 text-xs">
              Close
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="vowels" className="text-xs">
              Vowels
            </TabsTrigger>
            <TabsTrigger value="consonants" className="text-xs">
              Consonants
            </TabsTrigger>
            <TabsTrigger value="markers" className="text-xs">
              Markers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vowels" className="mt-2 space-y-0">
            {tabCategories.vowels.map((cat) => renderCategory(cat))}
          </TabsContent>

          <TabsContent value="consonants" className="mt-2 space-y-0">
            {tabCategories.consonants.map((cat) => renderCategory(cat))}
          </TabsContent>

          <TabsContent value="markers" className="mt-2 space-y-0">
            {tabCategories.markers.map((cat) => renderCategory(cat))}
          </TabsContent>
        </Tabs>

        {/* Quick reference */}
        <div className="mt-3 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span> ˈ marks primary stress, ˌ marks secondary stress
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
