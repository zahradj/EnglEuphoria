
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ExternalLink, Globe } from "lucide-react";

interface EmbeddedGameDialogProps {
  gameTitle: string;
  setGameTitle: (title: string) => void;
  gameUrl: string;
  setGameUrl: (url: string) => void;
  onAddGame: () => void;
}

export function EmbeddedGameDialog({
  gameTitle,
  setGameTitle,
  gameUrl,
  setGameUrl,
  onAddGame
}: EmbeddedGameDialogProps) {
  const handlePreview = () => {
    if (gameUrl) {
      const finalUrl = gameUrl.startsWith('http') ? gameUrl : `https://${gameUrl}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGame();
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Embed Educational Content
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Some content may be blocked by browser security policies. If embedding fails, 
            you can still access the content via a direct link.
          </AlertDescription>
        </Alert>
        
        <div>
          <label className="text-sm font-medium block mb-2">Content Title</label>
          <Input
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
            placeholder="Enter content title"
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-2">Content URL</label>
          <Input
            value={gameUrl}
            onChange={(e) => setGameUrl(e.target.value)}
            placeholder="https://scratch.mit.edu/projects/..."
            type="url"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Trusted domains: Scratch, Kahoot, Wordwall, YouTube, Khan Academy, PBS Kids, and other educational platforms
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Add Content
          </Button>
          {gameUrl && (
            <Button 
              type="button"
              variant="outline" 
              onClick={handlePreview}
              className="flex items-center gap-1"
            >
              <ExternalLink size={14} />
              Preview
            </Button>
          )}
        </div>
      </form>
    </DialogContent>
  );
}
