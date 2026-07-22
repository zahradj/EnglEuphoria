export interface MLPrediction {
  id: string;
  student_id: string;
  prediction_type: 'success_probability' | 'dropout_risk' | 'optimal_difficulty' | 'learning_style';
  prediction_value: Record<string, any>;
  confidence_score?: number;
  model_version?: string;
  features_used?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface LearningAnalyticsEvent {
  id: string;
  student_id: string;
  event_type: 'session_start' | 'session_end' | 'content_interaction' | 'quiz_attempt' | 'quiz_completed' | 'help_requested';
  event_data: Record<string, any>;
  session_id?: string;
  content_id?: string;
  learning_context?: Record<string, any>;
  performance_metrics?: Record<string, any>;
  created_at: string;
}

export interface AIInsight {
  id: string;
  student_id?: string;
  teacher_id?: string;
  insight_type: 'learning_pattern' | 'recommendation' | 'warning' | 'achievement' | 'suggestion';
  insight_content: string;
  insight_data?: Record<string, any>;
  priority_level: 1 | 2 | 3 | 4; // 1=low, 2=medium, 3=high, 4=critical
  is_actionable: boolean;
  action_taken: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LearningPattern {
  id: string;
  student_id: string;
  pattern_type: 'study_time' | 'difficulty_preference' | 'content_type' | 'engagement_style';
  pattern_data: Record<string, any>;
  confidence_score?: number;
  detected_at: string;
  last_observed: string;
  observation_count: number;
}

export interface LearningIntervention {
  id: string;
  student_id: string;
  teacher_id?: string;
  trigger_type: 'low_engagement' | 'poor_performance' | 'streak_break' | 'inactivity';
  intervention_type: 'reminder' | 'content_suggestion' | 'difficulty_adjustment' | 'motivational_message';
  intervention_data: Record<string, any>;
  status: 'pending' | 'delivered' | 'acknowledged' | 'completed';
  effectiveness_score?: number;
  scheduled_for?: string;
  delivered_at?: string;
  created_at: string;
}

export interface SmartRecommendation {
  id: string;
  student_id: string;
  recommendation_type: 'content' | 'study_schedule' | 'learning_path' | 'skill_focus';
  recommendation_data: Record<string, any>;
  reasoning?: Record<string, any>;
  priority_score?: number;
  accepted?: boolean;
  feedback_score?: number; // 1-5 rating
  created_at: string;
  expires_at?: string;
  viewed_at?: string;
  acted_upon_at?: string;
}

export interface AdvancedAISession {
  id: string;
  student_id: string;
  session_context: Record<string, any>;
  conversation_history: Array<Record<string, any>>;
  ai_personality: 'encouraging' | 'challenging' | 'analytical' | 'supportive';
  emotional_state?: Record<string, any>;
  learning_objectives?: Record<string, any>;
  session_quality_score?: number;
  started_at: string;
  ended_at?: string;
  total_interactions: number;
  created_at: string;
}

export interface ContentAnalytics {
  id: string;
  content_id: string;
  content_type: 'lesson' | 'quiz' | 'exercise' | 'video';
  analytics_data: Record<string, any>;
  student_cohort?: 'beginner' | 'intermediate' | 'advanced';
  time_period: 'daily' | 'weekly' | 'monthly';
  performance_metrics?: Record<string, any>;
  date_recorded: string;
  created_at: string;
}

export interface LearningPatternAnalysis {
  type: string;
  data: Record<string, any>;
  confidence: number;
  recommendations: string[];
}

export interface PredictiveInsight {
  student_id: string;
  success_probability: number;
  risk_factors: string[];
  recommended_actions: string[];
  confidence: number;
}