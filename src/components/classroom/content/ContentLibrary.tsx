
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Video, File, Eye, Trash2, Download, Plus } from "lucide-react";
import { ContentItem } from "./types";

interface ContentLibraryProps {
  contentItems: ContentItem[];
  selectedContent: ContentItem | null;
  onSelectContent: (item: ContentItem) => void;
  onPreviewFile?: (item: ContentItem) => void;
  onDeleteFile?: (id: string) => void;
  onAddToWhiteboard?: (item: ContentItem) => void;
}

export function ContentLibrary({ 
  contentItems, 
  selectedContent, 
  onSelectContent,
  onPreviewFile,
  onDeleteFile,
  onAddToWhiteboard
}: ContentLibraryProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={20} className="text-green-600" />;
      case 'video': return <Video size={20} className="text-blue-600" />;
      case 'pdf': return <FileText size={20} className="text-red-600" />;
      default: return <File size={20} className="text-gray-600" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (contentItems.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <File size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Content Yet</h3>
          <p className="text-gray-600">Upload files to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentItems.map((item) => (
          <Card 
            key={item.id} 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedContent?.id === item.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onSelectContent(item)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getFileIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate mb-1">
                  {item.title}
                </h4>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type.toUpperCase()}
                  </Badge>
                  {item.size && (
                    <span className="text-xs text-gray-500">
                      {formatFileSize(item.size)}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-3">
                  by {item.uploadedBy} • {item.timestamp.toLocaleDateString()}
                </p>
                
                <div className="flex gap-1">
                  {onAddToWhiteboard && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToWhiteboard(item);
                      }}
                      className="text-xs px-2 py-1 h-7"
                    >
                      <Plus size={12} className="mr-1" />
                      Add to Board
                    </Button>
                  )}
                  
                  {onPreviewFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewFile(item);
                      }}
                      className="text-xs px-2 py-1 h-7"
                    >
                      <Eye size={12} className="mr-1" />
                      Preview
                    </Button>
                  )}
                  
                  {onDeleteFile && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${item.title}?`)) {
                          onDeleteFile(item.id);
                        }
                      }}
                      className="text-xs px-2 py-1 h-7"
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
