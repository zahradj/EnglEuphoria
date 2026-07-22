
import React from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SoundButton } from "@/components/ui/sound-button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Youtube, FileText, Gamepad2 } from "lucide-react";

interface EmbedLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  setUrl: (url: string) => void;
  title: string;
  setTitle: (title: string) => void;
  onEmbed: () => void;
}

export function EmbedLinkDialog({
  isOpen,
  onClose,
  url,
  setUrl,
  title,
  setTitle,
  onEmbed
}: EmbedLinkDialogProps) {
  const detectContentType = (url: string) => {
    if (!url || typeof url !== 'string') return 'website';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('docs.google.com')) return 'docs';
    if (url.includes('quizizz.com') || url.includes('kahoot.com')) return 'game';
    return 'website';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return Youtube;
      case 'docs': return FileText;
      case 'game': return Gamepad2;
      default: return ExternalLink;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'youtube': return 'bg-red-100 text-red-700';
      case 'docs': return 'bg-blue-100 text-blue-700';
      case 'game': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const contentType = detectContentType(url);
  const IconComponent = getTypeIcon(contentType);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ExternalLink size={20} />
          Embed Link to Whiteboard
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Content Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this content..."
          />
        </div>
        
        <div>
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste URL (YouTube, Google Docs, etc.)..."
            onKeyDown={(e) => e.key === 'Enter' && onEmbed()}
          />
        </div>
        
        {url && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <IconComponent size={16} />
            <span className="text-sm text-gray-600">Detected:</span>
            <Badge className={`text-xs ${getTypeColor(contentType)}`}>
              {contentType}
            </Badge>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <SoundButton 
            onClick={onEmbed}
            disabled={!url.trim() || !title.trim()}
            soundType="success"
          >
            Embed Content
          </SoundButton>
        </div>
      </div>
    </DialogContent>
  );
}
