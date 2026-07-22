
import { useState, useEffect, useCallback } from 'react';
import { fileService, ClassroomFile } from '@/services/fileService';
import { useToast } from '@/hooks/use-toast';

interface UseFileManagerProps {
  roomId: string;
  userId: string;
  userName: string;
  userRole: 'teacher' | 'student';
  category?: ClassroomFile['category'];
}

export function useFileManager({ 
  roomId, 
  userId, 
  userName, 
  userRole, 
  category 
}: UseFileManagerProps) {
  const [files, setFiles] = useState<ClassroomFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const fileList = await fileService.getFiles(roomId, category);
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [roomId, category, toast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const uploadFile = useCallback(async (
    file: File, 
    fileCategory: ClassroomFile['category'] = 'shared_file'
  ) => {
    try {
      setIsUploading(true);
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
      }

      const uploadedFile = await fileService.uploadFile(
        file,
        roomId,
        userId,
        userName,
        userRole,
        fileCategory
      );

      setFiles(prev => [uploadedFile, ...prev]);
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully`,
      });

      return uploadedFile;
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [roomId, userId, userName, userRole, toast]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId, userId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      
      toast({
        title: "File Deleted",
        description: "File has been removed successfully",
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  const downloadFile = useCallback(async (file: ClassroomFile) => {
    try {
      await fileService.downloadFile(file.file_url, file.file_name);
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    files,
    isLoading,
    isUploading,
    uploadFile,
    deleteFile,
    downloadFile,
    refreshFiles: loadFiles
  };
}
