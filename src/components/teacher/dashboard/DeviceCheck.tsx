import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, Video } from 'lucide-react';

export const DeviceCheck = () => {
  const handleSpeedTest = () => {
    window.open('https://fast.com', '_blank');
  };

  const handleDeviceTest = () => {
    // Navigate to classroom with test mode
    window.open('/classroom?mode=test', '_blank');
  };

  return (
    <Card className="border border-green-200 shadow-sm bg-gradient-to-br from-green-50 to-teal-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-green-600" />
          Check your device
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button 
            onClick={handleSpeedTest}
            variant="outline"
            className="flex-1 border-green-300 hover:bg-green-100 hover:border-green-400"
          >
            <Wifi className="mr-2 h-4 w-4 text-green-600" />
            Internet speed
          </Button>
          <Button 
            onClick={handleDeviceTest}
            variant="outline"
            className="flex-1 border-green-300 hover:bg-green-100 hover:border-green-400"
          >
            <Video className="mr-2 h-4 w-4 text-green-600" />
            Audio & Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
