import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, Image, Video, Music, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
}

interface SmartUploaderProps {
  onFileSelected: (file: UploadedFile) => void;
  onCancel: () => void;
}

export const SmartUploader = ({ onFileSelected, onCancel }: SmartUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const getFileType = (file: File): UploadedFile['type'] => {
    const mimeType = file.type;
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'image': return <Image className="h-8 w-8 text-green-500" />;
      case 'video': return <Video className="h-8 w-8 text-purple-500" />;
      case 'audio': return <Music className="h-8 w-8 text-orange-500" />;
      case 'document': return <FileText className="h-8 w-8 text-blue-500" />;
      default: return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const type = getFileType(file);
    const uploadedFile: UploadedFile = { file, type };

    if (type === 'image') {
      uploadedFile.preview = URL.createObjectURL(file);
    }

    setUploadedFile(uploadedFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleContinue = () => {
    if (uploadedFile) {
      onFileSelected(uploadedFile);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Step 1: Upload Asset
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedFile ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Drag and drop your file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports images, videos, audio, PDFs, and documents
            </p>
            <label>
              <input
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx"
              />
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-4">
              {uploadedFile.preview ? (
                <img 
                  src={uploadedFile.preview} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                getFileIcon(uploadedFile.type)
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{uploadedFile.file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(uploadedFile.file.size)} • {uploadedFile.type.toUpperCase()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setUploadedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!uploadedFile}
          >
            Continue to Tagging
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
