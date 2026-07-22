import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Volume2, Key } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyDialog({ isOpen, onClose }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save the API key
      audioService.setElevenLabsApiKey(apiKey.trim());
      
      // Test the API key by playing a welcome message
      await audioService.generateVoiceMessage("Welcome! Voice rewards are now enabled.", 25);
      
      toast({
        title: "Success!",
        description: "ElevenLabs API key saved and voice rewards enabled!",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key. Please check and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-purple-600" />
            Enable Voice Rewards
          </DialogTitle>
          <DialogDescription>
            Enter your ElevenLabs API key to enable exciting voice congratulations and sound effects for student rewards.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apikey">ElevenLabs API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="apikey"
                type="password"
                placeholder="sk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Get your API key from:</p>
            <a 
              href="https://elevenlabs.io/app/speech-synthesis/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 underline"
            >
              ElevenLabs API Keys Dashboard
            </a>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Testing...' : 'Save & Test'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}