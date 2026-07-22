
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SoundButton } from "@/components/ui/sound-button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Youtube, FileText, Gamepad2, Trash2, Move } from "lucide-react";

interface EmbeddedContent {
  id: string;
  type: 'youtube' | 'docs' | 'game' | 'website';
  title: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EmbeddedContentManagerProps {
  isTeacher: boolean;
  contents: EmbeddedContent[];
  onAddContent: (content: Omit<EmbeddedContent, 'id'>) => void;
  onRemoveContent: (id: string) => void;
  onUpdateContent: (id: string, updates: Partial<EmbeddedContent>) => void;
}

export function EmbeddedContentManager({
  isTeacher,
  contents,
  onAddContent,
  onRemoveContent,
  onUpdateContent
}: EmbeddedContentManagerProps) {
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const detectContentType = (url: string): EmbeddedContent['type'] => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('docs.google.com')) return 'docs';
    if (url.includes('quizizz.com') || url.includes('kahoot.com')) return 'game';
    return 'website';
  };

  const getEmbedUrl = (url: string, type: EmbeddedContent['type']): string => {
    switch (type) {
      case 'youtube':
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      case 'docs':
        return url.replace('/edit', '/preview');
      default:
        return url;
    }
  };

  const addContent = () => {
    if (!newUrl.trim() || !newTitle.trim()) return;

    const type = detectContentType(newUrl);
    const embedUrl = getEmbedUrl(newUrl, type);

    const content: Omit<EmbeddedContent, 'id'> = {
      type,
      title: newTitle,
      url: embedUrl,
      x: 100,
      y: 100,
      width: type === 'youtube' ? 640 : 800,
      height: type === 'youtube' ? 360 : 600
    };

    onAddContent(content);
    setNewUrl("");
    setNewTitle("");
  };

  const getTypeIcon = (type: EmbeddedContent['type']) => {
    switch (type) {
      case 'youtube': return Youtube;
      case 'docs': return FileText;
      case 'game': return Gamepad2;
      default: return ExternalLink;
    }
  };

  const getTypeColor = (type: EmbeddedContent['type']) => {
    switch (type) {
      case 'youtube': return 'bg-red-100 text-red-700';
      case 'docs': return 'bg-blue-100 text-blue-700';
      case 'game': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="p-4 h-full flex flex-col">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <ExternalLink size={16} />
        Embedded Content
      </h3>

      {/* Add Content Form - Teacher Only */}
      {isTeacher && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Add New Content</h4>
          <div className="space-y-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Content title..."
            />
            <div className="flex gap-2">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Paste URL (YouTube, Google Docs, etc.)..."
                onKeyDown={(e) => e.key === 'Enter' && addContent()}
              />
              <SoundButton 
                onClick={addContent}
                disabled={!newUrl.trim() || !newTitle.trim()}
                soundType="success"
              >
                Add
              </SoundButton>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {contents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ExternalLink size={32} className="mx-auto mb-2 opacity-50" />
            <p>No embedded content yet</p>
            {isTeacher && <p className="text-sm">Add content using the form above</p>}
          </div>
        ) : (
          contents.map((content) => {
            const IconComponent = getTypeIcon(content.type);
            return (
              <Card key={content.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent size={14} />
                      <h4 className="font-medium text-sm">{content.title}</h4>
                      <Badge className={`text-xs ${getTypeColor(content.type)}`}>
                        {content.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{content.url}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {content.width}×{content.height} at ({content.x}, {content.y})
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <SoundButton
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(content.url, '_blank')}
                    >
                      <ExternalLink size={12} />
                    </SoundButton>
                    
                    {isTeacher && (
                      <SoundButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => onRemoveContent(content.id)}
                        soundType="error"
                      >
                        <Trash2 size={12} />
                      </SoundButton>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Card>
  );
}
