
import { supabase } from '@/lib/supabase';

export interface ClassroomFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploader_name: string;
  uploader_role: 'teacher' | 'student';
  room_id: string;
  created_at: string;
  is_public: boolean;
  category: 'lesson_material' | 'homework' | 'shared_file' | 'whiteboard_export';
}

class FileService {
  async uploadFile(
    file: File,
    roomId: string,
    uploaderId: string,
    uploaderName: string,
    uploaderRole: 'teacher' | 'student',
    category: ClassroomFile['category'] = 'shared_file'
  ): Promise<ClassroomFile> {
    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `classroom-files/${roomId}/${category}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('classroom-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('classroom-files')
        .getPublicUrl(filePath);

      // Save file metadata to database
      const { data, error: dbError } = await supabase
        .from('classroom_files')
        .insert({
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: uploaderId,
          uploader_name: uploaderName,
          uploader_role: uploaderRole,
          room_id: roomId,
          category,
          is_public: category === 'lesson_material' || uploaderRole === 'teacher'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getFiles(roomId: string, category?: ClassroomFile['category']): Promise<ClassroomFile[]> {
    try {
      let query = supabase
        .from('classroom_files')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch files:', error);
      return [];
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      // First, get file info to check permissions and get storage path
      const { data: fileData, error: fetchError } = await supabase
        .from('classroom_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user can delete (owner or teacher)
      if (fileData.uploaded_by !== userId) {
        // Additional check: is user a teacher in this room?
        // This would require room membership data - for now, only allow owners
        throw new Error('Permission denied');
      }

      // Extract storage path from URL
      const urlParts = fileData.file_url.split('/');
      const storagePathStart = urlParts.findIndex(part => part === 'classroom-files');
      if (storagePathStart === -1) throw new Error('Invalid file URL');
      
      const storagePath = urlParts.slice(storagePathStart + 1).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('classroom-files')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('classroom_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  async downloadFile(fileUrl: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Get file type icon/color
  getFileIcon(fileType: string): { icon: string; color: string } {
    if (fileType.startsWith('image/')) return { icon: '🖼️', color: 'text-green-600' };
    if (fileType.includes('pdf')) return { icon: '📄', color: 'text-red-600' };
    if (fileType.includes('word') || fileType.includes('.doc')) return { icon: '📝', color: 'text-blue-600' };
    if (fileType.includes('video/')) return { icon: '🎥', color: 'text-purple-600' };
    if (fileType.includes('audio/')) return { icon: '🎵', color: 'text-orange-600' };
    return { icon: '📁', color: 'text-gray-600' };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileService = new FileService();
