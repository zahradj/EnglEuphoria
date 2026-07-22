import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image, Video, File, X, FileSpreadsheet, Presentation } from "lucide-react";
import { SoundButton } from "@/components/ui/sound-button";
import { useToast } from "@/hooks/use-toast";

interface UploadFile {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'pdf' | 'other';
}

interface EnhancedUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: UploadFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function EnhancedUploadDialog({
  isOpen,
  onClose,
  onUpload,
  maxFiles = 5,
  maxSizeMB = 50,
  acceptedTypes = [
    'image/*', 
    'video/*', 
    'application/pdf', 
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
}: EnhancedUploadDialogProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileType = (file: File): UploadFile['type'] => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf';
    
    // Office documents - treat as PDF for viewing
    if (
      fileType.includes('document') || 
      fileType.includes('presentation') || 
      fileType.includes('spreadsheet') ||
      fileName.endsWith('.doc') || 
      fileName.endsWith('.docx') || 
      fileName.endsWith('.ppt') || 
      fileName.endsWith('.pptx') || 
      fileName.endsWith('.xls') || 
      fileName.endsWith('.xlsx')
    ) {
      return 'pdf';
    }
    
    return 'other';
  };

  const getFileIcon = (type: UploadFile['type'], fileName: string) => {
    const lowerFileName = fileName.toLowerCase();
    
    switch (type) {
      case 'image': 
        return <Image size={20} className="text-green-600" />;
      case 'video': 
        return <Video size={20} className="text-blue-600" />;
      case 'pdf': 
        if (lowerFileName.includes('ppt') || lowerFileName.includes('presentation')) {
          return <Presentation size={20} className="text-orange-600" />;
        }
        if (lowerFileName.includes('xls') || lowerFileName.includes('sheet')) {
          return <FileSpreadsheet size={20} className="text-green-600" />;
        }
        if (lowerFileName.includes('doc')) {
          return <FileText size={20} className="text-blue-600" />;
        }
        return <FileText size={20} className="text-red-600" />;
      default: 
        return <File size={20} className="text-gray-600" />;
    }
  };

  const getDisplayType = (type: UploadFile['type'], fileName: string): string => {
    const lowerFileName = fileName.toLowerCase();
    
    if (type === 'pdf') {
      if (lowerFileName.includes('ppt')) return 'PPT';
      if (lowerFileName.includes('xls')) return 'XLS';
      if (lowerFileName.includes('doc')) return 'DOC';
      return 'PDF';
    }
    
    return type.toUpperCase();
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds ${maxSizeMB}MB limit`,
        variant: "destructive"
      });
      return false;
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return fileType.startsWith(type.replace('*', ''));
      }
      return fileType === type;
    }) || fileName.endsWith('.doc') || fileName.endsWith('.docx') || 
        fileName.endsWith('.ppt') || fileName.endsWith('.pptx') ||
        fileName.endsWith('.xls') || fileName.endsWith('.xlsx');

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported file type`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < fileList.length && uploadFiles.length + newFiles.length < maxFiles; i++) {
      const file = fileList[i];
      
      if (!validateFile(file)) continue;

      const uploadFile: UploadFile = {
        file,
        type: getFileType(file)
      };

      // Create preview for images
      if (uploadFile.type === 'image') {
        uploadFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(uploadFile);
    }

    if (newFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files added",
        description: `${newFiles.length} file(s) ready for upload`
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  };

  const handleUpload = () => {
    if (uploadFiles.length === 0) return;
    
    onUpload(uploadFiles);
    setUploadFiles([]);
    onClose();
    
    toast({
      title: "Files uploaded!",
      description: `${uploadFiles.length} file(s) added to whiteboard`
    });
  };

  const handleClose = () => {
    // Clean up preview URLs
    uploadFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Files to Whiteboard</DialogTitle>
        </DialogHeader>

        {/* Drop Zone */}
        <Card 
          className={`border-2 border-dashed p-8 text-center transition-colors ${
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
        >
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            Drag and drop files here
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            or click to browse files
          </p>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
          />
          <div className="mt-4 text-xs text-gray-500">
            <p>Max {maxFiles} files, {maxSizeMB}MB each</p>
            <p>Supports: Images, Videos, PDFs, Word, PowerPoint, Excel</p>
          </div>
        </Card>

        {/* File Preview */}
        {uploadFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Selected Files ({uploadFiles.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadFiles.map((uploadFile, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-3">
                    {uploadFile.preview ? (
                      <img 
                        src={uploadFile.preview} 
                        alt={uploadFile.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                        {getFileIcon(uploadFile.type, uploadFile.file.name)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {uploadFile.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {getDisplayType(uploadFile.type, uploadFile.file.name)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <SoundButton 
            soundType="success"
            onClick={handleUpload}
            disabled={uploadFiles.length === 0}
            className="flex-1"
          >
            Upload {uploadFiles.length > 0 && `(${uploadFiles.length})`}
          </SoundButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
