import { supabase } from '@/lib/supabase';

export interface TeacherProfileData {
  bio: string;
  video_url: string;
  specializations?: string[];
  languages_spoken?: string[];
  years_experience?: number;
  certificate_urls?: string[];
  accent?: string;
  profile_image_url?: string;
}

export interface TeacherProfile extends TeacherProfileData {
  id: string;
  user_id: string;
  profile_complete: boolean;
  can_teach: boolean;
  profile_approved_by_admin: boolean;
  created_at: string;
  updated_at: string;
}

export const teacherProfileService = {
  async getProfile(userId: string): Promise<TeacherProfile | null> {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      throw error;
    }
  },

  async createOrUpdateProfile(userId: string, profileData: TeacherProfileData): Promise<TeacherProfile> {
    try {
      const payload = {
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('teacher_profiles')
        .insert(payload)
        .select()
        .single();

      if (!insertError) {
        return insertedData;
      }

      if ((insertError as { code?: string }).code !== '23505') {
        throw insertError;
      }

      const { data: updatedData, error: updateError } = await supabase
        .from('teacher_profiles')
        .update(payload)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedData;
    } catch (error) {
      console.error('Error saving teacher profile:', error);
      throw error;
    }
  },

  async getApprovedTeachers(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_approved_teachers');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching approved teachers:', error);
      throw error;
    }
  },

  async uploadCertificate(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('teacher-certificates')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher-certificates')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading certificate:', error);
      throw error;
    }
  },

  validateVideoUrl(url: string): boolean {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    // Vimeo URL patterns  
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*#|.*\/videos\/)?([0-9]+)/;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url);
  },

  getEmbedUrl(url: string): string | null {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*#|.*\/videos\/)?([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  }
};