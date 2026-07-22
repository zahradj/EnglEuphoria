
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { VideoQualitySettings } from '@/services/video/advancedVideoFeatures';

interface VideoSettingsProps {
  currentSettings: VideoQualitySettings;
  onSettingsChange: (settings: VideoQualitySettings) => void;
  onClose: () => void;
}

export function VideoSettings({
  currentSettings,
  onSettingsChange,
  onClose
}: VideoSettingsProps) {
  const [settings, setSettings] = useState<VideoQualitySettings>(currentSettings);
  const [autoQuality, setAutoQuality] = useState(true);

  const qualityPresets = {
    low: { resolution: 'low' as const, frameRate: 15, bitrate: 300 },
    medium: { resolution: 'medium' as const, frameRate: 24, bitrate: 600 },
    high: { resolution: 'high' as const, frameRate: 30, bitrate: 1200 },
    hd: { resolution: 'hd' as const, frameRate: 30, bitrate: 2000 }
  };

  const handleQualityPreset = (preset: keyof typeof qualityPresets) => {
    const newSettings = qualityPresets[preset];
    setSettings(newSettings);
    setAutoQuality(false);
  };

  const handleApplySettings = () => {
    onSettingsChange(settings);
    onClose();
  };

  const getQualityLabel = (resolution: string) => {
    switch (resolution) {
      case 'low': return '240p';
      case 'medium': return '480p';  
      case 'high': return '720p';
      case 'hd': return '1080p';
      default: return 'Auto';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Video Settings
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Auto Quality */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-quality">Auto Quality</Label>
          <Switch
            id="auto-quality"
            checked={autoQuality}
            onCheckedChange={setAutoQuality}
          />
        </div>

        {/* Quality Presets */}
        {!autoQuality && (
          <div>
            <Label className="text-sm font-medium mb-3 block">Quality Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(qualityPresets).map(([key, preset]) => (
                <Button
                  key={key}
                  variant={settings.resolution === preset.resolution ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQualityPreset(key as keyof typeof qualityPresets)}
                  className="flex flex-col h-auto py-2"
                >
                  <span className="font-medium">{getQualityLabel(preset.resolution)}</span>
                  <span className="text-xs opacity-70">{preset.frameRate}fps</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Manual Settings */}
        {!autoQuality && (
          <>
            {/* Frame Rate */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Frame Rate: {settings.frameRate}fps
              </Label>
              <Slider
                value={[settings.frameRate]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, frameRate: value[0] }))}
                max={60}
                min={10}
                step={5}
                className="w-full"
              />
            </div>

            {/* Bitrate */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Bitrate: {settings.bitrate}kbps
              </Label>
              <Slider
                value={[settings.bitrate]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, bitrate: value[0] }))}
                max={3000}
                min={100}
                step={100}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Current Status */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-2">Current Settings</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {getQualityLabel(settings.resolution)}
            </Badge>
            <Badge variant="secondary">
              {settings.frameRate}fps
            </Badge>
            <Badge variant="secondary">
              {settings.bitrate}kbps
            </Badge>
          </div>
        </div>

        {/* Apply Button */}
        <Button onClick={handleApplySettings} className="w-full">
          Apply Settings
        </Button>
      </CardContent>
    </Card>
  );
}
