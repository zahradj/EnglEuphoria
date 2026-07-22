
export interface TeacherProfile {
  id: string;
  user_id: string;
  bio: string;
  specializations: string[];
  accent: string;
  languages_spoken: string[];
  video_url: string;
  profile_image_url: string;
  hourly_rate_dzd: number;
  hourly_rate_eur: number;
  years_experience: number;
  rating: number;
  total_reviews: number;
  is_available: boolean;
  timezone: string;
  full_name?: string;
  payoneer_account_email?: string;
}
