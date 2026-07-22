import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { z } from "zod";
import { Youtube, FileText, Globe, Link, Video, Play } from "lucide-react";
import { detectContentType, isEmbeddable } from "./ContentTypeDetector";

interface EmbedLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEmbed: (data: { url: string; title: string; type: string; x: number; y: number }) => void;
  clickPosition?: { x: number; y: number };
}

// Input validation schema with security checks
const embedSchema = z.object({
  url: z
    .string()
    .trim()
    .nonempty({ message: "URL cannot be empty" })
    .url({ message: "Please enter a valid URL" })
    .max(2048, { message: "URL must be less than 2048 characters" })
    .refine((url) => {
      // Security check: only allow https URLs and common educational domains
      return url.startsWith('https://') || 
             url.includes('youtube.com') || 
             url.includes('vimeo.com') ||
             url.includes('khan-academy.org') ||
             url.includes('quizlet.com') ||
             url.includes('kahoot.com');
    }, { message: "For security, only HTTPS URLs and educational sites are allowed" }),
  title: z
    .string()
    .trim()
    .nonempty({ message: "Title cannot be empty" })
    .max(100, { message: "Title must be less than 100 characters" })
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, { message: "Title contains invalid characters" })
});

export function EmbedLinkDialog({ isOpen, onClose, onEmbed, clickPosition }: EmbedLinkDialogProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return Youtube;
      case 'vimeo': return Video;
      case 'docs': return FileText;
      case 'webpage': return Globe;
      default: return Link;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'youtube': return 'bg-red-100 text-red-700';
      case 'vimeo': return 'bg-blue-100 text-blue-700';
      case 'docs': return 'bg-green-100 text-green-700';
      case 'webpage': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validate input
      const validatedData = embedSchema.parse({ url, title });
      
      // Detect content type
      const contentTypeInfo = detectContentType(validatedData.url);
      
      // Use click position or default center
      const x = clickPosition?.x || 100;
      const y = clickPosition?.y || 100;
      
      onEmbed({ 
        url: validatedData.url, 
        title: validatedData.title || contentTypeInfo.title,
        type: contentTypeInfo.type,
        x, 
        y 
      });
      
      toast.success("Content embedded successfully!");
      handleClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || "Invalid input";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to embed content");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setTitle("");
    setIsLoading(false);
    onClose();
  };

  const contentTypeInfo = detectContentType(url);
  const TypeIcon = getTypeIcon(contentTypeInfo.type);
  const embeddable = isEmbeddable(url);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Embed Content</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for the content..."
              maxLength={100}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              maxLength={2048}
              required
            />
            
            {url && (
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getTypeColor(contentTypeInfo.type)}`}>
                  <TypeIcon size={10} className="mr-1" />
                  {contentTypeInfo.type}
                </Badge>
                {embeddable && (
                  <Badge variant="outline" className="text-xs">
                    <Play size={10} className="mr-1" />
                    Embeddable
                  </Badge>
                )}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              For security, only HTTPS URLs and educational sites are allowed
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !url || !title}>
              {isLoading ? "Embedding..." : "Embed Content"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}