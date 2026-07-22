import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Mail, Shield, Database, Palette } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    siteName: 'EnglEuphoria',
    adminEmail: 'admin@engleuphoria.com',
    enableRegistration: true,
    enablePayments: true,
    maintenanceMode: false,
    autoApproveTeachers: false,
    requireEmailVerification: true,
    maxClassSize: 1,
    platformFeePercentage: 60,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              General
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* User Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              User Management
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                </div>
                <Switch
                  checked={settings.enableRegistration}
                  onCheckedChange={(checked) => setSettings({...settings, enableRegistration: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify email before accessing platform</p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Teachers</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve teacher applications</p>
                </div>
                <Switch
                  checked={settings.autoApproveTeachers}
                  onCheckedChange={(checked) => setSettings({...settings, autoApproveTeachers: checked})}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Platform Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Platform
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxClassSize">Max Class Size</Label>
                <Input
                  id="maxClassSize"
                  type="number"
                  value={settings.maxClassSize}
                  onChange={(e) => setSettings({...settings, maxClassSize: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Fee (%)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  value={settings.platformFeePercentage}
                  onChange={(e) => setSettings({...settings, platformFeePercentage: parseInt(e.target.value) || 60})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Payments</Label>
                  <p className="text-sm text-muted-foreground">Process payments for lessons</p>
                </div>
                <Switch
                  checked={settings.enablePayments}
                  onCheckedChange={(checked) => setSettings({...settings, enablePayments: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};