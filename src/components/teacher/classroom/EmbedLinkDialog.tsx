import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, ExternalLink, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmbedLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmbed: (url: string) => void;
}

export const EmbedLinkDialog: React.FC<EmbedLinkDialogProps> = ({
  open,
  onOpenChange,
  onEmbed
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (input: string): boolean => {
    try {
      const parsed = new URL(input);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    if (!validateUrl(processedUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    setError('');
    onEmbed(processedUrl);
    setUrl('');
    onOpenChange(false);
  };

  const quickLinks = [
    { name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/watch?v=...' },
    { name: 'Google Docs', icon: '📄', placeholder: 'https://docs.google.com/...' },
    { name: 'Canva', icon: '🎨', placeholder: 'https://canva.com/...' },
    { name: 'Wordwall', icon: '🎮', placeholder: 'https://wordwall.net/...' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            Embed External Link
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Embed a website, video, or interactive content directly in your classroom
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="embed-url">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="embed-url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://example.com"
                className="bg-gray-800 border-gray-700 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              {url && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUrl('')}
                  className="shrink-0 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400 text-xs">Popular platforms</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => setUrl(link.placeholder)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-left text-sm transition-colors"
                >
                  <span>{link.icon}</span>
                  <span className="text-gray-300">{link.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Alert className="bg-gray-800 border-gray-700">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-gray-400 text-xs">
              Some websites may block embedding. If the content doesn't load, 
              try using the direct link or a different platform.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Embed Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
