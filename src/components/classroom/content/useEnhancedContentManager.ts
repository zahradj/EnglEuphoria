import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContentItem, MaterialType } from "./types";

interface UploadFile {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'pdf' | 'other';
}

export function useEnhancedContentManager(
  initialContent: ContentItem[], 
  userName: string, 
  isTeacher: boolean
) {
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContent);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    initialContent.length > 0 ? initialContent[0] : null
  );
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<ContentItem | null>(null);
  
  const { toast } = useToast();

  // Enhanced file type detection for better document support
  const getFileType = (file: File): MaterialType => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Image files
    if (fileType.startsWith('image/')) {
      return 'image';
    }
    
    // Video files
    if (fileType.startsWith('video/')) {
      return 'video';
    }
    
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'pdf';
    }
    
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
      return 'pdf'; // Treat documents as PDF type for unified viewing
    }
    
    // Interactive content (games, web content)
    if (fileType.includes('html') || fileName.endsWith('.html')) {
      return 'interactive';
    }
    
    // Default to PDF for any other document-like files
    return 'pdf';
  };

  const handleEnhancedUpload = useCallback(async (uploadFiles: UploadFile[]) => {
    
    const newItems: ContentItem[] = await Promise.all(uploadFiles.map(async (uploadFile) => {
      const fileType = getFileType(uploadFile.file);
      let source: string;
      
      // Convert PDFs to data URLs to avoid Chrome blocking
      if (fileType === 'pdf' || uploadFile.file.type === 'application/pdf') {
        try {
          const reader = new FileReader();
          source = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(uploadFile.file);
          });
        } catch (error) {
          console.error('Failed to convert PDF to data URL:', error);
          // Fallback to blob URL
          source = URL.createObjectURL(uploadFile.file);
        }
      } else {
        source = URL.createObjectURL(uploadFile.file);
      }
      
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: fileType,
        title: uploadFile.file.name,
        source,
        uploadedBy: isTeacher ? "Teacher" : userName,
        timestamp: new Date(),
        size: uploadFile.file.size,
        fileType: uploadFile.file.type
      };
    }));

    setContentItems(prev => {
      const updated = [...prev, ...newItems];
      return updated;
    });
    
    if (newItems.length === 1) {
      setSelectedContent(newItems[0]);
    }

    toast({
      title: "Files uploaded successfully!",
      description: `${newItems.length} file(s) added to your library`
    });
  }, [isTeacher, userName, toast]);

  const handleFileDelete = useCallback((id: string) => {
    const fileToDelete = contentItems.find(item => item.id === id);
    
    if (fileToDelete) {
      // Clean up object URL if it exists
      if (fileToDelete.source.startsWith('blob:')) {
        URL.revokeObjectURL(fileToDelete.source);
      }
      
      setContentItems(prev => prev.filter(item => item.id !== id));
      
      // Update selected content if the deleted file was selected
      if (selectedContent?.id === id) {
        const remainingItems = contentItems.filter(item => item.id !== id);
        setSelectedContent(remainingItems.length > 0 ? remainingItems[0] : null);
      }

      toast({
        title: "File deleted",
        description: `${fileToDelete.title} has been removed`
      });
    }
  }, [contentItems, selectedContent, toast]);

  const handleFileDownload = useCallback((file: ContentItem) => {
    try {
      const link = document.createElement('a');
      link.href = file.source;
      link.download = file.title;
      link.target = '_blank';
      
      // For blob URLs, we need to handle differently
      if (file.source.startsWith('blob:')) {
        link.click();
      } else {
        // For external URLs, open in new tab
        window.open(file.source, '_blank');
      }

      toast({
        title: "Download started",
        description: `Downloading ${file.title}`
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive"
      });
    }
  }, [toast]);

  const openUploadDialog = useCallback(() => {
    setIsUploadDialogOpen(true);
  }, []);

  const closeUploadDialog = useCallback(() => {
    setIsUploadDialogOpen(false);
  }, []);

  const openPreview = useCallback((file: ContentItem) => {
    setPreviewFile(file);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  // Legacy methods for backward compatibility
  const handleUpload = useCallback((type: MaterialType) => {
    openUploadDialog();
  }, [openUploadDialog]);

  const handleEmbedVideo = useCallback(() => {
    const url = prompt("Enter YouTube or video URL:");
    if (url) {
      const newItem: ContentItem = {
        id: Date.now().toString(),
        type: "video",
        title: "Embedded Video",
        source: url,
        uploadedBy: isTeacher ? "Teacher" : userName,
        timestamp: new Date()
      };
      setContentItems(prev => [...prev, newItem]);
      setSelectedContent(newItem);
    }
  }, [isTeacher, userName]);

  const handleAddGame = useCallback(() => {
    const gameUrl = prompt("Enter game/interactive content URL:");
    if (gameUrl) {
      const newItem: ContentItem = {
        id: Date.now().toString(),
        type: "interactive",
        title: "Interactive Game",
        source: gameUrl,
        uploadedBy: isTeacher ? "Teacher" : userName,
        timestamp: new Date()
      };
      setContentItems(prev => [...prev, newItem]);
      setSelectedContent(newItem);
    }
  }, [isTeacher, userName]);

  return {
    contentItems,
    selectedContent,
    setSelectedContent,
    
    // Enhanced upload methods
    isUploadDialogOpen,
    openUploadDialog,
    closeUploadDialog,
    handleEnhancedUpload,
    
    // File management
    previewFile,
    openPreview,
    closePreview,
    handleFileDelete,
    handleFileDownload,
    
    // Legacy methods
    handleUpload,
    handleEmbedVideo,
    handleAddGame
  };
}
