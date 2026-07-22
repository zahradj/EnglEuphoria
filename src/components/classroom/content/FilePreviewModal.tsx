
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, FileText, Image, Video, File } from "lucide-react";
import { ContentItem } from "./types";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: ContentItem | null;
  onDelete?: (id: string) => void;
  onDownload?: (file: ContentItem) => void;
}

export function FilePreviewModal({
  isOpen,
  onClose,
  file,
  onDelete,
  onDownload
}: FilePreviewModalProps) {
  if (!file) return null;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={24} className="text-green-600" />;
      case 'video': return <Video size={24} className="text-blue-600" />;
      case 'pdf': return <FileText size={24} className="text-red-600" />;
      default: return <File size={24} className="text-gray-600" />;
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(file.id);
      onClose();
    }
  };

  const renderContent = () => {
    switch (file.type) {
      case 'image':
        return (
          <div className="flex justify-center bg-gray-50 rounded-lg p-4">
            <img 
              src={file.source} 
              alt={file.title}
              className="max-w-full max-h-96 object-contain rounded"
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <video 
              src={file.source} 
              controls 
              className="w-full max-h-96 rounded"
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FileText size={64} className="mx-auto mb-4 text-red-600" />
            <p className="text-lg font-semibold mb-2">{file.title}</p>
            <p className="text-sm text-gray-600">PDF Document</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleDownload}
            >
              <Download size={16} className="mr-2" />
              Download PDF
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <File size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-semibold mb-2">{file.title}</p>
            <p className="text-sm text-gray-600">Document</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getFileIcon(file.type)}
            <div>
              <DialogTitle className="text-left">{file.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {file.type.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  by {file.uploadedBy}
                </span>
                <span className="text-sm text-gray-500">
                  {file.timestamp.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {renderContent()}
          
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            
            {onDownload && (
              <Button variant="outline" onClick={handleDownload}>
                <Download size={16} className="mr-2" />
                Download
              </Button>
            )}
            
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
