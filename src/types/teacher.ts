
export interface TeacherEquipmentTest {
  id: string;
  application_id: string;
  microphone_test: boolean;
  speaker_test: boolean;
  webcam_test: boolean;
  screen_sharing_test: boolean;
  download_speed?: number;
  upload_speed?: number;
  ping_latency?: number;
  overall_passed: boolean;
  test_completed_at: string;
  created_at: string;
}

export interface TeacherInterview {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration: number;
  interviewer_id?: string;
  interview_type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  interview_notes?: string;
  rating?: number;
  approved: boolean;
  zoom_link?: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherOnboardingProgress {
  id: string;
  application_id: string;
  step_name: string;
  completed: boolean;
  completed_at?: string;
  data?: any;
  created_at: string;
}

export type TeacherApplicationStage = 
  | 'application_submitted'
  | 'documents_review'
  | 'equipment_test'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'final_review'
  | 'approved'
  | 'rejected';
