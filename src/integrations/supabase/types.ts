export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_arc_cohort_snapshots: {
        Row: {
          created_by: string | null
          declining: number
          declining_pct: number
          id: string
          improving: number
          mean_health: number | null
          mean_sample_size: number | null
          mean_slope: number | null
          recorded_at: string
          steady: number
          total: number
          unknown: number
          window_days: number
        }
        Insert: {
          created_by?: string | null
          declining: number
          declining_pct: number
          id?: string
          improving: number
          mean_health?: number | null
          mean_sample_size?: number | null
          mean_slope?: number | null
          recorded_at?: string
          steady: number
          total: number
          unknown: number
          window_days: number
        }
        Update: {
          created_by?: string | null
          declining?: number
          declining_pct?: number
          id?: string
          improving?: number
          mean_health?: number | null
          mean_sample_size?: number | null
          mean_slope?: number | null
          recorded_at?: string
          steady?: number
          total?: number
          unknown?: number
          window_days?: number
        }
        Relationships: []
      }
      academy_arc_sessions: {
        Row: {
          created_at: string
          hub: string
          id: string
          lesson_id: string
          recorded_at: string
          signals: Json
          student_id: string
          summary: Json
        }
        Insert: {
          created_at?: string
          hub?: string
          id?: string
          lesson_id: string
          recorded_at?: string
          signals?: Json
          student_id: string
          summary?: Json
        }
        Update: {
          created_at?: string
          hub?: string
          id?: string
          lesson_id?: string
          recorded_at?: string
          signals?: Json
          student_id?: string
          summary?: Json
        }
        Relationships: []
      }
      academy_coin_ledger: {
        Row: {
          block_id: string | null
          created_at: string
          delta: number
          id: string
          lesson_id: string | null
          reason: string
          student_id: string
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          delta: number
          id?: string
          lesson_id?: string | null
          reason: string
          student_id: string
        }
        Update: {
          block_id?: string | null
          created_at?: string
          delta?: number
          id?: string
          lesson_id?: string | null
          reason?: string
          student_id?: string
        }
        Relationships: []
      }
      accessories: {
        Row: {
          created_at: string
          description: string | null
          hub_requirement: string
          id: string
          image_url: string | null
          level_id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hub_requirement: string
          id?: string
          image_url?: string | null
          level_id: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hub_requirement?: string
          id?: string
          image_url?: string | null
          level_id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accessories_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "curriculum_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_shares: {
        Row: {
          achievement_id: string
          achievement_tier_id: string | null
          comments_count: number
          id: string
          likes_count: number
          share_message: string | null
          share_platform: string
          shared_at: string
          student_id: string
        }
        Insert: {
          achievement_id: string
          achievement_tier_id?: string | null
          comments_count?: number
          id?: string
          likes_count?: number
          share_message?: string | null
          share_platform: string
          shared_at?: string
          student_id: string
        }
        Update: {
          achievement_id?: string
          achievement_tier_id?: string | null
          comments_count?: number
          id?: string
          likes_count?: number
          share_message?: string | null
          share_platform?: string
          shared_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_shares_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievement_shares_achievement_tier_id_fkey"
            columns: ["achievement_tier_id"]
            isOneToOne: false
            referencedRelation: "achievement_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_tiers: {
        Row: {
          achievement_id: string
          coin_reward: number
          created_at: string
          id: string
          requirements: Json
          tier_level: number
          tier_name: string
          unlock_requirements: Json | null
          xp_reward: number
        }
        Insert: {
          achievement_id: string
          coin_reward?: number
          created_at?: string
          id?: string
          requirements?: Json
          tier_level: number
          tier_name: string
          unlock_requirements?: Json | null
          xp_reward?: number
        }
        Update: {
          achievement_id?: string
          coin_reward?: number
          created_at?: string
          id?: string
          requirements?: Json
          tier_level?: number
          tier_name?: string
          unlock_requirements?: Json | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "achievement_tiers_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          requirements: Json
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          requirements?: Json
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          requirements?: Json
          xp_reward?: number
        }
        Relationships: []
      }
      adaptive_content: {
        Row: {
          ai_generated: boolean | null
          archived_at: string | null
          archived_reason: string | null
          avg_completion_time: number | null
          cefr_level: string
          content_data: Json
          content_type: string
          created_at: string | null
          created_by: string | null
          difficulty_level: number | null
          estimated_duration: number | null
          generation_prompt: string | null
          id: string
          is_active: boolean | null
          learning_objectives: string[]
          prerequisites: string[] | null
          success_rate: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          archived_at?: string | null
          archived_reason?: string | null
          avg_completion_time?: number | null
          cefr_level: string
          content_data: Json
          content_type: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          generation_prompt?: string | null
          id?: string
          is_active?: boolean | null
          learning_objectives: string[]
          prerequisites?: string[] | null
          success_rate?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          archived_at?: string | null
          archived_reason?: string | null
          avg_completion_time?: number | null
          cefr_level?: string
          content_data?: Json
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          generation_prompt?: string | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[]
          prerequisites?: string[] | null
          success_rate?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          title: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          title: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_secrets: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          secret_hash: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          secret_hash: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          secret_hash?: string
          used?: boolean | null
        }
        Relationships: []
      }
      ai_conversation_messages: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          content: string | null
          created_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          processing_time_ms: number | null
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          processing_time_ms?: number | null
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_tutoring_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_topics: {
        Row: {
          category: string
          cefr_level: string
          context_prompts: Json | null
          created_at: string | null
          difficulty_score: number | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          topic_text: string
          usage_count: number | null
        }
        Insert: {
          category: string
          cefr_level: string
          context_prompts?: Json | null
          created_at?: string | null
          difficulty_score?: number | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          topic_text: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          cefr_level?: string
          context_prompts?: Json | null
          created_at?: string | null
          difficulty_score?: number | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          topic_text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      ai_learning_events: {
        Row: {
          content_id: string | null
          created_at: string | null
          difficulty_rating: number | null
          event_data: Json
          event_type: string
          help_requested: boolean | null
          id: string
          performance_score: number | null
          session_id: string | null
          student_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          difficulty_rating?: number | null
          event_data?: Json
          event_type: string
          help_requested?: boolean | null
          id?: string
          performance_score?: number | null
          session_id?: string | null
          student_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          difficulty_rating?: number | null
          event_data?: Json
          event_type?: string
          help_requested?: boolean | null
          id?: string
          performance_score?: number | null
          session_id?: string | null
          student_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_events_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "adaptive_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_tutoring_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_learning_models: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          last_updated_at: string | null
          model_data: Json
          model_type: string
          student_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_updated_at?: string | null
          model_data?: Json
          model_type: string
          student_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_updated_at?: string | null
          model_data?: Json
          model_type?: string
          student_id?: string
        }
        Relationships: []
      }
      ai_lesson_artifacts: {
        Row: {
          artifact_type: string
          created_at: string
          format: string
          id: string
          lesson_id: string
          metadata: Json | null
          public_url: string | null
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_type: string
          created_at?: string
          format: string
          id?: string
          lesson_id: string
          metadata?: Json | null
          public_url?: string | null
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_type?: string
          created_at?: string
          format?: string
          id?: string
          lesson_id?: string
          metadata?: Json | null
          public_url?: string | null
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_lesson_artifacts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "ai_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_lesson_artifacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_lessons: {
        Row: {
          age_range: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          level: string
          objectives: string[] | null
          script: Json | null
          status: string | null
          title: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          level: string
          objectives?: string[] | null
          script?: Json | null
          status?: string | null
          title?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          level?: string
          objectives?: string[] | null
          script?: Json | null
          status?: string | null
          title?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_lessons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_lessons_ppp: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          level: string | null
          level_id: string | null
          ppp_content: Json
          status: string | null
          system_type: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string | null
          level_id?: string | null
          ppp_content: Json
          status?: string | null
          system_type: string
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string | null
          level_id?: string | null
          ppp_content?: Json
          status?: string | null
          system_type?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_lessons_ppp_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_lessons_ppp_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "curriculum_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutoring_sessions: {
        Row: {
          ai_model: string | null
          cefr_level: string
          completed_objectives: string[] | null
          conversation_id: string
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          feedback_notes: string | null
          id: string
          learning_objectives: string[] | null
          messages_count: number | null
          session_data: Json | null
          session_rating: number | null
          session_type: string
          started_at: string | null
          student_id: string
          topic: string | null
          voice_model: string | null
        }
        Insert: {
          ai_model?: string | null
          cefr_level: string
          completed_objectives?: string[] | null
          conversation_id: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          feedback_notes?: string | null
          id?: string
          learning_objectives?: string[] | null
          messages_count?: number | null
          session_data?: Json | null
          session_rating?: number | null
          session_type: string
          started_at?: string | null
          student_id: string
          topic?: string | null
          voice_model?: string | null
        }
        Update: {
          ai_model?: string | null
          cefr_level?: string
          completed_objectives?: string[] | null
          conversation_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          feedback_notes?: string | null
          id?: string
          learning_objectives?: string[] | null
          messages_count?: number | null
          session_data?: Json | null
          session_rating?: number | null
          session_type?: string
          started_at?: string | null
          student_id?: string
          topic?: string | null
          voice_model?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          organization_id: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_tuning_log: {
        Row: {
          after_state: Json
          before_state: Json
          created_at: string
          delta: Json
          engine: string
          id: string
          lesson_id: string | null
          reason: string | null
          student_id: string
        }
        Insert: {
          after_state?: Json
          before_state?: Json
          created_at?: string
          delta?: Json
          engine: string
          id?: string
          lesson_id?: string | null
          reason?: string | null
          student_id: string
        }
        Update: {
          after_state?: Json
          before_state?: Json
          created_at?: string
          delta?: Json
          engine?: string
          id?: string
          lesson_id?: string | null
          reason?: string | null
          student_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          availability_id: string | null
          created_at: string | null
          duration: number | null
          hub_type: string | null
          id: string
          lesson_id: string | null
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string | null
          student_id: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          availability_id?: string | null
          created_at?: string | null
          duration?: number | null
          hub_type?: string | null
          id?: string
          lesson_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string | null
          student_id: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          availability_id?: string | null
          created_at?: string | null
          duration?: number | null
          hub_type?: string | null
          id?: string
          lesson_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          student_id?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "teacher_availability"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_games_catalog: {
        Row: {
          active: boolean
          category: string
          cefr_max: string
          cefr_min: string
          ceiling_seconds: number
          character_slots: number
          created_at: string
          description: string | null
          display_name: string
          game_type: string
          hub_allow: string[]
          id: string
          skill_focus: string[]
          supports_multiplayer: boolean
          supports_speaking: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          cefr_max?: string
          cefr_min?: string
          ceiling_seconds?: number
          character_slots?: number
          created_at?: string
          description?: string | null
          display_name: string
          game_type: string
          hub_allow?: string[]
          id: string
          skill_focus?: string[]
          supports_multiplayer?: boolean
          supports_speaking?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          cefr_max?: string
          cefr_min?: string
          ceiling_seconds?: number
          character_slots?: number
          created_at?: string
          description?: string | null
          display_name?: string
          game_type?: string
          hub_allow?: string[]
          id?: string
          skill_focus?: string[]
          supports_multiplayer?: boolean
          supports_speaking?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      arcade_multiplayer_rooms: {
        Row: {
          cefr: string
          created_at: string
          game_id: string | null
          host_user_id: string
          hub: string
          id: string
          lesson_id: string | null
          max_players: number
          mode: string
          room_code: string
          status: string
          updated_at: string
        }
        Insert: {
          cefr: string
          created_at?: string
          game_id?: string | null
          host_user_id: string
          hub: string
          id?: string
          lesson_id?: string | null
          max_players?: number
          mode?: string
          room_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          cefr?: string
          created_at?: string
          game_id?: string | null
          host_user_id?: string
          hub?: string
          id?: string
          lesson_id?: string | null
          max_players?: number
          mode?: string
          room_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      arcade_room_participants: {
        Row: {
          id: string
          joined_at: string
          left_at: string | null
          role: string
          room_id: string
          score: number
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          room_id: string
          score?: number
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          room_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arcade_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "arcade_multiplayer_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_rounds: {
        Row: {
          bravery_bonus: boolean
          correct: boolean
          created_at: string
          game_id: string
          id: string
          latency_ms: number
          mastery_delta: number
          payload: Json
          reinforcement_source: string | null
          retries: number
          session_id: string
          skill_kind: string | null
          speaking_used: boolean
          target_ref: string | null
        }
        Insert: {
          bravery_bonus?: boolean
          correct?: boolean
          created_at?: string
          game_id: string
          id?: string
          latency_ms?: number
          mastery_delta?: number
          payload?: Json
          reinforcement_source?: string | null
          retries?: number
          session_id: string
          skill_kind?: string | null
          speaking_used?: boolean
          target_ref?: string | null
        }
        Update: {
          bravery_bonus?: boolean
          correct?: boolean
          created_at?: string
          game_id?: string
          id?: string
          latency_ms?: number
          mastery_delta?: number
          payload?: Json
          reinforcement_source?: string | null
          retries?: number
          session_id?: string
          skill_kind?: string | null
          speaking_used?: boolean
          target_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_rounds_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "arcade_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_sessions: {
        Row: {
          accuracy: number
          cefr: string
          completed_at: string | null
          created_at: string
          hesitation_ms_avg: number
          hub: string
          id: string
          lesson_id: string | null
          mode: string
          rounds_count: number
          score: number
          source: string
          speaking_attempts: number
          started_at: string
          student_id: string
          updated_at: string
          xp_awarded: number
        }
        Insert: {
          accuracy?: number
          cefr: string
          completed_at?: string | null
          created_at?: string
          hesitation_ms_avg?: number
          hub: string
          id?: string
          lesson_id?: string | null
          mode?: string
          rounds_count?: number
          score?: number
          source?: string
          speaking_attempts?: number
          started_at?: string
          student_id: string
          updated_at?: string
          xp_awarded?: number
        }
        Update: {
          accuracy?: number
          cefr?: string
          completed_at?: string | null
          created_at?: string
          hesitation_ms_avg?: number
          hub?: string
          id?: string
          lesson_id?: string | null
          mode?: string
          rounds_count?: number
          score?: number
          source?: string
          speaking_attempts?: number
          started_at?: string
          student_id?: string
          updated_at?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      arcade_tournament_entries: {
        Row: {
          created_at: string
          id: string
          rank: number | null
          score: number
          tournament_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rank?: number | null
          score?: number
          tournament_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rank?: number | null
          score?: number
          tournament_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arcade_tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_tournaments: {
        Row: {
          active: boolean
          cefr_band: string
          created_at: string
          ends_at: string
          hub: string
          id: string
          prize_xp: number
          season: string
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          cefr_band: string
          created_at?: string
          ends_at: string
          hub: string
          id?: string
          prize_xp?: number
          season: string
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          cefr_band?: string
          created_at?: string
          ends_at?: string
          hub?: string
          id?: string
          prize_xp?: number
          season?: string
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      architect_runs: {
        Row: {
          cefr: string
          created_at: string
          created_by: string | null
          critic_findings: Json | null
          duration_ms: number | null
          hub: string
          id: string
          lesson_ref: string
          model: string | null
          overrides: Json | null
          passes: number
          rationale: string | null
          status: string
          student_id: string | null
          tool_calls: Json
        }
        Insert: {
          cefr: string
          created_at?: string
          created_by?: string | null
          critic_findings?: Json | null
          duration_ms?: number | null
          hub: string
          id?: string
          lesson_ref: string
          model?: string | null
          overrides?: Json | null
          passes?: number
          rationale?: string | null
          status: string
          student_id?: string | null
          tool_calls?: Json
        }
        Update: {
          cefr?: string
          created_at?: string
          created_by?: string | null
          critic_findings?: Json | null
          duration_ms?: number | null
          hub?: string
          id?: string
          lesson_ref?: string
          model?: string | null
          overrides?: Json | null
          passes?: number
          rationale?: string | null
          status?: string
          student_id?: string | null
          tool_calls?: Json
        }
        Relationships: []
      }
      assessment_answers: {
        Row: {
          answer_audio_url: string | null
          answer_text: string | null
          created_at: string
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          answer_audio_url?: string | null
          answer_text?: string | null
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          answer_audio_url?: string | null
          answer_text?: string | null
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions_student"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assessment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          audio_url: string | null
          correct_answer: string | null
          created_at: string
          id: string
          metadata: Json | null
          options: Json | null
          points: number
          question_order: number
          question_text: string
          question_type: string
          rubric: string | null
        }
        Insert: {
          assessment_id: string
          audio_url?: string | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          options?: Json | null
          points?: number
          question_order: number
          question_text: string
          question_type: string
          rubric?: string | null
        }
        Update: {
          assessment_id?: string
          audio_url?: string | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          options?: Json | null
          points?: number
          question_order?: number
          question_text?: string
          question_type?: string
          rubric?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_rubrics: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          criteria: Json
          description: string | null
          id: string
          max_score: number
          rubric_data: Json | null
          rubric_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          max_score: number
          rubric_data?: Json | null
          rubric_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          max_score?: number
          rubric_data?: Json | null
          rubric_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_rubrics_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "eca_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_submissions: {
        Row: {
          assessment_id: string
          created_at: string
          graded_at: string | null
          id: string
          metadata: Json | null
          passed: boolean | null
          percentage: number | null
          started_at: string
          status: string
          student_id: string
          submitted_at: string | null
          time_taken_minutes: number | null
          total_score: number | null
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          graded_at?: string | null
          id?: string
          metadata?: Json | null
          passed?: boolean | null
          percentage?: number | null
          started_at?: string
          status?: string
          student_id: string
          submitted_at?: string | null
          time_taken_minutes?: number | null
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          graded_at?: string | null
          id?: string
          metadata?: Json | null
          passed?: boolean | null
          percentage?: number | null
          started_at?: string
          status?: string
          student_id?: string
          submitted_at?: string | null
          time_taken_minutes?: number | null
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_type: string
          cefr_level: string
          created_at: string
          description: string | null
          due_date: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          metadata: Json | null
          passing_score: number
          published_at: string | null
          teacher_id: string
          title: string
          total_points: number
          updated_at: string
        }
        Insert: {
          assessment_type: string
          cefr_level: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          passing_score?: number
          published_at?: string | null
          teacher_id: string
          title: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          assessment_type?: string
          cefr_level?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          passing_score?: number
          published_at?: string | null
          teacher_id?: string
          title?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_insights: {
        Row: {
          computed_at: string
          details: Json
          flag: string | null
          id: string
          metric: string
          p50: number | null
          p90: number | null
          sample_size: number
          scope: Json
        }
        Insert: {
          computed_at?: string
          details?: Json
          flag?: string | null
          id?: string
          metric: string
          p50?: number | null
          p90?: number | null
          sample_size?: number
          scope: Json
        }
        Update: {
          computed_at?: string
          details?: Json
          flag?: string | null
          id?: string
          metric?: string
          p50?: number | null
          p90?: number | null
          sample_size?: number
          scope?: Json
        }
        Relationships: []
      }
      bonus_policy: {
        Row: {
          id: boolean
          kicker_max_pct: number
          kicker_pct_each: number
          kicker_threshold: number
          tier_elite_pct: number
          tier_elite_threshold: number
          tier_excellent_pct: number
          tier_excellent_threshold: number
          tier_ontrack_pct: number
          tier_ontrack_threshold: number
          tier_strong_pct: number
          tier_strong_threshold: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: boolean
          kicker_max_pct?: number
          kicker_pct_each?: number
          kicker_threshold?: number
          tier_elite_pct?: number
          tier_elite_threshold?: number
          tier_excellent_pct?: number
          tier_excellent_threshold?: number
          tier_ontrack_pct?: number
          tier_ontrack_threshold?: number
          tier_strong_pct?: number
          tier_strong_threshold?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: boolean
          kicker_max_pct?: number
          kicker_pct_each?: number
          kicker_threshold?: number
          tier_elite_pct?: number
          tier_elite_threshold?: number
          tier_excellent_pct?: number
          tier_excellent_threshold?: number
          tier_ontrack_pct?: number
          tier_ontrack_threshold?: number
          tier_strong_pct?: number
          tier_strong_threshold?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          admin_id: string
          created_at: string
          delivery_method: string[]
          id: string
          message: string
          metadata: Json | null
          recipients_count: number
          status: string
          target_audience: string
          title: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          delivery_method?: string[]
          id?: string
          message: string
          metadata?: Json | null
          recipients_count?: number
          status?: string
          target_audience: string
          title: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          delivery_method?: string[]
          id?: string
          message?: string
          metadata?: Json | null
          recipients_count?: number
          status?: string
          target_audience?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cast_vault_characters: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          hub: string
          id: string
          is_shared: boolean
          name: string
          personality_traits: Json
          role: string | null
          signature_traits: Json
          updated_at: string
          visual_blueprint: Json
          voice_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          hub: string
          id?: string
          is_shared?: boolean
          name: string
          personality_traits?: Json
          role?: string | null
          signature_traits?: Json
          updated_at?: string
          visual_blueprint?: Json
          voice_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          hub?: string
          id?: string
          is_shared?: boolean
          name?: string
          personality_traits?: Json
          role?: string | null
          signature_traits?: Json
          updated_at?: string
          visual_blueprint?: Json
          voice_id?: string | null
        }
        Relationships: []
      }
      cat_items: {
        Row: {
          audio_url: string | null
          audio_url_kids: string | null
          cefr: string
          correct_index: number
          created_at: string
          id: string
          option_audio_urls: Json | null
          option_image_urls: Json | null
          options: Json
          partial_indices: Json | null
          prompt: string
          skill: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          audio_url_kids?: string | null
          cefr: string
          correct_index: number
          created_at?: string
          id: string
          option_audio_urls?: Json | null
          option_image_urls?: Json | null
          options: Json
          partial_indices?: Json | null
          prompt: string
          skill: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          audio_url_kids?: string | null
          cefr?: string
          correct_index?: number
          created_at?: string
          id?: string
          option_audio_urls?: Json | null
          option_image_urls?: Json | null
          options?: Json
          partial_indices?: Json | null
          prompt?: string
          skill?: string
          updated_at?: string
        }
        Relationships: []
      }
      celebration_events: {
        Row: {
          created_at: string
          id: string
          payload: Json
          shown_at: string | null
          student_id: string
          trigger_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          shown_at?: string | null
          student_id: string
          trigger_type: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          shown_at?: string | null
          student_id?: string
          trigger_type?: string
        }
        Relationships: []
      }
      certificate_templates: {
        Row: {
          accent_color: string | null
          background_url: string | null
          cefr_level: string | null
          created_at: string
          created_by: string | null
          description: string | null
          design_config: Json
          heading: string | null
          hub: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          subheading: string | null
          template_type: string
          text_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          background_url?: string | null
          cefr_level?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          design_config?: Json
          heading?: string | null
          hub?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          subheading?: string | null
          template_type: string
          text_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          background_url?: string | null
          cefr_level?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          design_config?: Json
          heading?: string | null
          hub?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          subheading?: string | null
          template_type?: string
          text_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          cefr_level: string | null
          certificate_number: string
          certificate_type: string
          created_at: string
          description: string | null
          hours_completed: number | null
          id: string
          is_verified: boolean | null
          issue_date: string
          metadata: Json | null
          pdf_url: string | null
          score_achieved: number | null
          skills_demonstrated: string[] | null
          student_id: string
          teacher_id: string | null
          title: string
          updated_at: string
          verification_code: string
        }
        Insert: {
          cefr_level?: string | null
          certificate_number: string
          certificate_type: string
          created_at?: string
          description?: string | null
          hours_completed?: number | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string
          metadata?: Json | null
          pdf_url?: string | null
          score_achieved?: number | null
          skills_demonstrated?: string[] | null
          student_id: string
          teacher_id?: string | null
          title: string
          updated_at?: string
          verification_code: string
        }
        Update: {
          cefr_level?: string | null
          certificate_number?: string
          certificate_type?: string
          created_at?: string
          description?: string | null
          hours_completed?: number | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string
          metadata?: Json | null
          pdf_url?: string | null
          score_achieved?: number | null
          skills_demonstrated?: string[] | null
          student_id?: string
          teacher_id?: string | null
          title?: string
          updated_at?: string
          verification_code?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          message_type: string | null
          room_id: string
          sender_id: string
          sender_name: string
          sender_role: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          room_id: string
          sender_id: string
          sender_name: string
          sender_role: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          room_id?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      class_bookings: {
        Row: {
          booking_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          classroom_id: string
          created_at: string
          currency: string
          curriculum_lesson_id: string | null
          duration: number
          ended_at: string | null
          hub_type: string | null
          id: string
          lesson_id: string | null
          market_region: Database["public"]["Enums"]["market_region"]
          meeting_link: string | null
          notes: string | null
          price_paid: number
          scheduled_at: string
          session_id: string | null
          status: string
          student_id: string
          subscription_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          booking_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          classroom_id?: string
          created_at?: string
          currency?: string
          curriculum_lesson_id?: string | null
          duration?: number
          ended_at?: string | null
          hub_type?: string | null
          id?: string
          lesson_id?: string | null
          market_region?: Database["public"]["Enums"]["market_region"]
          meeting_link?: string | null
          notes?: string | null
          price_paid?: number
          scheduled_at: string
          session_id?: string | null
          status?: string
          student_id: string
          subscription_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          booking_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          classroom_id?: string
          created_at?: string
          currency?: string
          curriculum_lesson_id?: string | null
          duration?: number
          ended_at?: string | null
          hub_type?: string | null
          id?: string
          lesson_id?: string | null
          market_region?: Database["public"]["Enums"]["market_region"]
          meeting_link?: string | null
          notes?: string | null
          price_paid?: number
          scheduled_at?: string
          session_id?: string | null
          status?: string
          student_id?: string
          subscription_id?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_bookings_curriculum_lesson_id_fkey"
            columns: ["curriculum_lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_files: {
        Row: {
          category: string | null
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_public: boolean | null
          room_id: string
          updated_at: string | null
          uploaded_by: string
          uploader_name: string
          uploader_role: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_public?: boolean | null
          room_id: string
          updated_at?: string | null
          uploaded_by: string
          uploader_name: string
          uploader_role: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean | null
          room_id?: string
          updated_at?: string | null
          uploaded_by?: string
          uploader_name?: string
          uploader_role?: string
        }
        Relationships: []
      }
      classroom_incident_verdicts: {
        Row: {
          confidence: number | null
          created_at: string
          fault_party: string
          id: string
          model: string | null
          recommended_action: string | null
          reports_considered: Json
          room_id: string
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          fault_party: string
          id?: string
          model?: string | null
          recommended_action?: string | null
          reports_considered?: Json
          room_id: string
          status: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          fault_party?: string
          id?: string
          model?: string | null
          recommended_action?: string | null
          reports_considered?: Json
          room_id?: string
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      classroom_resolutions: {
        Row: {
          booking_id: string | null
          credit_refunded: boolean
          final_status: string
          id: string
          notes: string | null
          resolution_type: string
          resolved_at: string
          resolved_by: string
          session_id: string
          student_id: string | null
          teacher_id: string
          teacher_pay_amount: number
          teacher_pay_pct: number
        }
        Insert: {
          booking_id?: string | null
          credit_refunded?: boolean
          final_status: string
          id?: string
          notes?: string | null
          resolution_type: string
          resolved_at?: string
          resolved_by: string
          session_id: string
          student_id?: string | null
          teacher_id: string
          teacher_pay_amount?: number
          teacher_pay_pct?: number
        }
        Update: {
          booking_id?: string | null
          credit_refunded?: boolean
          final_status?: string
          id?: string
          notes?: string | null
          resolution_type?: string
          resolved_at?: string
          resolved_by?: string
          session_id?: string
          student_id?: string | null
          teacher_id?: string
          teacher_pay_amount?: number
          teacher_pay_pct?: number
        }
        Relationships: []
      }
      classroom_session_heartbeats: {
        Row: {
          connection_quality: string | null
          id: string
          pinged_at: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          connection_quality?: string | null
          id?: string
          pinged_at?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          connection_quality?: string | null
          id?: string
          pinged_at?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      classroom_sessions: {
        Row: {
          active_canvas_tab: string | null
          active_tool: string | null
          ai_verdict: string | null
          ai_verdict_at: string | null
          booking_id: string | null
          connection_health: string | null
          created_at: string
          current_poll_slide_id: string | null
          current_quiz_slide_id: string | null
          current_slide_index: number | null
          dice_value: number | null
          disconnect_reason: string | null
          duration_minutes: number | null
          embedded_url: string | null
          ended_at: string | null
          fault_type: string | null
          force_refresh_timestamp: number | null
          id: string
          is_milestone: boolean | null
          is_screen_sharing: boolean | null
          lesson_id: string | null
          lesson_slides: Json | null
          lesson_title: string | null
          lesson_type: string
          market_region: Database["public"]["Enums"]["market_region"]
          poll_active: boolean | null
          poll_show_results: boolean | null
          quiz_active: boolean | null
          quiz_locked: boolean | null
          quiz_reveal_answer: boolean | null
          room_id: string
          scheduled_at: string | null
          session_context: Json | null
          session_status: string
          shared_notes: string | null
          show_star_celebration: boolean | null
          star_count: number | null
          started_at: string | null
          student_can_draw: boolean | null
          student_id: string | null
          student_joined_at: string | null
          student_last_ping_at: string | null
          student_left_at: string | null
          teacher_id: string
          teacher_joined_at: string | null
          teacher_last_ping_at: string | null
          teacher_left_at: string | null
          timer_running: boolean | null
          timer_value: number | null
          updated_at: string
        }
        Insert: {
          active_canvas_tab?: string | null
          active_tool?: string | null
          ai_verdict?: string | null
          ai_verdict_at?: string | null
          booking_id?: string | null
          connection_health?: string | null
          created_at?: string
          current_poll_slide_id?: string | null
          current_quiz_slide_id?: string | null
          current_slide_index?: number | null
          dice_value?: number | null
          disconnect_reason?: string | null
          duration_minutes?: number | null
          embedded_url?: string | null
          ended_at?: string | null
          fault_type?: string | null
          force_refresh_timestamp?: number | null
          id?: string
          is_milestone?: boolean | null
          is_screen_sharing?: boolean | null
          lesson_id?: string | null
          lesson_slides?: Json | null
          lesson_title?: string | null
          lesson_type?: string
          market_region?: Database["public"]["Enums"]["market_region"]
          poll_active?: boolean | null
          poll_show_results?: boolean | null
          quiz_active?: boolean | null
          quiz_locked?: boolean | null
          quiz_reveal_answer?: boolean | null
          room_id: string
          scheduled_at?: string | null
          session_context?: Json | null
          session_status?: string
          shared_notes?: string | null
          show_star_celebration?: boolean | null
          star_count?: number | null
          started_at?: string | null
          student_can_draw?: boolean | null
          student_id?: string | null
          student_joined_at?: string | null
          student_last_ping_at?: string | null
          student_left_at?: string | null
          teacher_id: string
          teacher_joined_at?: string | null
          teacher_last_ping_at?: string | null
          teacher_left_at?: string | null
          timer_running?: boolean | null
          timer_value?: number | null
          updated_at?: string
        }
        Update: {
          active_canvas_tab?: string | null
          active_tool?: string | null
          ai_verdict?: string | null
          ai_verdict_at?: string | null
          booking_id?: string | null
          connection_health?: string | null
          created_at?: string
          current_poll_slide_id?: string | null
          current_quiz_slide_id?: string | null
          current_slide_index?: number | null
          dice_value?: number | null
          disconnect_reason?: string | null
          duration_minutes?: number | null
          embedded_url?: string | null
          ended_at?: string | null
          fault_type?: string | null
          force_refresh_timestamp?: number | null
          id?: string
          is_milestone?: boolean | null
          is_screen_sharing?: boolean | null
          lesson_id?: string | null
          lesson_slides?: Json | null
          lesson_title?: string | null
          lesson_type?: string
          market_region?: Database["public"]["Enums"]["market_region"]
          poll_active?: boolean | null
          poll_show_results?: boolean | null
          quiz_active?: boolean | null
          quiz_locked?: boolean | null
          quiz_reveal_answer?: boolean | null
          room_id?: string
          scheduled_at?: string | null
          session_context?: Json | null
          session_status?: string
          shared_notes?: string | null
          show_star_celebration?: boolean | null
          star_count?: number | null
          started_at?: string | null
          student_can_draw?: boolean | null
          student_id?: string | null
          student_joined_at?: string | null
          student_last_ping_at?: string | null
          student_left_at?: string | null
          teacher_id?: string
          teacher_joined_at?: string | null
          teacher_last_ping_at?: string | null
          teacher_left_at?: string | null
          timer_running?: boolean | null
          timer_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      classroom_states: {
        Row: {
          active_game_state: Json
          active_media_state: Json
          attempt_count: number
          correct_count: number
          created_at: string
          current_slide_index: number
          ended_at: string | null
          id: string
          is_interview: boolean
          lesson_id: string | null
          mock_lesson_key: string | null
          session_id: string
          session_struggles: Json
          started_at: string | null
          status: string
          student_cursor_position: Json | null
          student_rewards: number
          supplemental_ref: Json | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          active_game_state?: Json
          active_media_state?: Json
          attempt_count?: number
          correct_count?: number
          created_at?: string
          current_slide_index?: number
          ended_at?: string | null
          id?: string
          is_interview?: boolean
          lesson_id?: string | null
          mock_lesson_key?: string | null
          session_id: string
          session_struggles?: Json
          started_at?: string | null
          status?: string
          student_cursor_position?: Json | null
          student_rewards?: number
          supplemental_ref?: Json | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          active_game_state?: Json
          active_media_state?: Json
          attempt_count?: number
          correct_count?: number
          created_at?: string
          current_slide_index?: number
          ended_at?: string | null
          id?: string
          is_interview?: boolean
          lesson_id?: string | null
          mock_lesson_key?: string | null
          session_id?: string
          session_struggles?: Json
          started_at?: string | null
          status?: string
          student_cursor_position?: Json | null
          student_rewards?: number
          supplemental_ref?: Json | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      classroom_timeline_events: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          created_at: string
          event_payload: Json | null
          event_type: string
          id: string
          occurred_at: string
          room_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_payload?: Json | null
          event_type: string
          id?: string
          occurred_at?: string
          room_id: string
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_payload?: Json | null
          event_type?: string
          id?: string
          occurred_at?: string
          room_id?: string
        }
        Relationships: []
      }
      coherence_signals: {
        Row: {
          created_at: string
          game_engagement: number
          homework_completion_rate: number
          hub: string
          id: string
          reinforcement_coverage: number
          signals: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_engagement?: number
          homework_completion_rate?: number
          hub: string
          id?: string
          reinforcement_coverage?: number
          signals?: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_engagement?: number
          homework_completion_rate?: number
          hub?: string
          id?: string
          reinforcement_coverage?: number
          signals?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          banner_url: string | null
          category: Database["public"]["Enums"]["community_category"]
          cefr_level: string
          community_rules: string | null
          created_at: string | null
          created_by: string
          current_members: number | null
          description: string | null
          id: string
          is_active: boolean | null
          max_members: number | null
          name: string
          privacy_level: Database["public"]["Enums"]["community_privacy"] | null
          requires_approval: boolean | null
          tags: string[] | null
          updated_at: string | null
          weekly_goal_hours: number | null
        }
        Insert: {
          banner_url?: string | null
          category: Database["public"]["Enums"]["community_category"]
          cefr_level: string
          community_rules?: string | null
          created_at?: string | null
          created_by: string
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          name: string
          privacy_level?:
            | Database["public"]["Enums"]["community_privacy"]
            | null
          requires_approval?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          weekly_goal_hours?: number | null
        }
        Update: {
          banner_url?: string | null
          category?: Database["public"]["Enums"]["community_category"]
          cefr_level?: string
          community_rules?: string | null
          created_at?: string | null
          created_by?: string
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          name?: string
          privacy_level?:
            | Database["public"]["Enums"]["community_privacy"]
            | null
          requires_approval?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          weekly_goal_hours?: number | null
        }
        Relationships: []
      }
      community_challenge_participations: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          points_earned: number | null
          rank: number | null
          score: number | null
          submission_data: Json | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          rank?: number | null
          score?: number | null
          submission_data?: Json | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          rank?: number | null
          score?: number | null
          submission_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      community_challenges: {
        Row: {
          challenge_data: Json | null
          challenge_type: string
          community_id: string
          created_at: string | null
          created_by: string
          current_participants: number | null
          description: string
          difficulty_level: number | null
          end_date: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          reward_points: number | null
          start_date: string
          title: string
        }
        Insert: {
          challenge_data?: Json | null
          challenge_type: string
          community_id: string
          created_at?: string | null
          created_by: string
          current_participants?: number | null
          description: string
          difficulty_level?: number | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_points?: number | null
          start_date: string
          title: string
        }
        Update: {
          challenge_data?: Json | null
          challenge_type?: string
          community_id?: string
          created_at?: string | null
          created_by?: string
          current_participants?: number | null
          description?: string
          difficulty_level?: number | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_points?: number | null
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_challenges_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_event_participants: {
        Row: {
          attendance_status: string | null
          event_id: string
          feedback_notes: string | null
          feedback_rating: number | null
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          attendance_status?: string | null
          event_id: string
          feedback_notes?: string | null
          feedback_rating?: number | null
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          attendance_status?: string | null
          event_id?: string
          feedback_notes?: string | null
          feedback_rating?: number | null
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          community_id: string
          created_at: string | null
          current_participants: number | null
          description: string | null
          duration_minutes: number | null
          event_data: Json | null
          event_type: string
          id: string
          is_recurring: boolean | null
          max_participants: number | null
          organizer_id: string
          recurrence_pattern: Json | null
          requires_signup: boolean | null
          room_id: string | null
          scheduled_at: string
          status: string | null
          title: string
        }
        Insert: {
          community_id: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          event_data?: Json | null
          event_type: string
          id?: string
          is_recurring?: boolean | null
          max_participants?: number | null
          organizer_id: string
          recurrence_pattern?: Json | null
          requires_signup?: boolean | null
          room_id?: string | null
          scheduled_at: string
          status?: string | null
          title: string
        }
        Update: {
          community_id?: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          event_data?: Json | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          max_participants?: number | null
          organizer_id?: string
          recurrence_pattern?: Json | null
          requires_signup?: boolean | null
          room_id?: string | null
          scheduled_at?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          last_active_at: string | null
          role: Database["public"]["Enums"]["community_role"] | null
          status: string | null
          total_contributions: number | null
          user_id: string
          weekly_hours_contributed: number | null
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          role?: Database["public"]["Enums"]["community_role"] | null
          status?: string | null
          total_contributions?: number | null
          user_id: string
          weekly_hours_contributed?: number | null
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          role?: Database["public"]["Enums"]["community_role"] | null
          status?: string | null
          total_contributions?: number | null
          user_id?: string
          weekly_hours_contributed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_reply_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_reply_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_reply_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_post_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "community_post_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          community_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          post_type: string | null
          replies_count: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          community_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          replies_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          community_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          replies_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_generation_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_details: string | null
          failed_items: number
          id: string
          job_type: string
          metadata: Json
          processed_items: number
          progress_percentage: number
          started_at: string | null
          status: string
          total_items: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_details?: string | null
          failed_items?: number
          id?: string
          job_type: string
          metadata?: Json
          processed_items?: number
          progress_percentage?: number
          started_at?: string | null
          status?: string
          total_items?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_details?: string | null
          failed_items?: number
          id?: string
          job_type?: string
          metadata?: Json
          processed_items?: number
          progress_percentage?: number
          started_at?: string | null
          status?: string
          total_items?: number
          updated_at?: string
        }
        Relationships: []
      }
      creator_slide_comments: {
        Row: {
          author_name: string | null
          body: string
          created_at: string
          id: string
          lesson_id: string
          resolved: boolean
          slide_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          lesson_id: string
          resolved?: boolean
          slide_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          lesson_id?: string
          resolved?: boolean
          slide_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_packs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          original_price_eur: number
          price_eur: number
          savings_eur: number
          session_count: number
          sort_order: number
          student_level: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          original_price_eur: number
          price_eur: number
          savings_eur?: number
          session_count: number
          sort_order?: number
          student_level: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          original_price_eur?: number
          price_eur?: number
          savings_eur?: number
          session_count?: number
          sort_order?: number
          student_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          amount_paid: number
          created_at: string
          credits_purchased: number
          currency: string
          expires_at: string
          id: string
          pack_id: string
          payment_method: string | null
          purchased_at: string
          student_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          credits_purchased: number
          currency?: string
          expires_at?: string
          id?: string
          pack_id: string
          payment_method?: string | null
          purchased_at?: string
          student_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          credits_purchased?: number
          currency?: string
          expires_at?: string
          id?: string
          pack_id?: string
          payment_method?: string | null
          purchased_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "credit_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_agent_chat_messages: {
        Row: {
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Update: {
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      curriculum_agent_tasks: {
        Row: {
          attempts: number
          blueprint: Json | null
          cefr: string
          created_at: string
          created_by: string
          error: string | null
          hub: string
          id: string
          lesson_id: string | null
          lesson_index: number
          progress_stage: string | null
          qa_report: Json | null
          stabilization_report: Json | null
          status: string
          unit_slug: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          blueprint?: Json | null
          cefr: string
          created_at?: string
          created_by?: string
          error?: string | null
          hub: string
          id?: string
          lesson_id?: string | null
          lesson_index: number
          progress_stage?: string | null
          qa_report?: Json | null
          stabilization_report?: Json | null
          status?: string
          unit_slug: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          blueprint?: Json | null
          cefr?: string
          created_at?: string
          created_by?: string
          error?: string | null
          hub?: string
          id?: string
          lesson_id?: string | null
          lesson_index?: number
          progress_stage?: string | null
          qa_report?: Json | null
          stabilization_report?: Json | null
          status?: string
          unit_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      curriculum_exports: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expires_at: string | null
          file_name: string
          file_size_bytes: number | null
          format: string
          id: string
          lesson_count: number
          options: Json | null
          storage_path: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          file_name: string
          file_size_bytes?: number | null
          format: string
          id?: string
          lesson_count: number
          options?: Json | null
          storage_path: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          file_name?: string
          file_size_bytes?: number | null
          format?: string
          id?: string
          lesson_count?: number
          options?: Json | null
          storage_path?: string
        }
        Relationships: []
      }
      curriculum_feedback_signals: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          payload: Json
          signal_type: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          payload?: Json
          signal_type: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          payload?: Json
          signal_type?: string
          student_id?: string
        }
        Relationships: []
      }
      curriculum_lessons: {
        Row: {
          ai_metadata: Json | null
          content: Json | null
          created_at: string | null
          created_by: string | null
          cycle_type: string | null
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          flow_profile: string
          governance_report: Json | null
          governance_status: string
          grammar_package: Json | null
          grammar_pattern: string | null
          id: string
          image_style: string | null
          is_published: boolean | null
          is_review: boolean
          language: string | null
          lesson_state: Json | null
          level_id: string | null
          media_plan: Json | null
          order_index: number | null
          parent_lesson_id: string | null
          phonics_focus: string | null
          qa_checked_at: string | null
          qa_content_hash: string | null
          qa_report: Json | null
          qa_verdict: string | null
          sequence_order: number | null
          skills_focus: string[] | null
          slot_cefr_level: string | null
          slot_lesson_number: string | null
          slot_unit_number: string | null
          story_plan: Json | null
          target_system: string
          thumbnail_url: string | null
          title: string
          unit_id: string | null
          updated_at: string | null
          video_lesson_enabled: boolean
          video_lesson_id: string | null
          video_url: string | null
          vocabulary_list: Json | null
          xp_reward: number | null
        }
        Insert: {
          ai_metadata?: Json | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          cycle_type?: string | null
          description?: string | null
          difficulty_level: string
          duration_minutes?: number | null
          flow_profile?: string
          governance_report?: Json | null
          governance_status?: string
          grammar_package?: Json | null
          grammar_pattern?: string | null
          id?: string
          image_style?: string | null
          is_published?: boolean | null
          is_review?: boolean
          language?: string | null
          lesson_state?: Json | null
          level_id?: string | null
          media_plan?: Json | null
          order_index?: number | null
          parent_lesson_id?: string | null
          phonics_focus?: string | null
          qa_checked_at?: string | null
          qa_content_hash?: string | null
          qa_report?: Json | null
          qa_verdict?: string | null
          sequence_order?: number | null
          skills_focus?: string[] | null
          slot_cefr_level?: string | null
          slot_lesson_number?: string | null
          slot_unit_number?: string | null
          story_plan?: Json | null
          target_system: string
          thumbnail_url?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
          video_lesson_enabled?: boolean
          video_lesson_id?: string | null
          video_url?: string | null
          vocabulary_list?: Json | null
          xp_reward?: number | null
        }
        Update: {
          ai_metadata?: Json | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          cycle_type?: string | null
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          flow_profile?: string
          governance_report?: Json | null
          governance_status?: string
          grammar_package?: Json | null
          grammar_pattern?: string | null
          id?: string
          image_style?: string | null
          is_published?: boolean | null
          is_review?: boolean
          language?: string | null
          lesson_state?: Json | null
          level_id?: string | null
          media_plan?: Json | null
          order_index?: number | null
          parent_lesson_id?: string | null
          phonics_focus?: string | null
          qa_checked_at?: string | null
          qa_content_hash?: string | null
          qa_report?: Json | null
          qa_verdict?: string | null
          sequence_order?: number | null
          skills_focus?: string[] | null
          slot_cefr_level?: string | null
          slot_lesson_number?: string | null
          slot_unit_number?: string | null
          story_plan?: Json | null
          target_system?: string
          thumbnail_url?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
          video_lesson_enabled?: boolean
          video_lesson_id?: string | null
          video_url?: string | null
          vocabulary_list?: Json | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_lessons_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "curriculum_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_lessons_parent_lesson_id_fkey"
            columns: ["parent_lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "curriculum_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_lessons_video_lesson_id_fkey"
            columns: ["video_lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_levels: {
        Row: {
          age_group: string
          cefr_level: string
          created_at: string | null
          description: string
          estimated_hours: number | null
          id: string
          level_order: number
          name: string
          sequence_order: number | null
          target_system: string | null
          thumbnail_url: string | null
          track_id: string | null
          updated_at: string | null
          xp_required: number | null
        }
        Insert: {
          age_group: string
          cefr_level: string
          created_at?: string | null
          description: string
          estimated_hours?: number | null
          id?: string
          level_order: number
          name: string
          sequence_order?: number | null
          target_system?: string | null
          thumbnail_url?: string | null
          track_id?: string | null
          updated_at?: string | null
          xp_required?: number | null
        }
        Update: {
          age_group?: string
          cefr_level?: string
          created_at?: string | null
          description?: string
          estimated_hours?: number | null
          id?: string
          level_order?: number
          name?: string
          sequence_order?: number | null
          target_system?: string | null
          thumbnail_url?: string | null
          track_id?: string | null
          updated_at?: string | null
          xp_required?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_levels_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_materials: {
        Row: {
          business_mode: boolean | null
          cefr_level: string
          created_at: string | null
          description: string | null
          difficulty_rating: number | null
          downloads: number | null
          duration: number | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_age_appropriate: boolean | null
          is_public: boolean | null
          last_accessed: string | null
          level_id: string | null
          skill_focus: string[] | null
          tags: string[] | null
          theme: string | null
          title: string
          type: string
          updated_at: string | null
          uploaded_by: string | null
          views: number | null
          visibility: string | null
          xp_reward: number | null
        }
        Insert: {
          business_mode?: boolean | null
          cefr_level: string
          created_at?: string | null
          description?: string | null
          difficulty_rating?: number | null
          downloads?: number | null
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_age_appropriate?: boolean | null
          is_public?: boolean | null
          last_accessed?: string | null
          level_id?: string | null
          skill_focus?: string[] | null
          tags?: string[] | null
          theme?: string | null
          title: string
          type: string
          updated_at?: string | null
          uploaded_by?: string | null
          views?: number | null
          visibility?: string | null
          xp_reward?: number | null
        }
        Update: {
          business_mode?: boolean | null
          cefr_level?: string
          created_at?: string | null
          description?: string | null
          difficulty_rating?: number | null
          downloads?: number | null
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_age_appropriate?: boolean | null
          is_public?: boolean | null
          last_accessed?: string | null
          level_id?: string | null
          skill_focus?: string[] | null
          tags?: string[] | null
          theme?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          uploaded_by?: string | null
          views?: number | null
          visibility?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_materials_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "curriculum_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_programs: {
        Row: {
          age_group: string
          assessment_strategy: string | null
          cefr_level: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_weeks: number
          id: string
          is_published: boolean | null
          is_template: boolean | null
          learning_goals: string[] | null
          materials_overview: string | null
          program_data: Json | null
          program_type: string
          published_at: string | null
          target_students: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          age_group: string
          assessment_strategy?: string | null
          cefr_level: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_weeks?: number
          id?: string
          is_published?: boolean | null
          is_template?: boolean | null
          learning_goals?: string[] | null
          materials_overview?: string | null
          program_data?: Json | null
          program_type: string
          published_at?: string | null
          target_students?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          age_group?: string
          assessment_strategy?: string | null
          cefr_level?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_weeks?: number
          id?: string
          is_published?: boolean | null
          is_template?: boolean | null
          learning_goals?: string[] | null
          materials_overview?: string | null
          program_data?: Json | null
          program_type?: string
          published_at?: string | null
          target_students?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      curriculum_quick_actions: {
        Row: {
          age_group: string
          button_label: string
          category: string
          icon: string | null
          id: string
          mode: string
          order_index: number
          prompt_text: string
        }
        Insert: {
          age_group: string
          button_label: string
          category: string
          icon?: string | null
          id?: string
          mode?: string
          order_index: number
          prompt_text: string
        }
        Update: {
          age_group?: string
          button_label?: string
          category?: string
          icon?: string | null
          id?: string
          mode?: string
          order_index?: number
          prompt_text?: string
        }
        Relationships: []
      }
      curriculum_skills: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_age_appropriate: boolean | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_age_appropriate?: boolean | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_age_appropriate?: boolean | null
          name?: string
        }
        Relationships: []
      }
      curriculum_stabilization_signals: {
        Row: {
          consumed_at: string | null
          created_at: string
          id: string
          payload: Json
          signal_type: string
          student_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          id?: string
          payload?: Json
          signal_type: string
          student_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          id?: string
          payload?: Json
          signal_type?: string
          student_id?: string
        }
        Relationships: []
      }
      curriculum_units: {
        Row: {
          age_group: string
          assessment_methods: string[] | null
          cefr_level: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_weeks: number
          grammar_focus: string[] | null
          hub: string | null
          id: string
          is_published: boolean | null
          learning_objectives: string[]
          program_id: string | null
          skills_focus: string[] | null
          target_grammar: string | null
          target_vocabulary_pool: string[] | null
          theme: string | null
          title: string
          unit_data: Json | null
          unit_number: number
          updated_at: string | null
          vocabulary_themes: string[] | null
          world_id: string | null
          world_slug: string | null
        }
        Insert: {
          age_group: string
          assessment_methods?: string[] | null
          cefr_level: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_weeks?: number
          grammar_focus?: string[] | null
          hub?: string | null
          id?: string
          is_published?: boolean | null
          learning_objectives: string[]
          program_id?: string | null
          skills_focus?: string[] | null
          target_grammar?: string | null
          target_vocabulary_pool?: string[] | null
          theme?: string | null
          title: string
          unit_data?: Json | null
          unit_number: number
          updated_at?: string | null
          vocabulary_themes?: string[] | null
          world_id?: string | null
          world_slug?: string | null
        }
        Update: {
          age_group?: string
          assessment_methods?: string[] | null
          cefr_level?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_weeks?: number
          grammar_focus?: string[] | null
          hub?: string | null
          id?: string
          is_published?: boolean | null
          learning_objectives?: string[]
          program_id?: string | null
          skills_focus?: string[] | null
          target_grammar?: string | null
          target_vocabulary_pool?: string[] | null
          theme?: string | null
          title?: string
          unit_data?: Json | null
          unit_number?: number
          updated_at?: string | null
          vocabulary_themes?: string[] | null
          world_id?: string | null
          world_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_units_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "curriculum_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_units_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "curriculum_worlds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_units_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "world_engagement_summary"
            referencedColumns: ["world_id"]
          },
        ]
      }
      curriculum_worlds: {
        Row: {
          cefr_band: string
          created_at: string
          display_order: number
          emotional_tone: string
          gameplay_identity: string
          hub: string
          id: string
          mascots: Json
          music_mood: string | null
          name: string
          palette: Json
          slug: string
          suggested_activity_types: string[]
          topic_affinity: string[]
          updated_at: string
          visual_style: Json
        }
        Insert: {
          cefr_band?: string
          created_at?: string
          display_order?: number
          emotional_tone: string
          gameplay_identity: string
          hub?: string
          id?: string
          mascots?: Json
          music_mood?: string | null
          name: string
          palette?: Json
          slug: string
          suggested_activity_types?: string[]
          topic_affinity?: string[]
          updated_at?: string
          visual_style?: Json
        }
        Update: {
          cefr_band?: string
          created_at?: string
          display_order?: number
          emotional_tone?: string
          gameplay_identity?: string
          hub?: string
          id?: string
          mascots?: Json
          music_mood?: string | null
          name?: string
          palette?: Json
          slug?: string
          suggested_activity_types?: string[]
          topic_affinity?: string[]
          updated_at?: string
          visual_style?: Json
        }
        Relationships: []
      }
      custom_characters: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          hub: string
          id: string
          name: string
          personality_traits: string
          updated_at: string
          visual_blueprint: string
          voice_id: string | null
          voice_name: string | null
          voice_preview_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          hub: string
          id?: string
          name: string
          personality_traits?: string
          updated_at?: string
          visual_blueprint?: string
          voice_id?: string | null
          voice_name?: string | null
          voice_preview_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          hub?: string
          id?: string
          name?: string
          personality_traits?: string
          updated_at?: string
          visual_blueprint?: string
          voice_id?: string | null
          voice_name?: string | null
          voice_preview_url?: string | null
        }
        Relationships: []
      }
      daily_discovery_pool: {
        Row: {
          active: boolean
          game_payload: Json
          game_type: string
          hub: string
          id: string
          published_at: string
          source_lesson_id: string
          teacher_id: string
        }
        Insert: {
          active?: boolean
          game_payload: Json
          game_type: string
          hub: string
          id?: string
          published_at?: string
          source_lesson_id: string
          teacher_id: string
        }
        Update: {
          active?: boolean
          game_payload?: Json
          game_type?: string
          hub?: string
          id?: string
          published_at?: string
          source_lesson_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_discovery_pool_source_lesson_id_fkey"
            columns: ["source_lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_lessons: {
        Row: {
          content: Json
          created_at: string
          email_sent: boolean
          email_sent_at: string | null
          generated_at: string
          id: string
          lesson_date: string
          student_id: string
          student_level: string
          title: string
        }
        Insert: {
          content?: Json
          created_at?: string
          email_sent?: boolean
          email_sent_at?: string | null
          generated_at?: string
          id?: string
          lesson_date?: string
          student_id: string
          student_level?: string
          title: string
        }
        Update: {
          content?: Json
          created_at?: string
          email_sent?: boolean
          email_sent_at?: string | null
          generated_at?: string
          id?: string
          lesson_date?: string
          student_id?: string
          student_level?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dictionary_cache: {
        Row: {
          context_hash: string
          created_at: string
          definition: string
          id: string
          image_url: string | null
          language: string
          translation: string
          word: string
        }
        Insert: {
          context_hash: string
          created_at?: string
          definition: string
          id?: string
          image_url?: string | null
          language: string
          translation: string
          word: string
        }
        Update: {
          context_hash?: string
          created_at?: string
          definition?: string
          id?: string
          image_url?: string | null
          language?: string
          translation?: string
          word?: string
        }
        Relationships: []
      }
      early_learners_assets: {
        Row: {
          asset_type: string
          asset_url: string
          cache_key: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          prompt: string
        }
        Insert: {
          asset_type: string
          asset_url: string
          cache_key?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prompt: string
        }
        Update: {
          asset_type?: string
          asset_url?: string
          cache_key?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prompt?: string
        }
        Relationships: []
      }
      early_learners_lessons: {
        Row: {
          components: Json | null
          created_at: string | null
          created_by: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          gamification: Json | null
          id: string
          learning_objectives: Json
          lesson_number: number
          multimedia_manifest: Json | null
          phonics_focus: string
          status: string | null
          title: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          components?: Json | null
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          gamification?: Json | null
          id?: string
          learning_objectives?: Json
          lesson_number: number
          multimedia_manifest?: Json | null
          phonics_focus: string
          status?: string | null
          title: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          components?: Json | null
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          gamification?: Json | null
          id?: string
          learning_objectives?: Json
          lesson_number?: number
          multimedia_manifest?: Json | null
          phonics_focus?: string
          status?: string | null
          title?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      early_learners_progress: {
        Row: {
          attempts: number | null
          badges_earned: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          score: number | null
          slide_id: string | null
          stars_earned: number | null
          student_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          attempts?: number | null
          badges_earned?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          score?: number | null
          slide_id?: string | null
          stars_earned?: number | null
          student_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          attempts?: number | null
          badges_earned?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          score?: number | null
          slide_id?: string | null
          stars_earned?: number | null
          student_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "early_learners_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "early_learners_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_learners_progress_slide_id_fkey"
            columns: ["slide_id"]
            isOneToOne: false
            referencedRelation: "early_learners_slides"
            referencedColumns: ["id"]
          },
        ]
      }
      early_learners_slides: {
        Row: {
          audio_text: string | null
          audio_url: string | null
          content: Json
          created_at: string | null
          gamification: Json | null
          id: string
          image_prompt: string | null
          image_url: string | null
          interactive_elements: Json | null
          lesson_id: string
          phonics_sounds: Json | null
          slide_number: number
          slide_type: string
          title: string | null
        }
        Insert: {
          audio_text?: string | null
          audio_url?: string | null
          content?: Json
          created_at?: string | null
          gamification?: Json | null
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          interactive_elements?: Json | null
          lesson_id: string
          phonics_sounds?: Json | null
          slide_number: number
          slide_type: string
          title?: string | null
        }
        Update: {
          audio_text?: string | null
          audio_url?: string | null
          content?: Json
          created_at?: string | null
          gamification?: Json | null
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          interactive_elements?: Json | null
          lesson_id?: string
          phonics_sounds?: Json | null
          slide_number?: number
          slide_type?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "early_learners_slides_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "early_learners_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      eca_assessments: {
        Row: {
          age_group: string
          assessment_data: Json | null
          assessment_type: string
          cefr_level: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          instructions: string | null
          is_published: boolean | null
          is_template: boolean | null
          passing_score: number | null
          questions: Json
          skills_assessed: string[] | null
          title: string
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          age_group: string
          assessment_data?: Json | null
          assessment_type: string
          cefr_level: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          is_template?: boolean | null
          passing_score?: number | null
          questions?: Json
          skills_assessed?: string[] | null
          title: string
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          age_group?: string
          assessment_data?: Json | null
          assessment_type?: string
          cefr_level?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          is_template?: boolean | null
          passing_score?: number | null
          questions?: Json
          skills_assessed?: string[] | null
          title?: string
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      eca_templates: {
        Row: {
          age_group: string
          category: string | null
          cefr_level: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          template_data: Json
          template_name: string
          template_type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          age_group: string
          category?: string | null
          cefr_level: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          template_data?: Json
          template_name: string
          template_type: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          age_group?: string
          category?: string | null
          cefr_level?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          template_data?: Json
          template_name?: string
          template_type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      email_queue_dlq: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          id: number
          original_message_id: number | null
          payload: Json
          queue_name: string
        }
        Insert: {
          attempts: number
          created_at?: string
          error_message?: string | null
          id?: number
          original_message_id?: number | null
          payload: Json
          queue_name: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: number
          original_message_id?: number | null
          payload?: Json
          queue_name?: string
        }
        Relationships: []
      }
      email_queue_messages: {
        Row: {
          attempts: number
          claimed_at: string | null
          created_at: string
          expires_at: string
          id: number
          max_attempts: number
          payload: Json
          queue_name: string
          visible_at: string
        }
        Insert: {
          attempts?: number
          claimed_at?: string | null
          created_at?: string
          expires_at: string
          id?: number
          max_attempts?: number
          payload: Json
          queue_name: string
          visible_at?: string
        }
        Update: {
          attempts?: number
          claimed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: number
          max_attempts?: number
          payload?: Json
          queue_name?: string
          visible_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          last_rate_limit_reason: string | null
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id: number
          last_rate_limit_reason?: string | null
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          last_rate_limit_reason?: string | null
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      engagement_signals: {
        Row: {
          id: string
          lesson_id: string | null
          recorded_at: string
          signals: Json
          student_id: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          recorded_at?: string
          signals?: Json
          student_id: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          recorded_at?: string
          signals?: Json
          student_id?: string
        }
        Relationships: []
      }
      engine_mastery_certificates: {
        Row: {
          avg_accuracy: number
          awarded_at: string
          cefr_level: string | null
          engine: string
          hub: string
          id: string
          runs_count: number
          share_token: string | null
          user_id: string
        }
        Insert: {
          avg_accuracy: number
          awarded_at?: string
          cefr_level?: string | null
          engine: string
          hub: string
          id?: string
          runs_count: number
          share_token?: string | null
          user_id: string
        }
        Update: {
          avg_accuracy?: number
          awarded_at?: string
          cefr_level?: string | null
          engine?: string
          hub?: string
          id?: string
          runs_count?: number
          share_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      engine_scenario_cache: {
        Row: {
          cefr: string
          created_at: string
          engine: string
          hit_count: number
          hub: string
          id: string
          last_hit_at: string
          scenario: Json
          topic: string | null
          vocab_hash: string
        }
        Insert: {
          cefr?: string
          created_at?: string
          engine: string
          hit_count?: number
          hub: string
          id?: string
          last_hit_at?: string
          scenario: Json
          topic?: string | null
          vocab_hash: string
        }
        Update: {
          cefr?: string
          created_at?: string
          engine?: string
          hit_count?: number
          hub?: string
          id?: string
          last_hit_at?: string
          scenario?: Json
          topic?: string | null
          vocab_hash?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          conditions: Json | null
          created_at: string | null
          flag_name: string
          id: string
          is_enabled: boolean | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          flag_name: string
          id?: string
          is_enabled?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          flag_name?: string
          id?: string
          is_enabled?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fluency_snapshots: {
        Row: {
          created_at: string
          hub: string
          id: string
          snapshot: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hub: string
          id?: string
          snapshot?: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hub?: string
          id?: string
          snapshot?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_assignments: {
        Row: {
          assigned_by: string
          booking_id: string | null
          created_at: string
          game_id: string
          id: string
          student_id: string | null
        }
        Insert: {
          assigned_by: string
          booking_id?: string | null
          created_at?: string
          game_id: string
          id?: string
          student_id?: string | null
        }
        Update: {
          assigned_by?: string
          booking_id?: string | null
          created_at?: string
          game_id?: string
          id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_assignments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "learning_games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_attempts: {
        Row: {
          created_at: string
          duration_ms: number
          game_type: string
          id: string
          pack_id: string
          reinforcement_target_id: string | null
          round_id: string
          score: number
          student_id: string
          success: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number
          game_type: string
          id?: string
          pack_id: string
          reinforcement_target_id?: string | null
          round_id: string
          score?: number
          student_id: string
          success?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_ms?: number
          game_type?: string
          id?: string
          pack_id?: string
          reinforcement_target_id?: string | null
          round_id?: string
          score?: number
          student_id?: string
          success?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_attempts_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "game_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      game_history: {
        Row: {
          created_at: string
          game_type: string
          hub: string
          id: string
          last_used_at: string
          scenario_key: string
          student_id: string
          updated_at: string
          use_count: number
        }
        Insert: {
          created_at?: string
          game_type: string
          hub: string
          id?: string
          last_used_at?: string
          scenario_key: string
          student_id: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          created_at?: string
          game_type?: string
          hub?: string
          id?: string
          last_used_at?: string
          scenario_key?: string
          student_id?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: []
      }
      game_packs: {
        Row: {
          created_at: string
          educational_value_avg: number
          hub: string
          id: string
          lesson_id: string | null
          rounds: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          educational_value_avg?: number
          hub: string
          id?: string
          lesson_id?: string | null
          rounds?: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          educational_value_avg?: number
          hub?: string
          id?: string
          lesson_id?: string | null
          rounds?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      generated_curriculums: {
        Row: {
          created_at: string | null
          created_by: string | null
          curriculum_data: Json
          estimated_study_time: number
          id: string
          is_active: boolean | null
          level: string
          neuroscientific_features: string[]
          progression_map: Json
          total_pages: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          curriculum_data: Json
          estimated_study_time: number
          id: string
          is_active?: boolean | null
          level: string
          neuroscientific_features: string[]
          progression_map: Json
          total_pages: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          curriculum_data?: Json
          estimated_study_time?: number
          id?: string
          is_active?: boolean | null
          level?: string
          neuroscientific_features?: string[]
          progression_map?: Json
          total_pages?: number
        }
        Relationships: []
      }
      generation_history: {
        Row: {
          age_group: string | null
          cefr_level: string | null
          created_at: string | null
          duration_minutes: number | null
          duration_seconds: number | null
          error_message: string | null
          id: string
          lesson_id: string | null
          metadata: Json | null
          retry_count: number | null
          status: string
          system_type: string
          topic: string
          user_id: string | null
          validation_issues: Json | null
          validation_score: number | null
        }
        Insert: {
          age_group?: string | null
          cefr_level?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          lesson_id?: string | null
          metadata?: Json | null
          retry_count?: number | null
          status: string
          system_type: string
          topic: string
          user_id?: string | null
          validation_issues?: Json | null
          validation_score?: number | null
        }
        Update: {
          age_group?: string | null
          cefr_level?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          lesson_id?: string | null
          metadata?: Json | null
          retry_count?: number | null
          status?: string
          system_type?: string
          topic?: string
          user_id?: string | null
          validation_issues?: Json | null
          validation_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_history_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_run_logs: {
        Row: {
          cefr: string
          created_at: string
          error_count: number
          hub: string
          id: string
          lesson_id: string | null
          passed: boolean
          ran_at: string
          report: Json
          state_hash: string | null
          warning_count: number
        }
        Insert: {
          cefr: string
          created_at?: string
          error_count?: number
          hub: string
          id?: string
          lesson_id?: string | null
          passed: boolean
          ran_at?: string
          report: Json
          state_hash?: string | null
          warning_count?: number
        }
        Update: {
          cefr?: string
          created_at?: string
          error_count?: number
          hub?: string
          id?: string
          lesson_id?: string | null
          passed?: boolean
          ran_at?: string
          report?: Json
          state_hash?: string | null
          warning_count?: number
        }
        Relationships: []
      }
      grammar_progression: {
        Row: {
          age_range: string
          cefr_level: string
          created_at: string | null
          examples: Json
          grammar_points: Json
          id: string
        }
        Insert: {
          age_range: string
          cefr_level: string
          created_at?: string | null
          examples: Json
          grammar_points: Json
          id?: string
        }
        Update: {
          age_range?: string
          cefr_level?: string
          created_at?: string | null
          examples?: Json
          grammar_points?: Json
          id?: string
        }
        Relationships: []
      }
      homework: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          feedback: string | null
          grade: number | null
          id: string
          lesson_id: string | null
          status: string
          student_id: string
          teacher_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          feedback?: string | null
          grade?: number | null
          id?: string
          lesson_id?: string | null
          status?: string
          student_id: string
          teacher_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          feedback?: string | null
          grade?: number | null
          id?: string
          lesson_id?: string | null
          status?: string
          student_id?: string
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_assignment_students: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_assignment_students_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "homework_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignment_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_assignments: {
        Row: {
          attachment_urls: string[] | null
          content: Json | null
          created_at: string
          description: string
          due_date: string
          id: string
          image_style: string | null
          instructions: string | null
          lesson_id: string | null
          points: number
          source: string | null
          status: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_urls?: string[] | null
          content?: Json | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          image_style?: string | null
          instructions?: string | null
          lesson_id?: string | null
          points?: number
          source?: string | null
          status?: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_urls?: string[] | null
          content?: Json | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          image_style?: string | null
          instructions?: string | null
          lesson_id?: string | null
          points?: number
          source?: string | null
          status?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_attempts: {
        Row: {
          bravery_bonus: boolean
          created_at: string
          id: string
          pack_id: string
          reinforcement_target_id: string | null
          speech_attempt_id: string | null
          student_id: string
          success: boolean
          task_id: string
          task_type: string
          time_spent_ms: number
          transcript: string | null
          updated_at: string
        }
        Insert: {
          bravery_bonus?: boolean
          created_at?: string
          id?: string
          pack_id: string
          reinforcement_target_id?: string | null
          speech_attempt_id?: string | null
          student_id: string
          success?: boolean
          task_id: string
          task_type: string
          time_spent_ms?: number
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          bravery_bonus?: boolean
          created_at?: string
          id?: string
          pack_id?: string
          reinforcement_target_id?: string | null
          speech_attempt_id?: string | null
          student_id?: string
          success?: boolean
          task_id?: string
          task_type?: string
          time_spent_ms?: number
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_attempts_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "homework_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_history: {
        Row: {
          created_at: string
          hub: string
          id: string
          last_used_at: string
          student_id: string
          task_template_key: string
          updated_at: string
          use_count: number
        }
        Insert: {
          created_at?: string
          hub: string
          id?: string
          last_used_at?: string
          student_id: string
          task_template_key: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          created_at?: string
          hub?: string
          id?: string
          last_used_at?: string
          student_id?: string
          task_template_key?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: []
      }
      homework_packs: {
        Row: {
          coherence_score: number
          created_at: string
          due_at: string | null
          hub: string
          id: string
          lesson_id: string | null
          status: string
          student_id: string
          tasks: Json
          total_minutes: number
          updated_at: string
        }
        Insert: {
          coherence_score?: number
          created_at?: string
          due_at?: string | null
          hub: string
          id?: string
          lesson_id?: string | null
          status?: string
          student_id: string
          tasks?: Json
          total_minutes?: number
          updated_at?: string
        }
        Update: {
          coherence_score?: number
          created_at?: string
          due_at?: string | null
          hub?: string
          id?: string
          lesson_id?: string | null
          status?: string
          student_id?: string
          tasks?: Json
          total_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      homework_submissions: {
        Row: {
          assignment_id: string
          attachment_urls: string[] | null
          created_at: string
          graded_at: string | null
          id: string
          points_earned: number | null
          status: string
          student_id: string
          submitted_at: string | null
          teacher_feedback: string | null
          text_response: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          attachment_urls?: string[] | null
          created_at?: string
          graded_at?: string | null
          id?: string
          points_earned?: number | null
          status?: string
          student_id: string
          submitted_at?: string | null
          teacher_feedback?: string | null
          text_response?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          attachment_urls?: string[] | null
          created_at?: string
          graded_at?: string | null
          id?: string
          points_earned?: number | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          teacher_feedback?: string | null
          text_response?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "homework_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_payout_settings: {
        Row: {
          created_at: string
          hub: string
          id: string
          payout_amount_eur: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          hub: string
          id?: string
          payout_amount_eur?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          hub?: string
          id?: string
          payout_amount_eur?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      integration_configs: {
        Row: {
          config_data: Json
          created_at: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          config_data: Json
          created_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          config_data?: Json
          created_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_snapshots: {
        Row: {
          hub: string
          payload: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          hub: string
          payload?: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          hub?: string
          payload?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      interactive_lesson_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          due_date: string | null
          id: string
          is_unlocked: boolean
          lesson_id: string
          notes: string | null
          order_in_sequence: number | null
          status: string
          student_id: string
          unlock_condition: Json | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          due_date?: string | null
          id?: string
          is_unlocked?: boolean
          lesson_id: string
          notes?: string | null
          order_in_sequence?: number | null
          status?: string
          student_id: string
          unlock_condition?: Json | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          due_date?: string | null
          id?: string
          is_unlocked?: boolean
          lesson_id?: string
          notes?: string | null
          order_in_sequence?: number | null
          status?: string
          student_id?: string
          unlock_condition?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "interactive_lesson_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "interactive_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactive_lesson_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_library_view"
            referencedColumns: ["id"]
          },
        ]
      }
      interactive_lesson_progress: {
        Row: {
          completed_at: string | null
          completed_slides: number
          completion_percentage: number
          current_slide_index: number
          id: string
          last_slide_completed: number | null
          lesson_id: string
          lesson_status: string
          mastery_check_passed: boolean
          session_data: Json | null
          stars_earned: number
          started_at: string | null
          student_id: string
          total_slides: number
          updated_at: string | null
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          completed_slides?: number
          completion_percentage?: number
          current_slide_index?: number
          id?: string
          last_slide_completed?: number | null
          lesson_id: string
          lesson_status?: string
          mastery_check_passed?: boolean
          session_data?: Json | null
          stars_earned?: number
          started_at?: string | null
          student_id: string
          total_slides?: number
          updated_at?: string | null
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          completed_slides?: number
          completion_percentage?: number
          current_slide_index?: number
          id?: string
          last_slide_completed?: number | null
          lesson_id?: string
          lesson_status?: string
          mastery_check_passed?: boolean
          session_data?: Json | null
          stars_earned?: number
          started_at?: string | null
          student_id?: string
          total_slides?: number
          updated_at?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "interactive_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "interactive_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactive_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_library_view"
            referencedColumns: ["id"]
          },
        ]
      }
      interactive_lessons: {
        Row: {
          age_group: string
          audio_manifest: Json
          badges_available: string[]
          cefr_level: string
          created_at: string
          created_by: string | null
          duration_minutes: number
          grammar_focus: string[]
          id: string
          intro_screen_data: Json | null
          learning_objectives: string[]
          screens_data: Json
          selected_activities: string[]
          sequence_number: number | null
          status: string
          title: string
          topic: string
          total_xp: number
          updated_at: string
          usage_count: number
          vocabulary_list: string[]
        }
        Insert: {
          age_group: string
          audio_manifest?: Json
          badges_available?: string[]
          cefr_level: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          grammar_focus?: string[]
          id?: string
          intro_screen_data?: Json | null
          learning_objectives?: string[]
          screens_data?: Json
          selected_activities?: string[]
          sequence_number?: number | null
          status?: string
          title: string
          topic: string
          total_xp?: number
          updated_at?: string
          usage_count?: number
          vocabulary_list?: string[]
        }
        Update: {
          age_group?: string
          audio_manifest?: Json
          badges_available?: string[]
          cefr_level?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          grammar_focus?: string[]
          id?: string
          intro_screen_data?: Json | null
          learning_objectives?: string[]
          screens_data?: Json
          selected_activities?: string[]
          sequence_number?: number | null
          status?: string
          title?: string
          topic?: string
          total_xp?: number
          updated_at?: string
          usage_count?: number
          vocabulary_list?: string[]
        }
        Relationships: []
      }
      interview_availability_overrides: {
        Row: {
          application_id: string | null
          created_at: string
          created_by: string
          ends_at: string
          id: string
          interview_id: string | null
          kind: string
          starts_at: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          created_by: string
          ends_at: string
          id?: string
          interview_id?: string | null
          kind: string
          starts_at: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: string
          interview_id?: string | null
          kind?: string
          starts_at?: string
        }
        Relationships: []
      }
      interview_availability_rules: {
        Row: {
          active: boolean
          admin_id: string
          created_at: string
          end_time: string
          hub_type: string | null
          id: string
          slot_minutes: number
          start_time: string
          timezone: string
          updated_at: string
          weekday: number
        }
        Insert: {
          active?: boolean
          admin_id: string
          created_at?: string
          end_time: string
          hub_type?: string | null
          id?: string
          slot_minutes?: number
          start_time: string
          timezone?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          active?: boolean
          admin_id?: string
          created_at?: string
          end_time?: string
          hub_type?: string | null
          id?: string
          slot_minutes?: number
          start_time?: string
          timezone?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: []
      }
      interviews: {
        Row: {
          admin_id: string
          admin_notes: string | null
          applicant_user_id: string | null
          application_id: string
          booking_token_expires_at: string | null
          checklist: Json | null
          classroom_id: string | null
          classroom_session_id: string | null
          created_at: string | null
          duration_minutes: number | null
          hub: string | null
          hub_type: string | null
          id: string
          invite_token: string | null
          mock_lesson_key: string | null
          reschedule_count: number
          room_token: string
          scheduled_at: string | null
          scorecard: Json
          status: string | null
          teacher_email: string
          teacher_name: string
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          admin_notes?: string | null
          applicant_user_id?: string | null
          application_id: string
          booking_token_expires_at?: string | null
          checklist?: Json | null
          classroom_id?: string | null
          classroom_session_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          hub?: string | null
          hub_type?: string | null
          id?: string
          invite_token?: string | null
          mock_lesson_key?: string | null
          reschedule_count?: number
          room_token?: string
          scheduled_at?: string | null
          scorecard?: Json
          status?: string | null
          teacher_email: string
          teacher_name: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          admin_notes?: string | null
          applicant_user_id?: string | null
          application_id?: string
          booking_token_expires_at?: string | null
          checklist?: Json | null
          classroom_id?: string | null
          classroom_session_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          hub?: string | null
          hub_type?: string | null
          id?: string
          invite_token?: string | null
          mock_lesson_key?: string | null
          reschedule_count?: number
          room_token?: string
          scheduled_at?: string | null
          scorecard?: Json
          status?: string | null
          teacher_email?: string
          teacher_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "teacher_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      iron_curriculums: {
        Row: {
          cefr_level: string
          created_at: string
          created_by: string | null
          id: string
          levels: Json
          target_audience: string
          topic: string
          updated_at: string
        }
        Insert: {
          cefr_level: string
          created_at?: string
          created_by?: string | null
          id?: string
          levels?: Json
          target_audience: string
          topic: string
          updated_at?: string
        }
        Update: {
          cefr_level?: string
          created_at?: string
          created_by?: string | null
          id?: string
          levels?: Json
          target_audience?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      iron_games: {
        Row: {
          cefr_level: string | null
          created_at: string | null
          created_by: string | null
          game_data: Json
          game_mode: string
          id: string
          status: string | null
          target_group: string
          title: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          cefr_level?: string | null
          created_at?: string | null
          created_by?: string | null
          game_data: Json
          game_mode: string
          id?: string
          status?: string | null
          target_group: string
          title: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          cefr_level?: string | null
          created_at?: string | null
          created_by?: string | null
          game_data?: Json
          game_mode?: string
          id?: string
          status?: string | null
          target_group?: string
          title?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      iron_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_phase: string | null
          id: string
          lesson_id: string
          practice_completion: Json | null
          presentation_completed: boolean | null
          production_response: string | null
          production_submitted: boolean | null
          started_at: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_phase?: string | null
          id?: string
          lesson_id: string
          practice_completion?: Json | null
          presentation_completed?: boolean | null
          production_response?: string | null
          production_submitted?: boolean | null
          started_at?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_phase?: string | null
          id?: string
          lesson_id?: string
          practice_completion?: Json | null
          presentation_completed?: boolean | null
          production_response?: string | null
          production_submitted?: boolean | null
          started_at?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iron_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "iron_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      iron_lessons: {
        Row: {
          cefr_level: string | null
          cohort_group: string
          created_at: string | null
          created_by: string | null
          id: string
          module_id: string | null
          practice_content: Json
          presentation_content: Json
          production_content: Json
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cefr_level?: string | null
          cohort_group: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          module_id?: string | null
          practice_content?: Json
          presentation_content?: Json
          production_content?: Json
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cefr_level?: string | null
          cohort_group?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          module_id?: string | null
          practice_content?: Json
          presentation_content?: Json
          production_content?: Json
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iron_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "iron_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      iron_modules: {
        Row: {
          cohort_group: string
          created_at: string | null
          description: string | null
          id: string
          module_name: string
          module_number: number
          updated_at: string | null
        }
        Insert: {
          cohort_group: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_name: string
          module_number: number
          updated_at?: string | null
        }
        Update: {
          cohort_group?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_name?: string
          module_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      iron_student_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_lesson: number
          current_level: number
          current_phase: string
          curriculum_id: string
          id: string
          practice_completion: Json | null
          production_attempts: number
          production_passed: boolean
          started_at: string
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_lesson?: number
          current_level?: number
          current_phase?: string
          curriculum_id: string
          id?: string
          practice_completion?: Json | null
          production_attempts?: number
          production_passed?: boolean
          started_at?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_lesson?: number
          current_level?: number
          current_phase?: string
          curriculum_id?: string
          id?: string
          practice_completion?: Json | null
          production_attempts?: number
          production_passed?: boolean
          started_at?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iron_student_progress_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "iron_curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          additional_data: Json | null
          id: string
          leaderboard_id: string
          rank_position: number
          recorded_at: string
          score: number
          student_id: string
        }
        Insert: {
          additional_data?: Json | null
          id?: string
          leaderboard_id: string
          rank_position: number
          recorded_at?: string
          score: number
          student_id: string
        }
        Update: {
          additional_data?: Json | null
          id?: string
          leaderboard_id?: string
          rank_position?: number
          recorded_at?: string
          score?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_leaderboard_id_fkey"
            columns: ["leaderboard_id"]
            isOneToOne: false
            referencedRelation: "leaderboards"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          calculation_period: string
          created_at: string
          id: string
          leaderboard_type: string
          scope_identifier: string | null
          updated_at: string
        }
        Insert: {
          calculation_period: string
          created_at?: string
          id?: string
          leaderboard_type: string
          scope_identifier?: string | null
          updated_at?: string
        }
        Update: {
          calculation_period?: string
          created_at?: string
          id?: string
          leaderboard_type?: string
          scope_identifier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learner_profiles: {
        Row: {
          cefr_level: string | null
          created_at: string
          hub: string | null
          profile: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          cefr_level?: string | null
          created_at?: string
          hub?: string | null
          profile?: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          cefr_level?: string | null
          created_at?: string
          hub?: string | null
          profile?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      learner_signals: {
        Row: {
          created_at: string
          decay_at: string
          evidence: Json
          hub: string | null
          id: string
          severity: number
          signal_type: string
          source_lesson_id: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          decay_at?: string
          evidence?: Json
          hub?: string | null
          id?: string
          severity?: number
          signal_type: string
          source_lesson_id?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          decay_at?: string
          evidence?: Json
          hub?: string | null
          id?: string
          severity?: number
          signal_type?: string
          source_lesson_id?: string | null
          student_id?: string
        }
        Relationships: []
      }
      learning_analytics: {
        Row: {
          accuracy_score: number | null
          activity_type: string
          completion_rate: number | null
          id: string
          metadata: Json | null
          recorded_at: string
          session_duration: number
          skill_area: string
          student_id: string
          xp_earned: number
        }
        Insert: {
          accuracy_score?: number | null
          activity_type: string
          completion_rate?: number | null
          id?: string
          metadata?: Json | null
          recorded_at?: string
          session_duration?: number
          skill_area: string
          student_id: string
          xp_earned?: number
        }
        Update: {
          accuracy_score?: number | null
          activity_type?: string
          completion_rate?: number | null
          id?: string
          metadata?: Json | null
          recorded_at?: string
          session_duration?: number
          skill_area?: string
          student_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      learning_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          current_participants: number | null
          description: string
          difficulty_level: number
          end_date: string
          id: string
          is_active: boolean
          max_participants: number | null
          requirements: Json
          rewards: Json
          start_date: string
          title: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          current_participants?: number | null
          description: string
          difficulty_level?: number
          end_date: string
          id?: string
          is_active?: boolean
          max_participants?: number | null
          requirements?: Json
          rewards?: Json
          start_date: string
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          current_participants?: number | null
          description?: string
          difficulty_level?: number
          end_date?: string
          id?: string
          is_active?: boolean
          max_participants?: number | null
          requirements?: Json
          rewards?: Json
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      learning_currency: {
        Row: {
          achievement_bonus_coins: number
          coins_spent: number
          created_at: string
          id: string
          streak_bonus_coins: number
          student_id: string
          total_coins: number
          updated_at: string
        }
        Insert: {
          achievement_bonus_coins?: number
          coins_spent?: number
          created_at?: string
          id?: string
          streak_bonus_coins?: number
          student_id: string
          total_coins?: number
          updated_at?: string
        }
        Update: {
          achievement_bonus_coins?: number
          coins_spent?: number
          created_at?: string
          id?: string
          streak_bonus_coins?: number
          student_id?: string
          total_coins?: number
          updated_at?: string
        }
        Relationships: []
      }
      learning_games: {
        Row: {
          catalog_game_id: string | null
          content_json: Json
          created_at: string
          created_by: string | null
          description: string | null
          game_type: string
          hub: string | null
          id: string
          is_published: boolean
          level: string
          published_at: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          catalog_game_id?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          game_type: string
          hub?: string | null
          id?: string
          is_published?: boolean
          level: string
          published_at?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          catalog_game_id?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          game_type?: string
          hub?: string | null
          id?: string
          is_published?: boolean
          level?: string
          published_at?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_games_catalog_game_id_fkey"
            columns: ["catalog_game_id"]
            isOneToOne: false
            referencedRelation: "arcade_games_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_missions: {
        Row: {
          age_group: string
          badge_reward: string | null
          cefr_level: string
          coin_reward: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          learning_objectives: string[] | null
          mission_data: Json | null
          mission_type: string
          prerequisites: string[] | null
          tasks: Json
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          age_group: string
          badge_reward?: string | null
          cefr_level: string
          coin_reward?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          learning_objectives?: string[] | null
          mission_data?: Json | null
          mission_type: string
          prerequisites?: string[] | null
          tasks?: Json
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          age_group?: string
          badge_reward?: string | null
          cefr_level?: string
          coin_reward?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          learning_objectives?: string[] | null
          mission_data?: Json | null
          mission_type?: string
          prerequisites?: string[] | null
          tasks?: Json
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      learning_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_type: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          attention_optimization_score: number | null
          booking_id: string | null
          completed_at: string | null
          completion_data: Json | null
          conversation_time_seconds: number | null
          curriculum_id: string
          grammar_practiced: string[] | null
          id: string
          lesson_id: string
          lesson_number: number
          memory_consolidation_score: number | null
          neuroscience_engagement_score: number | null
          pages_completed: number | null
          shared_notes: string | null
          student_id: string
          teacher_id: string | null
          total_pages: number | null
          vocabulary_learned: string[] | null
          week_number: number
        }
        Insert: {
          attention_optimization_score?: number | null
          booking_id?: string | null
          completed_at?: string | null
          completion_data?: Json | null
          conversation_time_seconds?: number | null
          curriculum_id: string
          grammar_practiced?: string[] | null
          id?: string
          lesson_id: string
          lesson_number: number
          memory_consolidation_score?: number | null
          neuroscience_engagement_score?: number | null
          pages_completed?: number | null
          shared_notes?: string | null
          student_id: string
          teacher_id?: string | null
          total_pages?: number | null
          vocabulary_learned?: string[] | null
          week_number: number
        }
        Update: {
          attention_optimization_score?: number | null
          booking_id?: string | null
          completed_at?: string | null
          completion_data?: Json | null
          conversation_time_seconds?: number | null
          curriculum_id?: string
          grammar_practiced?: string[] | null
          id?: string
          lesson_id?: string
          lesson_number?: number
          memory_consolidation_score?: number | null
          neuroscience_engagement_score?: number | null
          pages_completed?: number | null
          shared_notes?: string | null
          student_id?: string
          teacher_id?: string | null
          total_pages?: number | null
          vocabulary_learned?: string[] | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "generated_curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_feedback_submissions: {
        Row: {
          feedback_content: string
          homework_assigned: string | null
          id: string
          lesson_id: string
          lesson_objectives_met: boolean | null
          parent_communication_notes: string | null
          payment_unlocked: boolean | null
          student_id: string
          student_performance_rating: number | null
          submitted_at: string | null
          tags: string[] | null
          teacher_id: string
          theme: string | null
        }
        Insert: {
          feedback_content: string
          homework_assigned?: string | null
          id?: string
          lesson_id: string
          lesson_objectives_met?: boolean | null
          parent_communication_notes?: string | null
          payment_unlocked?: boolean | null
          student_id: string
          student_performance_rating?: number | null
          submitted_at?: string | null
          tags?: string[] | null
          teacher_id: string
          theme?: string | null
        }
        Update: {
          feedback_content?: string
          homework_assigned?: string | null
          id?: string
          lesson_id?: string
          lesson_objectives_met?: boolean | null
          parent_communication_notes?: string | null
          payment_unlocked?: boolean | null
          student_id?: string
          student_performance_rating?: number | null
          submitted_at?: string | null
          tags?: string[] | null
          teacher_id?: string
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_feedback_submissions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_incident_reports: {
        Row: {
          created_at: string
          flags: string[]
          id: string
          notes: string | null
          outcome: string
          reporter_id: string
          reporter_role: string
          room_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          flags?: string[]
          id?: string
          notes?: string | null
          outcome: string
          reporter_id: string
          reporter_role: string
          room_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          flags?: string[]
          id?: string
          notes?: string | null
          outcome?: string
          reporter_id?: string
          reporter_role?: string
          room_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_materials: {
        Row: {
          asset_id: string
          created_at: string | null
          display_order: number | null
          id: string
          is_mandatory: boolean | null
          lesson_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_mandatory?: boolean | null
          lesson_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_mandatory?: boolean | null
          lesson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "library_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_packages: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          is_active: boolean
          lesson_count: number
          name: string
          savings_amount: number | null
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          is_active?: boolean
          lesson_count: number
          name: string
          savings_amount?: number | null
          total_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          lesson_count?: number
          name?: string
          savings_amount?: number | null
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      lesson_participants: {
        Row: {
          id: string
          joined_at: string | null
          left_at: string | null
          lesson_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          lesson_id?: string | null
          role: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          lesson_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_participants_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_payments: {
        Row: {
          amount_charged: number
          created_at: string | null
          id: string
          lesson_id: string
          payment_method: string | null
          platform_profit: number
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          stripe_payment_intent_id: string | null
          student_id: string
          teacher_id: string
          teacher_payout: number
          transaction_date: string | null
        }
        Insert: {
          amount_charged: number
          created_at?: string | null
          id?: string
          lesson_id: string
          payment_method?: string | null
          platform_profit: number
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          stripe_payment_intent_id?: string | null
          student_id: string
          teacher_id: string
          teacher_payout: number
          transaction_date?: string | null
        }
        Update: {
          amount_charged?: number
          created_at?: string | null
          id?: string
          lesson_id?: string
          payment_method?: string | null
          platform_profit?: number
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          stripe_payment_intent_id?: string | null
          student_id?: string
          teacher_id?: string
          teacher_payout?: number
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_payments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress_tracking: {
        Row: {
          created_at: string | null
          current_slide_index: number | null
          id: string
          last_accessed_at: string | null
          lesson_content_id: string
          slides_completed: number[] | null
          started_at: string | null
          status: string | null
          student_id: string
          total_slides: number | null
          updated_at: string | null
          xp_earned: number | null
        }
        Insert: {
          created_at?: string | null
          current_slide_index?: number | null
          id?: string
          last_accessed_at?: string | null
          lesson_content_id: string
          slides_completed?: number[] | null
          started_at?: string | null
          status?: string | null
          student_id: string
          total_slides?: number | null
          updated_at?: string | null
          xp_earned?: number | null
        }
        Update: {
          created_at?: string | null
          current_slide_index?: number | null
          id?: string
          last_accessed_at?: string | null
          lesson_content_id?: string
          slides_completed?: number[] | null
          started_at?: string | null
          status?: string | null
          student_id?: string
          total_slides?: number | null
          updated_at?: string | null
          xp_earned?: number | null
        }
        Relationships: []
      }
      lesson_reminders: {
        Row: {
          created_at: string
          email_status: string | null
          error_message: string | null
          id: string
          lesson_id: string
          recipient_id: string
          recipient_type: string
          reminder_type: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string
          email_status?: string | null
          error_message?: string | null
          id?: string
          lesson_id: string
          recipient_id: string
          recipient_type: string
          reminder_type: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string
          email_status?: string | null
          error_message?: string | null
          id?: string
          lesson_id?: string
          recipient_id?: string
          recipient_type?: string
          reminder_type?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_reminders_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_revisions: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          kind: string
          lesson_id: string
          note: string | null
          title: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          lesson_id: string
          note?: string | null
          title?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          lesson_id?: string
          note?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_revisions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_slide_events: {
        Row: {
          created_at: string
          dwell_ms: number
          event_type: string
          id: string
          lesson_id: string | null
          payload: Json
          slide_index: number
          student_id: string
        }
        Insert: {
          created_at?: string
          dwell_ms?: number
          event_type: string
          id?: string
          lesson_id?: string | null
          payload?: Json
          slide_index: number
          student_id: string
        }
        Update: {
          created_at?: string
          dwell_ms?: number
          event_type?: string
          id?: string
          lesson_id?: string | null
          payload?: Json
          slide_index?: number
          student_id?: string
        }
        Relationships: []
      }
      lesson_templates: {
        Row: {
          clone_count: number
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          hub: string
          id: string
          is_published: boolean
          level: string | null
          payload: Json
          slide_count: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          clone_count?: number
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          hub: string
          id?: string
          is_published?: boolean
          level?: string | null
          payload: Json
          slide_count?: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          clone_count?: number
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          hub?: string
          id?: string
          is_published?: boolean
          level?: string | null
          payload?: Json
          slide_count?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_test_failures: {
        Row: {
          category: string
          created_at: string
          detector: string
          evidence: Json | null
          id: string
          run_id: string
          severity: string
          slide_index: number | null
        }
        Insert: {
          category: string
          created_at?: string
          detector: string
          evidence?: Json | null
          id?: string
          run_id: string
          severity: string
          slide_index?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          detector?: string
          evidence?: Json | null
          id?: string
          run_id?: string
          severity?: string
          slide_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_test_failures_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "lesson_test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_test_runs: {
        Row: {
          blueprint_hash: string | null
          cefr_level: string
          created_at: string
          detector_failures: Json
          duration_ms: number | null
          hub: string
          id: string
          lesson_id: string | null
          lesson_kind: string
          overall_verdict: string
          qa_verdict: string | null
          run_label: string | null
          stab_verdict: string | null
        }
        Insert: {
          blueprint_hash?: string | null
          cefr_level: string
          created_at?: string
          detector_failures?: Json
          duration_ms?: number | null
          hub: string
          id?: string
          lesson_id?: string | null
          lesson_kind: string
          overall_verdict: string
          qa_verdict?: string | null
          run_label?: string | null
          stab_verdict?: string | null
        }
        Update: {
          blueprint_hash?: string | null
          cefr_level?: string
          created_at?: string
          detector_failures?: Json
          duration_ms?: number | null
          hub?: string
          id?: string
          lesson_id?: string | null
          lesson_kind?: string
          overall_verdict?: string
          qa_verdict?: string | null
          run_label?: string | null
          stab_verdict?: string | null
        }
        Relationships: []
      }
      lesson_videos: {
        Row: {
          cefr: string | null
          created_at: string
          created_by: string | null
          duration_seconds: number
          hub: string | null
          id: string
          lesson_id: string
          prompt_used: string | null
          questions: Json
          replaced_at: string | null
          source: string
          starting_frame_url: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          cefr?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number
          hub?: string | null
          id?: string
          lesson_id: string
          prompt_used?: string | null
          questions?: Json
          replaced_at?: string | null
          source?: string
          starting_frame_url?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          cefr?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number
          hub?: string | null
          id?: string
          lesson_id?: string
          prompt_used?: string | null
          questions?: Json
          replaced_at?: string | null
          source?: string
          starting_frame_url?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          cancellation_reason: string | null
          completed_at: string | null
          cost: number | null
          created_at: string
          curriculum_lesson_id: string | null
          duration: number
          duration_minutes: number | null
          feedback_required: boolean | null
          feedback_submitted: boolean | null
          id: string
          lesson_objectives: Json | null
          lesson_plan_notes: string | null
          lesson_price: number | null
          payment_status: string | null
          platform_profit_amount: number | null
          prep_materials_sent: boolean | null
          quality_rating: number | null
          reschedule_count: number | null
          reschedule_history: Json | null
          room_id: string | null
          room_link: string | null
          scheduled_at: string
          status: string
          student_charged_amount: number | null
          student_id: string
          teacher_id: string
          teacher_payout_amount: number | null
          title: string
        }
        Insert: {
          cancellation_reason?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          curriculum_lesson_id?: string | null
          duration?: number
          duration_minutes?: number | null
          feedback_required?: boolean | null
          feedback_submitted?: boolean | null
          id?: string
          lesson_objectives?: Json | null
          lesson_plan_notes?: string | null
          lesson_price?: number | null
          payment_status?: string | null
          platform_profit_amount?: number | null
          prep_materials_sent?: boolean | null
          quality_rating?: number | null
          reschedule_count?: number | null
          reschedule_history?: Json | null
          room_id?: string | null
          room_link?: string | null
          scheduled_at: string
          status?: string
          student_charged_amount?: number | null
          student_id: string
          teacher_id: string
          teacher_payout_amount?: number | null
          title: string
        }
        Update: {
          cancellation_reason?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          curriculum_lesson_id?: string | null
          duration?: number
          duration_minutes?: number | null
          feedback_required?: boolean | null
          feedback_submitted?: boolean | null
          id?: string
          lesson_objectives?: Json | null
          lesson_plan_notes?: string | null
          lesson_price?: number | null
          payment_status?: string | null
          platform_profit_amount?: number | null
          prep_materials_sent?: boolean | null
          quality_rating?: number | null
          reschedule_count?: number | null
          reschedule_history?: Json | null
          room_id?: string | null
          room_link?: string | null
          scheduled_at?: string
          status?: string
          student_charged_amount?: number | null
          student_id?: string
          teacher_id?: string
          teacher_payout_amount?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_curriculum_lesson_id_fkey"
            columns: ["curriculum_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons_content: {
        Row: {
          canva_url: string | null
          cefr_level: string
          created_at: string | null
          created_by: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          grammar_focus: string[] | null
          id: string
          is_active: boolean | null
          learning_objectives: string[] | null
          lesson_number: number
          metadata: Json | null
          module_number: number
          slide_order: number[] | null
          slides_content: Json
          title: string
          topic: string
          updated_at: string | null
          vocabulary_focus: string[] | null
        }
        Insert: {
          canva_url?: string | null
          cefr_level?: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          grammar_focus?: string[] | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[] | null
          lesson_number?: number
          metadata?: Json | null
          module_number?: number
          slide_order?: number[] | null
          slides_content?: Json
          title: string
          topic: string
          updated_at?: string | null
          vocabulary_focus?: string[] | null
        }
        Update: {
          canva_url?: string | null
          cefr_level?: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          grammar_focus?: string[] | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[] | null
          lesson_number?: number
          metadata?: Json | null
          module_number?: number
          slide_order?: number[] | null
          slides_content?: Json
          title?: string
          topic?: string
          updated_at?: string | null
          vocabulary_focus?: string[] | null
        }
        Relationships: []
      }
      library_assets: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          is_teacher_only: boolean | null
          max_age: number | null
          min_age: number | null
          system_tag: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          id?: string
          is_teacher_only?: boolean | null
          max_age?: number | null
          min_age?: number | null
          system_tag: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_teacher_only?: boolean | null
          max_age?: number | null
          min_age?: number | null
          system_tag?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      library_reads: {
        Row: {
          asset_id: string
          completed: boolean
          id: string
          read_at: string
          student_id: string
        }
        Insert: {
          asset_id: string
          completed?: boolean
          id?: string
          read_at?: string
          student_id: string
        }
        Update: {
          asset_id?: string
          completed?: boolean
          id?: string
          read_at?: string
          student_id?: string
        }
        Relationships: []
      }
      live_class_activities: {
        Row: {
          booking_id: string | null
          classroom_session_id: string
          created_at: string
          dismissed_at: string | null
          format: string
          id: string
          payload: Json
          prompt: string
          teacher_id: string
        }
        Insert: {
          booking_id?: string | null
          classroom_session_id: string
          created_at?: string
          dismissed_at?: string | null
          format: string
          id?: string
          payload: Json
          prompt: string
          teacher_id: string
        }
        Update: {
          booking_id?: string | null
          classroom_session_id?: string
          created_at?: string
          dismissed_at?: string | null
          format?: string
          id?: string
          payload?: Json
          prompt?: string
          teacher_id?: string
        }
        Relationships: []
      }
      marketing_agent_automation_runs: {
        Row: {
          automation_id: string
          error: string | null
          finished_at: string | null
          id: string
          input: Json | null
          output: Json | null
          started_at: string
          status: string
        }
        Insert: {
          automation_id: string
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          automation_id?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_agent_automation_runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "marketing_agent_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_agent_automations: {
        Row: {
          automation_type: string
          created_at: string
          cron_expression: string
          enabled: boolean
          id: string
          last_run_at: string | null
          last_run_status: string | null
          name: string
          params: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          automation_type: string
          created_at?: string
          cron_expression?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          last_run_status?: string | null
          name: string
          params?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          automation_type?: string
          created_at?: string
          cron_expression?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          last_run_status?: string | null
          name?: string
          params?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_agent_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_agent_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "marketing_agent_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_agent_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_broadcasts: {
        Row: {
          audience_filter: Json
          body_html: string
          channel: string
          clicks_count: number
          created_at: string
          created_by: string | null
          from_name: string | null
          id: string
          opens_count: number
          preview_text: string | null
          recipients_count: number
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          audience_filter?: Json
          body_html: string
          channel?: string
          clicks_count?: number
          created_at?: string
          created_by?: string | null
          from_name?: string | null
          id?: string
          opens_count?: number
          preview_text?: string | null
          recipients_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          audience_filter?: Json
          body_html?: string
          channel?: string
          clicks_count?: number
          created_at?: string
          created_by?: string | null
          from_name?: string | null
          id?: string
          opens_count?: number
          preview_text?: string | null
          recipients_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          budget_cents: number
          campaign_type: string
          channel: string | null
          code: string | null
          conversions_count: number
          created_at: string
          created_by: string | null
          discount_pct: number | null
          ends_at: string | null
          id: string
          landing_url: string | null
          name: string
          notes: string | null
          revenue_cents: number
          signups_count: number
          spend_cents: number
          starts_at: string | null
          status: string
          target_hub: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          budget_cents?: number
          campaign_type: string
          channel?: string | null
          code?: string | null
          conversions_count?: number
          created_at?: string
          created_by?: string | null
          discount_pct?: number | null
          ends_at?: string | null
          id?: string
          landing_url?: string | null
          name: string
          notes?: string | null
          revenue_cents?: number
          signups_count?: number
          spend_cents?: number
          starts_at?: string | null
          status?: string
          target_hub?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          budget_cents?: number
          campaign_type?: string
          channel?: string | null
          code?: string | null
          conversions_count?: number
          created_at?: string
          created_by?: string | null
          discount_pct?: number | null
          ends_at?: string | null
          id?: string
          landing_url?: string | null
          name?: string
          notes?: string | null
          revenue_cents?: number
          signups_count?: number
          spend_cents?: number
          starts_at?: string | null
          status?: string
          target_hub?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      marketing_social_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          follower_count: number
          handle: string
          id: string
          is_active: boolean
          notes: string | null
          platform: string
          profile_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          follower_count?: number
          handle: string
          id?: string
          is_active?: boolean
          notes?: string | null
          platform: string
          profile_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          follower_count?: number
          handle?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          platform?: string
          profile_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketing_social_posts: {
        Row: {
          account_id: string | null
          campaign_id: string | null
          comments_count: number
          content: string
          created_at: string
          created_by: string | null
          external_url: string | null
          id: string
          impressions_count: number
          likes_count: number
          media_urls: string[]
          platform: string
          posted_at: string | null
          scheduled_for: string | null
          shares_count: number
          status: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          campaign_id?: string | null
          comments_count?: number
          content: string
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          impressions_count?: number
          likes_count?: number
          media_urls?: string[]
          platform: string
          posted_at?: string | null
          scheduled_for?: string | null
          shares_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          campaign_id?: string | null
          comments_count?: number
          content?: string
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          impressions_count?: number
          likes_count?: number
          media_urls?: string[]
          platform?: string
          posted_at?: string | null
          scheduled_for?: string | null
          shares_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_social_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "marketing_social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_social_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      material_skills: {
        Row: {
          id: string
          material_id: string | null
          skill_id: string | null
        }
        Insert: {
          id?: string
          material_id?: string | null
          skill_id?: string | null
        }
        Update: {
          id?: string
          material_id?: string | null
          skill_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_skills_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "curriculum_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "curriculum_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_heatmap_snapshots: {
        Row: {
          created_at: string
          hub: string
          id: string
          payload: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hub: string
          id?: string
          payload: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hub?: string
          id?: string
          payload?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      memory_items: {
        Row: {
          active_mastery: number
          cefr: string | null
          created_at: string
          ease_factor: number
          forgetting_risk: number
          fsrs_state: Json | null
          hub: string
          id: string
          interval_days: number
          last_cascade_event: string | null
          last_context: Json | null
          last_seen_at: string | null
          leitner_box: number
          memory_strength: number
          next_due_at: string | null
          passive_mastery: number
          predicted_decay_at: string | null
          pronunciation_retention: number
          recall_level: number
          repetitions: number
          skill_key: string
          skill_kind: string
          source: string | null
          speaking_retention: number
          spiral_stage: number
          student_id: string
          updated_at: string
        }
        Insert: {
          active_mastery?: number
          cefr?: string | null
          created_at?: string
          ease_factor?: number
          forgetting_risk?: number
          fsrs_state?: Json | null
          hub: string
          id?: string
          interval_days?: number
          last_cascade_event?: string | null
          last_context?: Json | null
          last_seen_at?: string | null
          leitner_box?: number
          memory_strength?: number
          next_due_at?: string | null
          passive_mastery?: number
          predicted_decay_at?: string | null
          pronunciation_retention?: number
          recall_level?: number
          repetitions?: number
          skill_key: string
          skill_kind: string
          source?: string | null
          speaking_retention?: number
          spiral_stage?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          active_mastery?: number
          cefr?: string | null
          created_at?: string
          ease_factor?: number
          forgetting_risk?: number
          fsrs_state?: Json | null
          hub?: string
          id?: string
          interval_days?: number
          last_cascade_event?: string | null
          last_context?: Json | null
          last_seen_at?: string | null
          leitner_box?: number
          memory_strength?: number
          next_due_at?: string | null
          passive_mastery?: number
          predicted_decay_at?: string | null
          pronunciation_retention?: number
          recall_level?: number
          repetitions?: number
          skill_key?: string
          skill_kind?: string
          source?: string | null
          speaking_retention?: number
          spiral_stage?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      memory_review_history: {
        Row: {
          created_at: string
          hub: string
          id: string
          injection_slot: string | null
          latency_ms: number | null
          lesson_id: string | null
          memory_item_id: string | null
          mode: string
          recall_level: number
          skill_key: string
          skill_kind: string
          student_id: string
          success: boolean
        }
        Insert: {
          created_at?: string
          hub: string
          id?: string
          injection_slot?: string | null
          latency_ms?: number | null
          lesson_id?: string | null
          memory_item_id?: string | null
          mode: string
          recall_level: number
          skill_key: string
          skill_kind: string
          student_id: string
          success: boolean
        }
        Update: {
          created_at?: string
          hub?: string
          id?: string
          injection_slot?: string | null
          latency_ms?: number | null
          lesson_id?: string | null
          memory_item_id?: string | null
          mode?: string
          recall_level?: number
          skill_key?: string
          skill_kind?: string
          student_id?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "memory_review_history_memory_item_id_fkey"
            columns: ["memory_item_id"]
            isOneToOne: false
            referencedRelation: "memory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "class_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_lessons: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          mission_id: string | null
          task_order: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          mission_id?: string | null
          task_order: number
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          mission_id?: string | null
          task_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "mission_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "systematic_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_lessons_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "learning_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mistake_repository: {
        Row: {
          attempted_content: string | null
          attempts_count: number
          context: string | null
          created_at: string
          frequency_score: number
          id: string
          metadata: Json | null
          mistake_type: string
          pattern_category: string | null
          resolved: boolean
          resolved_at: string | null
          severity: string
          source_lesson_id: string | null
          source_slide_id: string | null
          target_content: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempted_content?: string | null
          attempts_count?: number
          context?: string | null
          created_at?: string
          frequency_score?: number
          id?: string
          metadata?: Json | null
          mistake_type: string
          pattern_category?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          source_lesson_id?: string | null
          source_slide_id?: string | null
          target_content: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempted_content?: string | null
          attempts_count?: number
          context?: string | null
          created_at?: string
          frequency_score?: number
          id?: string
          metadata?: Json | null
          mistake_type?: string
          pattern_category?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          source_lesson_id?: string | null
          source_slide_id?: string | null
          target_content?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ml_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          features_used: Json | null
          id: string
          model_version: string | null
          prediction_type: string
          prediction_value: Json
          student_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          features_used?: Json | null
          id?: string
          model_version?: string | null
          prediction_type: string
          prediction_value: Json
          student_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          features_used?: Json | null
          id?: string
          model_version?: string | null
          prediction_type?: string
          prediction_value?: Json
          student_id?: string
        }
        Relationships: []
      }
      multimedia_generation_queue: {
        Row: {
          asset_purpose: string
          asset_type: string
          created_at: string | null
          error_message: string | null
          id: string
          lesson_id: string
          prompt: string
          result_url: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          asset_purpose: string
          asset_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          lesson_id: string
          prompt: string
          result_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          asset_purpose?: string
          asset_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          lesson_id?: string
          prompt?: string
          result_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multimedia_generation_queue_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "early_learners_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      narrative_state: {
        Row: {
          active_characters: Json
          current_arc: Json
          hub: string
          last_beat: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          active_characters?: Json
          current_arc?: Json
          hub: string
          last_beat?: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          active_characters?: Json
          current_arc?: Json
          hub?: string
          last_beat?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          email_sent_at: string | null
          error_message: string | null
          id: string
          recipient_email: string
          status: string
          student_id: string
          template_name: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_sent_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          status?: string
          student_id: string
          template_name: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_sent_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          status?: string
          student_id?: string
          template_name?: string
          unit_id?: string | null
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          id: string
          is_active: boolean | null
          subject: string | null
          template_name: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          subject?: string | null
          template_name: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          subject?: string | null
          template_name?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          scheduled_for: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          scheduled_for?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          scheduled_for?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orchestrator_runs: {
        Row: {
          conflicts: Json
          created_at: string
          id: string
          lesson_id: string | null
          orchestrator_version: string
          prompt_chain_hash: string
          qa_verdict: string
          stage_timings: Json
          state_hash: string
          student_id: string | null
        }
        Insert: {
          conflicts?: Json
          created_at?: string
          id?: string
          lesson_id?: string | null
          orchestrator_version: string
          prompt_chain_hash: string
          qa_verdict: string
          stage_timings?: Json
          state_hash: string
          student_id?: string | null
        }
        Update: {
          conflicts?: Json
          created_at?: string
          id?: string
          lesson_id?: string | null
          orchestrator_version?: string
          prompt_chain_hash?: string
          qa_verdict?: string
          stage_timings?: Json
          state_hash?: string
          student_id?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          permissions: Json | null
          role: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          permissions?: Json | null
          role?: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          branding_config: Json | null
          created_at: string | null
          domain: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          slug: string
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          branding_config?: Json | null
          created_at?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          branding_config?: Json | null
          created_at?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug?: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      package_lesson_redemptions: {
        Row: {
          id: string
          lesson_id: string
          package_purchase_id: string
          redeemed_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          package_purchase_id: string
          redeemed_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          package_purchase_id?: string
          redeemed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_lesson_redemptions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_lesson_redemptions_package_purchase_id_fkey"
            columns: ["package_purchase_id"]
            isOneToOne: false
            referencedRelation: "student_package_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_notification_preferences: {
        Row: {
          attendance_alerts: boolean | null
          created_at: string
          homework_notifications: boolean | null
          id: string
          lesson_reminders: boolean | null
          parent_id: string
          payment_reminders: boolean | null
          progress_reports: boolean | null
          teacher_messages: boolean | null
          updated_at: string
          weekly_summary: boolean | null
        }
        Insert: {
          attendance_alerts?: boolean | null
          created_at?: string
          homework_notifications?: boolean | null
          id?: string
          lesson_reminders?: boolean | null
          parent_id: string
          payment_reminders?: boolean | null
          progress_reports?: boolean | null
          teacher_messages?: boolean | null
          updated_at?: string
          weekly_summary?: boolean | null
        }
        Update: {
          attendance_alerts?: boolean | null
          created_at?: string
          homework_notifications?: boolean | null
          id?: string
          lesson_reminders?: boolean | null
          parent_id?: string
          payment_reminders?: boolean | null
          progress_reports?: boolean | null
          teacher_messages?: boolean | null
          updated_at?: string
          weekly_summary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_notification_preferences_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: true
            referencedRelation: "parent_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      parent_profiles: {
        Row: {
          created_at: string
          emergency_contact: string | null
          full_name: string
          id: string
          notifications_enabled: boolean | null
          phone: string | null
          preferred_contact_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emergency_contact?: string | null
          full_name: string
          id?: string
          notifications_enabled?: boolean | null
          phone?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emergency_contact?: string | null
          full_name?: string
          id?: string
          notifications_enabled?: boolean | null
          phone?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_teacher_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          parent_email: string | null
          parent_id: string
          read_at: string | null
          sender_type: string
          student_id: string
          subject: string
          teacher_email: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          parent_email?: string | null
          parent_id: string
          read_at?: string | null
          sender_type: string
          student_id: string
          subject: string
          teacher_email?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          parent_email?: string | null
          parent_id?: string
          read_at?: string | null
          sender_type?: string
          student_id?: string
          subject?: string
          teacher_email?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_teacher_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "parent_teacher_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_messages_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          feedback_completion_required: boolean | null
          id: string
          kpi_threshold_met: boolean | null
          lesson_id: string
          payment_method: string
          platform_amount: number | null
          revenue_split_id: string | null
          status: string
          student_id: string
          teacher_amount: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          feedback_completion_required?: boolean | null
          id?: string
          kpi_threshold_met?: boolean | null
          lesson_id: string
          payment_method: string
          platform_amount?: number | null
          revenue_split_id?: string | null
          status?: string
          student_id: string
          teacher_amount?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          feedback_completion_required?: boolean | null
          id?: string
          kpi_threshold_met?: boolean | null
          lesson_id?: string
          payment_method?: string
          platform_amount?: number | null
          revenue_split_id?: string | null
          status?: string
          student_id?: string
          teacher_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_revenue_split_id_fkey"
            columns: ["revenue_split_id"]
            isOneToOne: false
            referencedRelation: "revenue_splits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          base_pay: number
          bonus_amount: number
          created_at: string
          hourly_rate: number
          id: string
          month: number
          notes: string | null
          payment_method: string | null
          payment_status: string
          processed_at: string | null
          teacher_id: string
          teacher_name: string | null
          total_earned: number
          total_hours: number
          total_lessons: number
          updated_at: string
          year: number
        }
        Insert: {
          base_pay?: number
          bonus_amount?: number
          created_at?: string
          hourly_rate?: number
          id?: string
          month: number
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          processed_at?: string | null
          teacher_id: string
          teacher_name?: string | null
          total_earned?: number
          total_hours?: number
          total_lessons?: number
          updated_at?: string
          year: number
        }
        Update: {
          base_pay?: number
          bonus_amount?: number
          created_at?: string
          hourly_rate?: number
          id?: string
          month?: number
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          processed_at?: string | null
          teacher_id?: string
          teacher_name?: string | null
          total_earned?: number
          total_hours?: number
          total_lessons?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      pedagogical_quality_reports: {
        Row: {
          created_at: string
          final_verdict: string
          id: string
          lesson_id: string
          metrics: Json
          repairs_applied: Json
          student_id: string | null
          verdicts: Json
        }
        Insert: {
          created_at?: string
          final_verdict: string
          id?: string
          lesson_id: string
          metrics?: Json
          repairs_applied?: Json
          student_id?: string | null
          verdicts?: Json
        }
        Update: {
          created_at?: string
          final_verdict?: string
          id?: string
          lesson_id?: string
          metrics?: Json
          repairs_applied?: Json
          student_id?: string | null
          verdicts?: Json
        }
        Relationships: []
      }
      performance_alerts: {
        Row: {
          alert_message: string
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          teacher_id: string
        }
        Insert: {
          alert_message: string
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          teacher_id: string
        }
        Update: {
          alert_message?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          teacher_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string
          date_recorded: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          student_id: string
          time_period: string
        }
        Insert: {
          created_at?: string
          date_recorded?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          student_id: string
          time_period: string
        }
        Update: {
          created_at?: string
          date_recorded?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          student_id?: string
          time_period?: string
        }
        Relationships: []
      }
      personalized_learning_paths: {
        Row: {
          actual_completion_days: number | null
          ai_generated: boolean | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          current_step: number | null
          difficulty_preference: string | null
          estimated_completion_days: number | null
          id: string
          last_activity_at: string | null
          learning_style: string | null
          path_data: Json
          path_name: string
          student_id: string
          total_steps: number
          updated_at: string | null
        }
        Insert: {
          actual_completion_days?: number | null
          ai_generated?: boolean | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          current_step?: number | null
          difficulty_preference?: string | null
          estimated_completion_days?: number | null
          id?: string
          last_activity_at?: string | null
          learning_style?: string | null
          path_data: Json
          path_name: string
          student_id: string
          total_steps: number
          updated_at?: string | null
        }
        Update: {
          actual_completion_days?: number | null
          ai_generated?: boolean | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          current_step?: number | null
          difficulty_preference?: string | null
          estimated_completion_days?: number | null
          id?: string
          last_activity_at?: string | null
          learning_style?: string | null
          path_data?: Json
          path_name?: string
          student_id?: string
          total_steps?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      placement_content: {
        Row: {
          content: Json
          hub: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: Json
          hub: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          hub?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      placement_results: {
        Row: {
          ability_theta: number | null
          cefr_level: string
          created_at: string
          duration_seconds: number | null
          hub: string | null
          id: string
          items_answered: number
          method: string
          standard_error: number | null
          student_id: string
          trail: Json
        }
        Insert: {
          ability_theta?: number | null
          cefr_level: string
          created_at?: string
          duration_seconds?: number | null
          hub?: string | null
          id?: string
          items_answered?: number
          method: string
          standard_error?: number | null
          student_id: string
          trail?: Json
        }
        Update: {
          ability_theta?: number | null
          cefr_level?: string
          created_at?: string
          duration_seconds?: number | null
          hub?: string | null
          id?: string
          items_answered?: number
          method?: string
          standard_error?: number | null
          student_id?: string
          trail?: Json
        }
        Relationships: []
      }
      playground_videos: {
        Row: {
          created_at: string
          duration_sec: number | null
          error: string | null
          id: string
          lesson_id: string | null
          metadata: Json
          prediction_id: string | null
          prompt: string
          provider: string
          source_image_url: string | null
          status: string
          storage_path: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          youtube_status: string | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string
          duration_sec?: number | null
          error?: string | null
          id?: string
          lesson_id?: string | null
          metadata?: Json
          prediction_id?: string | null
          prompt: string
          provider?: string
          source_image_url?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          youtube_status?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string
          duration_sec?: number | null
          error?: string | null
          id?: string
          lesson_id?: string | null
          metadata?: Json
          prediction_id?: string | null
          prompt?: string
          provider?: string
          source_image_url?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          youtube_status?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      poll_responses: {
        Row: {
          created_at: string | null
          id: string
          response_time_ms: number | null
          selected_option_id: string
          session_id: string
          slide_id: string
          student_id: string
          student_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          response_time_ms?: number | null
          selected_option_id: string
          session_id: string
          slide_id: string
          student_id: string
          student_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          response_time_ms?: number | null
          selected_option_id?: string
          session_id?: string
          slide_id?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "classroom_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      post_class_feedback: {
        Row: {
          created_at: string
          feels_more_confident: boolean | null
          id: string
          improvement_suggestion: string | null
          lesson_id: string | null
          material_relevance_rating: number
          student_id: string
          teacher_energy_rating: number
          teacher_id: string
        }
        Insert: {
          created_at?: string
          feels_more_confident?: boolean | null
          id?: string
          improvement_suggestion?: string | null
          lesson_id?: string | null
          material_relevance_rating: number
          student_id: string
          teacher_energy_rating: number
          teacher_id: string
        }
        Update: {
          created_at?: string
          feels_more_confident?: boolean | null
          id?: string
          improvement_suggestion?: string | null
          lesson_id?: string | null
          material_relevance_rating?: number
          student_id?: string
          teacher_energy_rating?: number
          teacher_id?: string
        }
        Relationships: []
      }
      proficiency_attempts: {
        Row: {
          cefr_band: string
          created_at: string
          gate_type: string
          hesitation_events: number | null
          hub: string
          id: string
          min_volume_db: number | null
          passed: boolean | null
          repair_chips_used: number | null
          shields_listening: number | null
          shields_reading: number | null
          shields_reading_writing: number | null
          shields_speaking: number | null
          shields_total: number
          shields_writing: number | null
          spontaneity_ratio: number | null
          student_id: string
        }
        Insert: {
          cefr_band: string
          created_at?: string
          gate_type: string
          hesitation_events?: number | null
          hub: string
          id?: string
          min_volume_db?: number | null
          passed?: boolean | null
          repair_chips_used?: number | null
          shields_listening?: number | null
          shields_reading?: number | null
          shields_reading_writing?: number | null
          shields_speaking?: number | null
          shields_total: number
          shields_writing?: number | null
          spontaneity_ratio?: number | null
          student_id: string
        }
        Update: {
          cefr_band?: string
          created_at?: string
          gate_type?: string
          hesitation_events?: number | null
          hub?: string
          id?: string
          min_volume_db?: number | null
          passed?: boolean | null
          repair_chips_used?: number | null
          shields_listening?: number | null
          shields_reading?: number | null
          shields_reading_writing?: number | null
          shields_speaking?: number | null
          shields_total?: number
          shields_writing?: number | null
          spontaneity_ratio?: number | null
          student_id?: string
        }
        Relationships: []
      }
      proficiency_papers: {
        Row: {
          cefr_band: string
          contract_id: string
          created_at: string
          created_by: string | null
          description: string | null
          hub: string
          id: string
          payload: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          cefr_band: string
          contract_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          hub: string
          id?: string
          payload?: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          cefr_band?: string
          contract_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          hub?: string
          id?: string
          payload?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      qa_judge_cache: {
        Row: {
          content_hash: string
          created_at: string
          judge_name: string
          result: Json
        }
        Insert: {
          content_hash: string
          created_at?: string
          judge_name: string
          result: Json
        }
        Update: {
          content_hash?: string
          created_at?: string
          judge_name?: string
          result?: Json
        }
        Relationships: []
      }
      qa_judge_cache_events: {
        Row: {
          content_hash: string
          created_at: string
          hit: boolean
          hub: string | null
          id: string
          judge_name: string
        }
        Insert: {
          content_hash: string
          created_at?: string
          hit: boolean
          hub?: string | null
          id?: string
          judge_name: string
        }
        Update: {
          content_hash?: string
          created_at?: string
          hit?: boolean
          hub?: string | null
          id?: string
          judge_name?: string
        }
        Relationships: []
      }
      qa_judge_ttl_overrides: {
        Row: {
          judge: string
          ttl_days: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          judge: string
          ttl_days: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          judge?: string
          ttl_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      qa_repair_events: {
        Row: {
          cefr: string | null
          created_at: string
          hub: string | null
          id: string
          issue_codes: string[]
          lesson_id: string
          lesson_kind: string | null
          pass_no: number
          target: string
          verdict: string | null
        }
        Insert: {
          cefr?: string | null
          created_at?: string
          hub?: string | null
          id?: string
          issue_codes?: string[]
          lesson_id: string
          lesson_kind?: string | null
          pass_no?: number
          target: string
          verdict?: string | null
        }
        Update: {
          cefr?: string | null
          created_at?: string
          hub?: string | null
          id?: string
          issue_codes?: string[]
          lesson_id?: string
          lesson_kind?: string | null
          pass_no?: number
          target?: string
          verdict?: string | null
        }
        Relationships: []
      }
      qa_repair_telemetry: {
        Row: {
          attempt_index: number
          blocking_engines: string[]
          cefr: string | null
          created_at: string
          hub: string | null
          id: string
          lesson_id: string | null
          locators: Json | null
          next_action: string
          overall_score: number | null
          repair_codes: string[]
        }
        Insert: {
          attempt_index?: number
          blocking_engines?: string[]
          cefr?: string | null
          created_at?: string
          hub?: string | null
          id?: string
          lesson_id?: string | null
          locators?: Json | null
          next_action: string
          overall_score?: number | null
          repair_codes?: string[]
        }
        Update: {
          attempt_index?: number
          blocking_engines?: string[]
          cefr?: string | null
          created_at?: string
          hub?: string | null
          id?: string
          lesson_id?: string | null
          locators?: Json | null
          next_action?: string
          overall_score?: number | null
          repair_codes?: string[]
        }
        Relationships: []
      }
      qa_sweep_audit: {
        Row: {
          actor_user_id: string | null
          cache_evicted: number
          created_at: string
          cutoff: string | null
          error: string | null
          events_evicted: number
          id: string
          triggered_by: string
          ttl_days: number
        }
        Insert: {
          actor_user_id?: string | null
          cache_evicted?: number
          created_at?: string
          cutoff?: string | null
          error?: string | null
          events_evicted?: number
          id?: string
          triggered_by?: string
          ttl_days?: number
        }
        Update: {
          actor_user_id?: string | null
          cache_evicted?: number
          created_at?: string
          cutoff?: string | null
          error?: string | null
          events_evicted?: number
          id?: string
          triggered_by?: string
          ttl_days?: number
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean
          response_time_ms: number | null
          selected_option_id: string
          session_id: string
          slide_id: string
          student_id: string
          student_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct: boolean
          response_time_ms?: number | null
          selected_option_id: string
          session_id: string
          slide_id: string
          student_id: string
          student_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          response_time_ms?: number | null
          selected_option_id?: string
          session_id?: string
          slide_id?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "classroom_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          friend_id: string
          id: string
          referrer_id: string
          reward_given: boolean
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          friend_id: string
          id?: string
          referrer_id: string
          reward_given?: boolean
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          friend_id?: string
          id?: string
          referrer_id?: string
          reward_given?: boolean
          status?: string
        }
        Relationships: []
      }
      remedial_lessons: {
        Row: {
          attempt_number: number
          completed_at: string | null
          created_at: string
          failed_tags: string[]
          generated_lesson_id: string | null
          hub: string | null
          id: string
          kind: string
          retest_lesson_id: string | null
          source_lesson_id: string | null
          status: string
          student_id: string
        }
        Insert: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          failed_tags?: string[]
          generated_lesson_id?: string | null
          hub?: string | null
          id?: string
          kind: string
          retest_lesson_id?: string | null
          source_lesson_id?: string | null
          status?: string
          student_id: string
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          failed_tags?: string[]
          generated_lesson_id?: string | null
          hub?: string | null
          id?: string
          kind?: string
          retest_lesson_id?: string | null
          source_lesson_id?: string | null
          status?: string
          student_id?: string
        }
        Relationships: []
      }
      resource_library: {
        Row: {
          age_group: string
          cefr_level: string
          content_data: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          downloads_count: number | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_public: boolean | null
          is_template: boolean | null
          resource_type: string
          skills: string[] | null
          title: string
          topics: string[] | null
          updated_at: string | null
        }
        Insert: {
          age_group: string
          cefr_level: string
          content_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          downloads_count?: number | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          resource_type: string
          skills?: string[] | null
          title: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age_group?: string
          cefr_level?: string
          content_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          downloads_count?: number | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          resource_type?: string
          skills?: string[] | null
          title?: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_splits: {
        Row: {
          applies_to: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          platform_percentage: number
          teacher_percentage: number
          updated_at: string | null
        }
        Insert: {
          applies_to?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          platform_percentage: number
          teacher_percentage: number
          updated_at?: string | null
        }
        Update: {
          applies_to?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          platform_percentage?: number
          teacher_percentage?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      review_queue: {
        Row: {
          created_at: string
          due_at: string
          ease_factor: number
          id: string
          interval_days: number
          item_key: string
          item_type: string
          priority: number
          repetitions: number
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          item_key: string
          item_type: string
          priority?: number
          repetitions?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          item_key?: string
          item_type?: string
          priority?: number
          repetitions?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_games: {
        Row: {
          age_level: string | null
          created_at: string
          game_data: Json
          id: string
          teacher_id: string
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          age_level?: string | null
          created_at?: string
          game_data: Json
          id?: string
          teacher_id: string
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          age_level?: string | null
          created_at?: string
          game_data?: Json
          id?: string
          teacher_id?: string
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      scaffold_strike_events: {
        Row: {
          block_id: string | null
          id: string
          lesson_id: string | null
          occurred_at: string
          phase: string | null
          strike_level: number
          student_id: string
          target_label: string
          target_type: string
        }
        Insert: {
          block_id?: string | null
          id?: string
          lesson_id?: string | null
          occurred_at?: string
          phase?: string | null
          strike_level: number
          student_id: string
          target_label: string
          target_type?: string
        }
        Update: {
          block_id?: string | null
          id?: string
          lesson_id?: string | null
          occurred_at?: string
          phase?: string | null
          strike_level?: number
          student_id?: string
          target_label?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "scaffold_strike_events_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_lessons: {
        Row: {
          auto_assigned: boolean
          badge: string | null
          class_id: string | null
          created_at: string
          id: string
          lesson_id: string
          scheduled_for: string | null
          source_remedial_id: string | null
          status: string
          student_id: string | null
          teacher_id: string
        }
        Insert: {
          auto_assigned?: boolean
          badge?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          scheduled_for?: string | null
          source_remedial_id?: string | null
          status?: string
          student_id?: string | null
          teacher_id: string
        }
        Update: {
          auto_assigned?: boolean
          badge?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          scheduled_for?: string | null
          source_remedial_id?: string | null
          status?: string
          student_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_lessons_source_remedial_id_fkey"
            columns: ["source_remedial_id"]
            isOneToOne: false
            referencedRelation: "remedial_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_events: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean
          name: string
          participation_requirements: Json | null
          special_rewards: Json
          start_date: string
          theme_data: Json
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          participation_requirements?: Json | null
          special_rewards?: Json
          start_date: string
          theme_data?: Json
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          participation_requirements?: Json | null
          special_rewards?: Json
          start_date?: string
          theme_data?: Json
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sentinel_incidents: {
        Row: {
          apply_error: string | null
          component_name: string
          confidence_score: number
          created_at: string
          cto_explanation: string | null
          current_state: Json
          error_message: string
          error_stack: string | null
          id: string
          proposed_data_patch: Json | null
          requires_human_intervention: boolean
          resolved_at: string | null
          reviewed_by: string | null
          root_cause_analysis: string | null
          route: string | null
          status: string
          target_row_id: string | null
          target_table: string | null
          user_id: string | null
        }
        Insert: {
          apply_error?: string | null
          component_name: string
          confidence_score?: number
          created_at?: string
          cto_explanation?: string | null
          current_state?: Json
          error_message: string
          error_stack?: string | null
          id?: string
          proposed_data_patch?: Json | null
          requires_human_intervention?: boolean
          resolved_at?: string | null
          reviewed_by?: string | null
          root_cause_analysis?: string | null
          route?: string | null
          status?: string
          target_row_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Update: {
          apply_error?: string | null
          component_name?: string
          confidence_score?: number
          created_at?: string
          cto_explanation?: string | null
          current_state?: Json
          error_message?: string
          error_stack?: string | null
          id?: string
          proposed_data_patch?: Json | null
          requires_human_intervention?: boolean
          resolved_at?: string | null
          reviewed_by?: string | null
          root_cause_analysis?: string | null
          route?: string | null
          status?: string
          target_row_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      skill_mastery: {
        Row: {
          communicative_uses: number
          confidence: number
          created_at: string
          exposures: number
          id: string
          last_seen: string | null
          mastery: number
          review_priority: string
          skill_domain: string
          skill_key: string
          student_id: string
          trend: string
          updated_at: string
        }
        Insert: {
          communicative_uses?: number
          confidence?: number
          created_at?: string
          exposures?: number
          id?: string
          last_seen?: string | null
          mastery?: number
          review_priority?: string
          skill_domain: string
          skill_key: string
          student_id: string
          trend?: string
          updated_at?: string
        }
        Update: {
          communicative_uses?: number
          confidence?: number
          created_at?: string
          exposures?: number
          id?: string
          last_seen?: string | null
          mastery?: number
          review_priority?: string
          skill_domain?: string
          skill_key?: string
          student_id?: string
          trend?: string
          updated_at?: string
        }
        Relationships: []
      }
      sla_error_history: {
        Row: {
          created_at: string
          detail: Json | null
          engine: string
          gate_code: string
          id: string
          kind: string | null
          lesson_id: string | null
          memory_item_id: string | null
          message: string | null
          occurred_at: string
          severity: string
          slide_index: number | null
          student_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json | null
          engine?: string
          gate_code: string
          id?: string
          kind?: string | null
          lesson_id?: string | null
          memory_item_id?: string | null
          message?: string | null
          occurred_at?: string
          severity: string
          slide_index?: number | null
          student_id: string
        }
        Update: {
          created_at?: string
          detail?: Json | null
          engine?: string
          gate_code?: string
          id?: string
          kind?: string | null
          lesson_id?: string | null
          memory_item_id?: string | null
          message?: string | null
          occurred_at?: string
          severity?: string
          slide_index?: number | null
          student_id?: string
        }
        Relationships: []
      }
      sla_validation_logs: {
        Row: {
          cefr: string | null
          created_at: string
          error_count: number
          gate_codes: string[]
          hub: string
          id: string
          issues: Json
          lesson_id: string | null
          saved_by: string | null
          slide_count: number
          source: string
          student_id: string | null
          verdict: string
          warning_count: number
        }
        Insert: {
          cefr?: string | null
          created_at?: string
          error_count?: number
          gate_codes?: string[]
          hub: string
          id?: string
          issues?: Json
          lesson_id?: string | null
          saved_by?: string | null
          slide_count?: number
          source?: string
          student_id?: string | null
          verdict: string
          warning_count?: number
        }
        Update: {
          cefr?: string | null
          created_at?: string
          error_count?: number
          gate_codes?: string[]
          hub?: string
          id?: string
          issues?: Json
          lesson_id?: string | null
          saved_by?: string | null
          slide_count?: number
          source?: string
          student_id?: string | null
          verdict?: string
          warning_count?: number
        }
        Relationships: []
      }
      speaking_attempts: {
        Row: {
          bravery_bonus: boolean
          created_at: string
          duration_ms: number
          hesitations: number
          hub: string
          id: string
          lesson_id: string | null
          pronunciation_attempt_id: string | null
          rung: string
          scenario_key: string | null
          slide_id: string | null
          student_id: string
          success: boolean
          target_text: string | null
          task_type: string
          transcript: string | null
          wpm: number
        }
        Insert: {
          bravery_bonus?: boolean
          created_at?: string
          duration_ms?: number
          hesitations?: number
          hub: string
          id?: string
          lesson_id?: string | null
          pronunciation_attempt_id?: string | null
          rung: string
          scenario_key?: string | null
          slide_id?: string | null
          student_id: string
          success?: boolean
          target_text?: string | null
          task_type: string
          transcript?: string | null
          wpm?: number
        }
        Update: {
          bravery_bonus?: boolean
          created_at?: string
          duration_ms?: number
          hesitations?: number
          hub?: string
          id?: string
          lesson_id?: string | null
          pronunciation_attempt_id?: string | null
          rung?: string
          scenario_key?: string | null
          slide_id?: string | null
          student_id?: string
          success?: boolean
          target_text?: string | null
          task_type?: string
          transcript?: string | null
          wpm?: number
        }
        Relationships: []
      }
      speaking_classroom_sessions: {
        Row: {
          avg_response_time: number | null
          created_at: string | null
          difficulty_level: string | null
          ended_at: string | null
          generated_topic: string | null
          group_id: string | null
          id: string
          questions_answered: number | null
          session_metadata: Json | null
          session_type: string | null
          started_at: string | null
          student_id: string | null
          topic_id: string | null
          total_questions: number | null
          vocabulary_used: Json | null
        }
        Insert: {
          avg_response_time?: number | null
          created_at?: string | null
          difficulty_level?: string | null
          ended_at?: string | null
          generated_topic?: string | null
          group_id?: string | null
          id?: string
          questions_answered?: number | null
          session_metadata?: Json | null
          session_type?: string | null
          started_at?: string | null
          student_id?: string | null
          topic_id?: string | null
          total_questions?: number | null
          vocabulary_used?: Json | null
        }
        Update: {
          avg_response_time?: number | null
          created_at?: string | null
          difficulty_level?: string | null
          ended_at?: string | null
          generated_topic?: string | null
          group_id?: string | null
          id?: string
          questions_answered?: number | null
          session_metadata?: Json | null
          session_type?: string | null
          started_at?: string | null
          student_id?: string | null
          topic_id?: string | null
          total_questions?: number | null
          vocabulary_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "speaking_classroom_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "speaking_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaking_classroom_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_group_participants: {
        Row: {
          ai_feedback: Json | null
          group_id: string
          id: string
          joined_at: string | null
          left_at: string | null
          participation_score: number | null
          questions_answered: number | null
          questions_asked: number | null
          session_id: string | null
          speaking_time_seconds: number | null
          student_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          group_id: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          participation_score?: number | null
          questions_answered?: number | null
          questions_asked?: number | null
          session_id?: string | null
          speaking_time_seconds?: number | null
          student_id: string
        }
        Update: {
          ai_feedback?: Json | null
          group_id?: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          participation_score?: number | null
          questions_answered?: number | null
          questions_asked?: number | null
          session_id?: string | null
          speaking_time_seconds?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_group_participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "speaking_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaking_group_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "speaking_group_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_group_sessions: {
        Row: {
          ai_facilitator_prompt: string | null
          created_at: string | null
          ended_at: string | null
          group_id: string
          id: string
          participant_count: number | null
          scheduled_at: string | null
          session_metadata: Json | null
          session_status: string | null
          session_topic: string
          started_at: string | null
        }
        Insert: {
          ai_facilitator_prompt?: string | null
          created_at?: string | null
          ended_at?: string | null
          group_id: string
          id?: string
          participant_count?: number | null
          scheduled_at?: string | null
          session_metadata?: Json | null
          session_status?: string | null
          session_topic: string
          started_at?: string | null
        }
        Update: {
          ai_facilitator_prompt?: string | null
          created_at?: string | null
          ended_at?: string | null
          group_id?: string
          id?: string
          participant_count?: number | null
          scheduled_at?: string | null
          session_metadata?: Json | null
          session_status?: string | null
          session_topic?: string
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speaking_group_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "speaking_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_groups: {
        Row: {
          cefr_level: string
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          group_name: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          session_duration: number | null
          topic_category: string | null
          updated_at: string | null
        }
        Insert: {
          cefr_level: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          group_name: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          session_duration?: number | null
          topic_category?: string | null
          updated_at?: string | null
        }
        Update: {
          cefr_level?: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          group_name?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          session_duration?: number | null
          topic_category?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      speaking_profile: {
        Row: {
          bravery_count: number
          confidence_score: number
          connected_speech_score: number
          created_at: string
          current_rung: string
          fluency_score: number
          hesitation_ratio: number
          hub: string
          id: string
          last_assessed_at: string | null
          mean_length_utterance: number
          student_id: string
          updated_at: string
        }
        Insert: {
          bravery_count?: number
          confidence_score?: number
          connected_speech_score?: number
          created_at?: string
          current_rung?: string
          fluency_score?: number
          hesitation_ratio?: number
          hub: string
          id?: string
          last_assessed_at?: string | null
          mean_length_utterance?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          bravery_count?: number
          confidence_score?: number
          connected_speech_score?: number
          created_at?: string
          current_rung?: string
          fluency_score?: number
          hesitation_ratio?: number
          hub?: string
          id?: string
          last_assessed_at?: string | null
          mean_length_utterance?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      speaking_progress: {
        Row: {
          badges_earned: string[] | null
          created_at: string | null
          current_cefr_level: string
          current_streak: number
          id: string
          last_practice_date: string | null
          longest_streak: number
          speaking_xp: number
          student_id: string
          total_sessions: number
          total_speaking_time: number
          updated_at: string | null
        }
        Insert: {
          badges_earned?: string[] | null
          created_at?: string | null
          current_cefr_level?: string
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          speaking_xp?: number
          student_id: string
          total_sessions?: number
          total_speaking_time?: number
          updated_at?: string | null
        }
        Update: {
          badges_earned?: string[] | null
          created_at?: string | null
          current_cefr_level?: string
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          speaking_xp?: number
          student_id?: string
          total_sessions?: number
          total_speaking_time?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      speaking_questions: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          group_session_id: string | null
          id: string
          question_text: string
          question_type: string | null
          response_time_seconds: number | null
          session_id: string | null
          student_response: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          group_session_id?: string | null
          id?: string
          question_text: string
          question_type?: string | null
          response_time_seconds?: number | null
          session_id?: string | null
          student_response?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          group_session_id?: string | null
          id?: string
          question_text?: string
          question_type?: string | null
          response_time_seconds?: number | null
          session_id?: string | null
          student_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speaking_questions_group_session_id_fkey"
            columns: ["group_session_id"]
            isOneToOne: false
            referencedRelation: "speaking_group_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaking_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "speaking_classroom_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_scenarios: {
        Row: {
          cefr_level: string
          context_instructions: string | null
          created_at: string | null
          description: string
          difficulty_rating: number | null
          expected_duration: number
          id: string
          is_active: boolean | null
          name: string
          prompt: string
          tags: string[] | null
          type: string
        }
        Insert: {
          cefr_level: string
          context_instructions?: string | null
          created_at?: string | null
          description: string
          difficulty_rating?: number | null
          expected_duration?: number
          id?: string
          is_active?: boolean | null
          name: string
          prompt: string
          tags?: string[] | null
          type: string
        }
        Update: {
          cefr_level?: string
          context_instructions?: string | null
          created_at?: string | null
          description?: string
          difficulty_rating?: number | null
          expected_duration?: number
          id?: string
          is_active?: boolean | null
          name?: string
          prompt?: string
          tags?: string[] | null
          type?: string
        }
        Relationships: []
      }
      speaking_sessions: {
        Row: {
          cefr_level: string
          completed_at: string | null
          created_at: string | null
          duration_seconds: number
          feedback_notes: string | null
          fluency_score: number | null
          grammar_score: number | null
          id: string
          overall_rating: number | null
          pronunciation_score: number | null
          scenario_name: string
          session_type: string
          student_id: string
          xp_earned: number
        }
        Insert: {
          cefr_level: string
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number
          feedback_notes?: string | null
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          overall_rating?: number | null
          pronunciation_score?: number | null
          scenario_name: string
          session_type: string
          student_id: string
          xp_earned?: number
        }
        Update: {
          cefr_level?: string
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number
          feedback_notes?: string | null
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          overall_rating?: number | null
          pronunciation_score?: number | null
          scenario_name?: string
          session_type?: string
          student_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      speaking_submissions: {
        Row: {
          audio_path: string
          created_at: string
          duration_sec: number | null
          id: string
          prompt: string
          reviewed_at: string | null
          status: string
          student_id: string
          teacher_feedback: string | null
          teacher_id: string | null
          theme: string
        }
        Insert: {
          audio_path: string
          created_at?: string
          duration_sec?: number | null
          id?: string
          prompt: string
          reviewed_at?: string | null
          status?: string
          student_id: string
          teacher_feedback?: string | null
          teacher_id?: string | null
          theme: string
        }
        Update: {
          audio_path?: string
          created_at?: string
          duration_sec?: number | null
          id?: string
          prompt?: string
          reviewed_at?: string | null
          status?: string
          student_id?: string
          teacher_feedback?: string | null
          teacher_id?: string | null
          theme?: string
        }
        Relationships: []
      }
      speaking_task_history: {
        Row: {
          created_at: string
          hub: string
          id: string
          last_used_at: string
          scenario_key: string
          student_id: string
          task_type: string
          updated_at: string
          use_count: number
        }
        Insert: {
          created_at?: string
          hub: string
          id?: string
          last_used_at?: string
          scenario_key: string
          student_id: string
          task_type: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          created_at?: string
          hub?: string
          id?: string
          last_used_at?: string
          scenario_key?: string
          student_id?: string
          task_type?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: []
      }
      speech_attempts: {
        Row: {
          accuracy_score: number | null
          created_at: string
          feedback: string | null
          fluency_score: number | null
          hub: string
          id: string
          lesson_id: string | null
          overall_score: number
          pronunciation_score: number | null
          slide_id: string | null
          target_sentence: string
          tier: string
          transcript: string | null
          user_id: string
          word_breakdown: Json | null
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          feedback?: string | null
          fluency_score?: number | null
          hub?: string
          id?: string
          lesson_id?: string | null
          overall_score: number
          pronunciation_score?: number | null
          slide_id?: string | null
          target_sentence: string
          tier: string
          transcript?: string | null
          user_id: string
          word_breakdown?: Json | null
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          feedback?: string | null
          fluency_score?: number | null
          hub?: string
          id?: string
          lesson_id?: string | null
          overall_score?: number
          pronunciation_score?: number | null
          slide_id?: string | null
          target_sentence?: string
          tier?: string
          transcript?: string | null
          user_id?: string
          word_breakdown?: Json | null
        }
        Relationships: []
      }
      spiral_progression_state: {
        Row: {
          context_history: Json
          current_stage: number
          hub: string
          id: string
          next_escalation: Json | null
          skill_key: string
          student_id: string
          updated_at: string
        }
        Insert: {
          context_history?: Json
          current_stage?: number
          hub: string
          id?: string
          next_escalation?: Json | null
          skill_key: string
          student_id: string
          updated_at?: string
        }
        Update: {
          context_history?: Json
          current_stage?: number
          hub?: string
          id?: string
          next_escalation?: Json | null
          skill_key?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_contracts: {
        Row: {
          base_rate_eur: number
          bonus_structure: Json | null
          contract_pdf_url: string | null
          contract_status: string
          contract_type: string
          created_at: string
          end_date: string | null
          id: string
          signed_at: string | null
          start_date: string
          teacher_id: string
          teacher_name: string | null
          updated_at: string
        }
        Insert: {
          base_rate_eur?: number
          bonus_structure?: Json | null
          contract_pdf_url?: string | null
          contract_status?: string
          contract_type?: string
          created_at?: string
          end_date?: string | null
          id?: string
          signed_at?: string | null
          start_date: string
          teacher_id: string
          teacher_name?: string | null
          updated_at?: string
        }
        Update: {
          base_rate_eur?: number
          bonus_structure?: Json | null
          contract_pdf_url?: string | null
          contract_status?: string
          contract_type?: string
          created_at?: string
          end_date?: string | null
          id?: string
          signed_at?: string | null
          start_date?: string
          teacher_id?: string
          teacher_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      storybook_chapters: {
        Row: {
          audio_url: string | null
          book_id: string
          created_at: string
          id: string
          learning_objective: string | null
          order_index: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          book_id: string
          created_at?: string
          id?: string
          learning_objective?: string | null
          order_index: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          book_id?: string
          created_at?: string
          id?: string
          learning_objective?: string | null
          order_index?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storybook_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "storybooks"
            referencedColumns: ["id"]
          },
        ]
      }
      storybook_character_bindings: {
        Row: {
          arc_notes: string | null
          book_id: string
          character_id: string
          created_at: string
          id: string
          role_in_story: string | null
        }
        Insert: {
          arc_notes?: string | null
          book_id: string
          character_id: string
          created_at?: string
          id?: string
          role_in_story?: string | null
        }
        Update: {
          arc_notes?: string | null
          book_id?: string
          character_id?: string
          created_at?: string
          id?: string
          role_in_story?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storybook_character_bindings_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "storybooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storybook_character_bindings_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "cast_vault_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      storybook_continuity: {
        Row: {
          hub: string
          id: string
          last_emotional_beat: Json | null
          recurring_characters: Json
          story_history: Json
          student_id: string
          updated_at: string
          world_state: Json
        }
        Insert: {
          hub: string
          id?: string
          last_emotional_beat?: Json | null
          recurring_characters?: Json
          story_history?: Json
          student_id: string
          updated_at?: string
          world_state?: Json
        }
        Update: {
          hub?: string
          id?: string
          last_emotional_beat?: Json | null
          recurring_characters?: Json
          story_history?: Json
          student_id?: string
          updated_at?: string
          world_state?: Json
        }
        Relationships: []
      }
      storybook_pages: {
        Row: {
          audio_url: string | null
          chapter_id: string
          content: Json
          created_at: string
          id: string
          illustration_url: string | null
          interactive_data: Json | null
          order_index: number
          page_type: Database["public"]["Enums"]["storybook_page_type"]
          updated_at: string
          vocab_inline: Json
        }
        Insert: {
          audio_url?: string | null
          chapter_id: string
          content?: Json
          created_at?: string
          id?: string
          illustration_url?: string | null
          interactive_data?: Json | null
          order_index: number
          page_type: Database["public"]["Enums"]["storybook_page_type"]
          updated_at?: string
          vocab_inline?: Json
        }
        Update: {
          audio_url?: string | null
          chapter_id?: string
          content?: Json
          created_at?: string
          id?: string
          illustration_url?: string | null
          interactive_data?: Json | null
          order_index?: number
          page_type?: Database["public"]["Enums"]["storybook_page_type"]
          updated_at?: string
          vocab_inline?: Json
        }
        Relationships: [
          {
            foreignKeyName: "storybook_pages_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "storybook_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      storybook_reading_sessions: {
        Row: {
          book_id: string
          comprehension_score: number | null
          created_at: string
          ended_at: string | null
          fluency_wpm: number | null
          id: string
          mode: Database["public"]["Enums"]["reading_session_mode"]
          pages_read: number
          speaking_attempts: Json
          started_at: string
          student_id: string
          vocab_attempts: Json
          words_read: number
        }
        Insert: {
          book_id: string
          comprehension_score?: number | null
          created_at?: string
          ended_at?: string | null
          fluency_wpm?: number | null
          id?: string
          mode?: Database["public"]["Enums"]["reading_session_mode"]
          pages_read?: number
          speaking_attempts?: Json
          started_at?: string
          student_id: string
          vocab_attempts?: Json
          words_read?: number
        }
        Update: {
          book_id?: string
          comprehension_score?: number | null
          created_at?: string
          ended_at?: string | null
          fluency_wpm?: number | null
          id?: string
          mode?: Database["public"]["Enums"]["reading_session_mode"]
          pages_read?: number
          speaking_attempts?: Json
          started_at?: string
          student_id?: string
          vocab_attempts?: Json
          words_read?: number
        }
        Relationships: [
          {
            foreignKeyName: "storybook_reading_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "storybooks"
            referencedColumns: ["id"]
          },
        ]
      }
      storybooks: {
        Row: {
          adaptive_state: Json
          audio_layer: Json
          cefr_level: string
          communication_goals: Json
          cover_image_url: string | null
          created_at: string
          created_by: string
          grammar_targets: Json
          hub: string
          id: string
          published: boolean
          qa_report: Json | null
          status: Database["public"]["Enums"]["storybook_status"]
          story_arc: Json
          title: string
          unit_id: string | null
          updated_at: string
          vocabulary_targets: Json
        }
        Insert: {
          adaptive_state?: Json
          audio_layer?: Json
          cefr_level: string
          communication_goals?: Json
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          grammar_targets?: Json
          hub: string
          id?: string
          published?: boolean
          qa_report?: Json | null
          status?: Database["public"]["Enums"]["storybook_status"]
          story_arc?: Json
          title: string
          unit_id?: string | null
          updated_at?: string
          vocabulary_targets?: Json
        }
        Update: {
          adaptive_state?: Json
          audio_layer?: Json
          cefr_level?: string
          communication_goals?: Json
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          grammar_targets?: Json
          hub?: string
          id?: string
          published?: boolean
          qa_report?: Json | null
          status?: Database["public"]["Enums"]["storybook_status"]
          story_arc?: Json
          title?: string
          unit_id?: string | null
          updated_at?: string
          vocabulary_targets?: Json
        }
        Relationships: []
      }
      student_accessories: {
        Row: {
          accessory_id: string
          id: string
          is_equipped: boolean | null
          student_id: string
          unlocked_at: string
        }
        Insert: {
          accessory_id: string
          id?: string
          is_equipped?: boolean | null
          student_id: string
          unlocked_at?: string
        }
        Update: {
          accessory_id?: string
          id?: string
          is_equipped?: boolean | null
          student_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_accessories_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievement_tiers: {
        Row: {
          achievement_tier_id: string
          created_at: string
          id: string
          is_unlocked: boolean
          progress_data: Json
          student_id: string
          unlocked_at: string | null
        }
        Insert: {
          achievement_tier_id: string
          created_at?: string
          id?: string
          is_unlocked?: boolean
          progress_data?: Json
          student_id: string
          unlocked_at?: string | null
        }
        Update: {
          achievement_tier_id?: string
          created_at?: string
          id?: string
          is_unlocked?: boolean
          progress_data?: Json
          student_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_achievement_tiers_achievement_tier_id_fkey"
            columns: ["achievement_tier_id"]
            isOneToOne: false
            referencedRelation: "achievement_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          progress: Json | null
          student_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          progress?: Json | null
          student_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          progress?: Json | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      student_assignments: {
        Row: {
          assigned_at: string
          completed_at: string | null
          id: string
          lesson_id: string
          status: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          id?: string
          lesson_id: string
          status?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          id?: string
          lesson_id?: string
          status?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_badges: {
        Row: {
          badge_description: string | null
          badge_icon: string | null
          badge_name: string
          created_at: string | null
          criteria_met: Json | null
          id: string
          student_id: string
          unlocked_at: string | null
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name: string
          created_at?: string | null
          criteria_met?: Json | null
          id?: string
          student_id: string
          unlocked_at?: string | null
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string
          created_at?: string | null
          criteria_met?: Json | null
          id?: string
          student_id?: string
          unlocked_at?: string | null
        }
        Relationships: []
      }
      student_cefr_progress: {
        Row: {
          created_at: string
          id: string
          last_updated: string
          level: string
          percent_to_next: number
          student_id: string
          updated_by_teacher_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated?: string
          level?: string
          percent_to_next?: number
          student_id: string
          updated_by_teacher_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_updated?: string
          level?: string
          percent_to_next?: number
          student_id?: string
          updated_by_teacher_id?: string | null
        }
        Relationships: []
      }
      student_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          completion_percentage: number
          id: string
          is_completed: boolean
          progress_data: Json
          started_at: string
          student_id: string
          updated_at: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          completion_percentage?: number
          id?: string
          is_completed?: boolean
          progress_data?: Json
          started_at?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          completion_percentage?: number
          id?: string
          is_completed?: boolean
          progress_data?: Json
          started_at?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "learning_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      student_credits: {
        Row: {
          created_at: string
          expired_credits: number
          id: string
          student_id: string
          total_credits: number
          updated_at: string
          used_credits: number
        }
        Insert: {
          created_at?: string
          expired_credits?: number
          id?: string
          student_id: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
        }
        Update: {
          created_at?: string
          expired_credits?: number
          id?: string
          student_id?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
        }
        Relationships: []
      }
      student_curriculum_assignments: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          current_lesson_number: number | null
          id: string
          lessons_completed: string[] | null
          stage_id: number
          stage_name: string
          status: string | null
          student_id: string
          total_lessons_in_unit: number
          unit_id: string
          unit_name: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          current_lesson_number?: number | null
          id?: string
          lessons_completed?: string[] | null
          stage_id: number
          stage_name: string
          status?: string | null
          student_id: string
          total_lessons_in_unit: number
          unit_id: string
          unit_name: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          current_lesson_number?: number | null
          id?: string
          lessons_completed?: string[] | null
          stage_id?: number
          stage_name?: string
          status?: string | null
          student_id?: string
          total_lessons_in_unit?: number
          unit_id?: string
          unit_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_curriculum_progress: {
        Row: {
          completion_percentage: number | null
          conversation_milestones_achieved: string[] | null
          current_lesson: number | null
          current_lesson_id: string | null
          current_week: number | null
          curriculum_id: string
          grammar_patterns_learned: string[] | null
          id: string
          last_activity_at: string | null
          neuroscience_scores: Json | null
          next_lesson_id: string | null
          placement_test_completed: boolean | null
          recommended_stage_id: number | null
          started_at: string | null
          student_id: string
          vocabulary_mastered: string[] | null
        }
        Insert: {
          completion_percentage?: number | null
          conversation_milestones_achieved?: string[] | null
          current_lesson?: number | null
          current_lesson_id?: string | null
          current_week?: number | null
          curriculum_id: string
          grammar_patterns_learned?: string[] | null
          id?: string
          last_activity_at?: string | null
          neuroscience_scores?: Json | null
          next_lesson_id?: string | null
          placement_test_completed?: boolean | null
          recommended_stage_id?: number | null
          started_at?: string | null
          student_id: string
          vocabulary_mastered?: string[] | null
        }
        Update: {
          completion_percentage?: number | null
          conversation_milestones_achieved?: string[] | null
          current_lesson?: number | null
          current_lesson_id?: string | null
          current_week?: number | null
          curriculum_id?: string
          grammar_patterns_learned?: string[] | null
          id?: string
          last_activity_at?: string | null
          neuroscience_scores?: Json | null
          next_lesson_id?: string | null
          placement_test_completed?: boolean | null
          recommended_stage_id?: number | null
          started_at?: string | null
          student_id?: string
          vocabulary_mastered?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "student_curriculum_progress_current_lesson_id_fkey"
            columns: ["current_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_curriculum_progress_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "generated_curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      student_engine_runs: {
        Row: {
          accuracy: number
          attempts: number
          cefr: string | null
          correct: number
          created_at: string
          duration_ms: number
          engine: string
          hub: string | null
          id: string
          unit_id: string
          user_id: string
        }
        Insert: {
          accuracy: number
          attempts?: number
          cefr?: string | null
          correct?: number
          created_at?: string
          duration_ms?: number
          engine: string
          hub?: string | null
          id?: string
          unit_id: string
          user_id?: string
        }
        Update: {
          accuracy?: number
          attempts?: number
          cefr?: string | null
          correct?: number
          created_at?: string
          duration_ms?: number
          engine?: string
          hub?: string | null
          id?: string
          unit_id?: string
          user_id?: string
        }
        Relationships: []
      }
      student_game_progress: {
        Row: {
          best_score: number
          completed_at: string | null
          game_id: string
          id: string
          last_played_at: string
          status: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          best_score?: number
          completed_at?: string | null
          game_id: string
          id?: string
          last_played_at?: string
          status?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          best_score?: number
          completed_at?: string | null
          game_id?: string
          id?: string
          last_played_at?: string
          status?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_game_progress_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "learning_games"
            referencedColumns: ["id"]
          },
        ]
      }
      student_inventory: {
        Row: {
          accessory_id: string
          id: string
          is_equipped: boolean
          student_id: string
          unlocked_at: string
        }
        Insert: {
          accessory_id: string
          id?: string
          is_equipped?: boolean
          student_id: string
          unlocked_at?: string
        }
        Update: {
          accessory_id?: string
          id?: string
          is_equipped?: boolean
          student_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_inventory_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
        ]
      }
      student_learning_streaks: {
        Row: {
          bonus_coins_earned: number
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string
          longest_streak: number
          streak_multiplier: number
          streak_type: string
          student_id: string
          updated_at: string
        }
        Insert: {
          bonus_coins_earned?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          streak_multiplier?: number
          streak_type: string
          student_id: string
          updated_at?: string
        }
        Update: {
          bonus_coins_earned?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          streak_multiplier?: number
          streak_type?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_lesson_progress: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          score: number | null
          started_at: string | null
          status: string
          time_spent_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          score?: number | null
          started_at?: string | null
          status?: string
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_library: {
        Row: {
          book_id: string
          created_at: string
          id: string
          last_page_id: string | null
          reading_progress: number
          status: Database["public"]["Enums"]["library_status"]
          student_id: string
          unlock_reason: string | null
          unlocked_at: string | null
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          last_page_id?: string | null
          reading_progress?: number
          status?: Database["public"]["Enums"]["library_status"]
          student_id: string
          unlock_reason?: string | null
          unlocked_at?: string | null
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          last_page_id?: string | null
          reading_progress?: number
          status?: Database["public"]["Enums"]["library_status"]
          student_id?: string
          unlock_reason?: string | null
          unlocked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_library_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "storybooks"
            referencedColumns: ["id"]
          },
        ]
      }
      student_mastery: {
        Row: {
          created_at: string
          hub: string
          id: string
          item_key: string
          item_type: string
          last_tested: string | null
          mastery_score: number
          next_review_at: string
          srs_strategy: string
          srs_streak: number
          times_correct: number
          times_incorrect: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hub?: string
          id?: string
          item_key: string
          item_type?: string
          last_tested?: string | null
          mastery_score?: number
          next_review_at?: string
          srs_strategy?: string
          srs_streak?: number
          times_correct?: number
          times_incorrect?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hub?: string
          id?: string
          item_key?: string
          item_type?: string
          last_tested?: string | null
          mastery_score?: number
          next_review_at?: string
          srs_strategy?: string
          srs_streak?: number
          times_correct?: number
          times_incorrect?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string | null
          narrative: Json
          started_at: string
          status: string
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          narrative: Json
          started_at?: string
          status?: string
          student_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          narrative?: Json
          started_at?: string
          status?: string
          student_id?: string
        }
        Relationships: []
      }
      student_motivation_profile: {
        Row: {
          created_at: string
          encouragement_style: string
          last_recomputed_at: string
          profile_type: string
          reward_density: string
          signals: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          encouragement_style?: string
          last_recomputed_at?: string
          profile_type?: string
          reward_density?: string
          signals?: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          encouragement_style?: string
          last_recomputed_at?: string
          profile_type?: string
          reward_density?: string
          signals?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_package_purchases: {
        Row: {
          expires_at: string | null
          id: string
          lessons_remaining: number
          package_id: string
          payment_id: string | null
          purchased_at: string
          student_id: string
          total_lessons: number
        }
        Insert: {
          expires_at?: string | null
          id?: string
          lessons_remaining: number
          package_id: string
          payment_id?: string | null
          purchased_at?: string
          student_id: string
          total_lessons: number
        }
        Update: {
          expires_at?: string | null
          id?: string
          lessons_remaining?: number
          package_id?: string
          payment_id?: string | null
          purchased_at?: string
          student_id?: string
          total_lessons?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_package_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "lesson_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parent_relationships: {
        Row: {
          approved_at: string | null
          can_book_lessons: boolean | null
          can_communicate_teachers: boolean | null
          can_view_progress: boolean | null
          created_at: string
          id: string
          is_primary_contact: boolean | null
          parent_id: string
          relationship_type: string
          student_id: string
        }
        Insert: {
          approved_at?: string | null
          can_book_lessons?: boolean | null
          can_communicate_teachers?: boolean | null
          can_view_progress?: boolean | null
          created_at?: string
          id?: string
          is_primary_contact?: boolean | null
          parent_id: string
          relationship_type: string
          student_id: string
        }
        Update: {
          approved_at?: string | null
          can_book_lessons?: boolean | null
          can_communicate_teachers?: boolean | null
          can_view_progress?: boolean | null
          created_at?: string
          id?: string
          is_primary_contact?: boolean | null
          parent_id?: string
          relationship_type?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_parent_relationships_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_parent_relationships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_phonics_progress: {
        Row: {
          audio_url: string | null
          created_at: string | null
          id: string
          image_url: string | null
          lesson_id: string | null
          mastered_at: string | null
          mastery_level: string | null
          phoneme: string
          student_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          lesson_id?: string | null
          mastered_at?: string | null
          mastery_level?: string | null
          phoneme: string
          student_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          lesson_id?: string | null
          mastered_at?: string | null
          mastery_level?: string | null
          phoneme?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_phonics_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          age: number | null
          cefr_level: string
          companion_id: string | null
          created_at: string
          current_streak: number | null
          daily_streak: number | null
          date_of_birth: string | null
          emergency_contact: string | null
          final_cefr_level: string | null
          fluency_score: number
          gaps: string[] | null
          grade_level: string | null
          hub_type: string | null
          id: string
          interests: string[] | null
          last_activity_date: string | null
          last_completed_sequence_a1: number | null
          last_completed_sequence_a2: number | null
          last_completed_sequence_b1: number | null
          last_completed_sequence_b2: number | null
          last_completed_sequence_prea1: number | null
          last_streak_date: string | null
          learning_reason: string | null
          learning_style: string | null
          lesson_duration: number | null
          lessons_since_literacy_probe: number
          literacy_exit_passes: number
          literacy_foundation_unit: string | null
          literacy_last_probe: Json | null
          literacy_reinforcement_queued: boolean
          literacy_route_reason: string | null
          literacy_self_declared: boolean | null
          literacy_unit_fail_streak: number
          long_term_goal: string | null
          longest_streak: number | null
          mistake_history: Json | null
          needs_literacy_support: boolean
          onboarding_completed: boolean | null
          parent_email: string | null
          pet_happiness: number | null
          pet_type: string | null
          placement_test_2_completed_at: string | null
          placement_test_2_score: number | null
          placement_test_2_total: number | null
          placement_test_completed_at: string | null
          placement_test_score: number | null
          placement_test_total: number | null
          preferred_lesson_time: string | null
          profile_completion_dismissed_at: string | null
          profile_image_url: string | null
          school_name: string | null
          strengths: string[] | null
          student_level: Database["public"]["Enums"]["student_level"] | null
          timezone: string | null
          updated_at: string
          user_id: string
          weekly_goal: string | null
          weekly_goal_set_at: string | null
          weekly_minutes: number | null
          words_learned_today: number | null
        }
        Insert: {
          age?: number | null
          cefr_level?: string
          companion_id?: string | null
          created_at?: string
          current_streak?: number | null
          daily_streak?: number | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          final_cefr_level?: string | null
          fluency_score?: number
          gaps?: string[] | null
          grade_level?: string | null
          hub_type?: string | null
          id?: string
          interests?: string[] | null
          last_activity_date?: string | null
          last_completed_sequence_a1?: number | null
          last_completed_sequence_a2?: number | null
          last_completed_sequence_b1?: number | null
          last_completed_sequence_b2?: number | null
          last_completed_sequence_prea1?: number | null
          last_streak_date?: string | null
          learning_reason?: string | null
          learning_style?: string | null
          lesson_duration?: number | null
          lessons_since_literacy_probe?: number
          literacy_exit_passes?: number
          literacy_foundation_unit?: string | null
          literacy_last_probe?: Json | null
          literacy_reinforcement_queued?: boolean
          literacy_route_reason?: string | null
          literacy_self_declared?: boolean | null
          literacy_unit_fail_streak?: number
          long_term_goal?: string | null
          longest_streak?: number | null
          mistake_history?: Json | null
          needs_literacy_support?: boolean
          onboarding_completed?: boolean | null
          parent_email?: string | null
          pet_happiness?: number | null
          pet_type?: string | null
          placement_test_2_completed_at?: string | null
          placement_test_2_score?: number | null
          placement_test_2_total?: number | null
          placement_test_completed_at?: string | null
          placement_test_score?: number | null
          placement_test_total?: number | null
          preferred_lesson_time?: string | null
          profile_completion_dismissed_at?: string | null
          profile_image_url?: string | null
          school_name?: string | null
          strengths?: string[] | null
          student_level?: Database["public"]["Enums"]["student_level"] | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          weekly_goal?: string | null
          weekly_goal_set_at?: string | null
          weekly_minutes?: number | null
          words_learned_today?: number | null
        }
        Update: {
          age?: number | null
          cefr_level?: string
          companion_id?: string | null
          created_at?: string
          current_streak?: number | null
          daily_streak?: number | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          final_cefr_level?: string | null
          fluency_score?: number
          gaps?: string[] | null
          grade_level?: string | null
          hub_type?: string | null
          id?: string
          interests?: string[] | null
          last_activity_date?: string | null
          last_completed_sequence_a1?: number | null
          last_completed_sequence_a2?: number | null
          last_completed_sequence_b1?: number | null
          last_completed_sequence_b2?: number | null
          last_completed_sequence_prea1?: number | null
          last_streak_date?: string | null
          learning_reason?: string | null
          learning_style?: string | null
          lesson_duration?: number | null
          lessons_since_literacy_probe?: number
          literacy_exit_passes?: number
          literacy_foundation_unit?: string | null
          literacy_last_probe?: Json | null
          literacy_reinforcement_queued?: boolean
          literacy_route_reason?: string | null
          literacy_self_declared?: boolean | null
          literacy_unit_fail_streak?: number
          long_term_goal?: string | null
          longest_streak?: number | null
          mistake_history?: Json | null
          needs_literacy_support?: boolean
          onboarding_completed?: boolean | null
          parent_email?: string | null
          pet_happiness?: number | null
          pet_type?: string | null
          placement_test_2_completed_at?: string | null
          placement_test_2_score?: number | null
          placement_test_2_total?: number | null
          placement_test_completed_at?: string | null
          placement_test_score?: number | null
          placement_test_total?: number | null
          preferred_lesson_time?: string | null
          profile_completion_dismissed_at?: string | null
          profile_image_url?: string | null
          school_name?: string | null
          strengths?: string[] | null
          student_level?: Database["public"]["Enums"]["student_level"] | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          weekly_goal?: string | null
          weekly_goal_set_at?: string | null
          weekly_minutes?: number | null
          words_learned_today?: number | null
        }
        Relationships: []
      }
      student_reward_purchases: {
        Row: {
          coins_spent: number
          id: string
          is_active: boolean
          purchased_at: string
          reward_id: string
          student_id: string
        }
        Insert: {
          coins_spent: number
          id?: string
          is_active?: boolean
          purchased_at?: string
          reward_id: string
          student_id: string
        }
        Update: {
          coins_spent?: number
          id?: string
          is_active?: boolean
          purchased_at?: string
          reward_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_reward_purchases_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "virtual_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      student_sessions: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          lesson_id: string
          slide_index: number
          stars_remaining: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          lesson_id: string
          slide_index?: number
          stars_remaining?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          lesson_id?: string
          slide_index?: number
          stars_remaining?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_skill_tree: {
        Row: {
          hub: string
          student_id: string
          tree: Json
          updated_at: string
        }
        Insert: {
          hub: string
          student_id: string
          tree?: Json
          updated_at?: string
        }
        Update: {
          hub?: string
          student_id?: string
          tree?: Json
          updated_at?: string
        }
        Relationships: []
      }
      student_skills: {
        Row: {
          cefr_equivalent: string | null
          created_at: string | null
          current_score: number | null
          id: string
          next_focus: string | null
          skill_name: string
          student_id: string
          target_score: number | null
          updated_at: string | null
        }
        Insert: {
          cefr_equivalent?: string | null
          created_at?: string | null
          current_score?: number | null
          id?: string
          next_focus?: string | null
          skill_name: string
          student_id: string
          target_score?: number | null
          updated_at?: string | null
        }
        Update: {
          cefr_equivalent?: string | null
          created_at?: string | null
          current_score?: number | null
          id?: string
          next_focus?: string | null
          skill_name?: string
          student_id?: string
          target_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_slide_progress: {
        Row: {
          accuracy_score: number | null
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          slide_id: string
          student_id: string
          time_spent_seconds: number | null
          updated_at: string | null
          xp_earned: number | null
        }
        Insert: {
          accuracy_score?: number | null
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          slide_id: string
          student_id: string
          time_spent_seconds?: number | null
          updated_at?: string | null
          xp_earned?: number | null
        }
        Update: {
          accuracy_score?: number | null
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          slide_id?: string
          student_id?: string
          time_spent_seconds?: number | null
          updated_at?: string | null
          xp_earned?: number | null
        }
        Relationships: []
      }
      student_speaking_profiles: {
        Row: {
          availability_schedule: Json | null
          confidence_level: string | null
          created_at: string | null
          current_cefr_level: string
          id: string
          learning_style: string | null
          personality_type: string | null
          preferred_topics: string[] | null
          speaking_goals: string[] | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          availability_schedule?: Json | null
          confidence_level?: string | null
          created_at?: string | null
          current_cefr_level?: string
          id?: string
          learning_style?: string | null
          personality_type?: string | null
          preferred_topics?: string[] | null
          speaking_goals?: string[] | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          availability_schedule?: Json | null
          confidence_level?: string | null
          created_at?: string | null
          current_cefr_level?: string
          id?: string
          learning_style?: string | null
          personality_type?: string | null
          preferred_topics?: string[] | null
          speaking_goals?: string[] | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_vocabulary_progress: {
        Row: {
          audio_url: string | null
          created_at: string | null
          first_seen_at: string | null
          id: string
          image_url: string | null
          last_reviewed_at: string | null
          mastered: boolean | null
          mastery_level: number | null
          phoneme_tag: string | null
          sticker_image_url: string | null
          student_id: string
          times_reviewed: number | null
          unit_id: string | null
          word: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          first_seen_at?: string | null
          id?: string
          image_url?: string | null
          last_reviewed_at?: string | null
          mastered?: boolean | null
          mastery_level?: number | null
          phoneme_tag?: string | null
          sticker_image_url?: string | null
          student_id: string
          times_reviewed?: number | null
          unit_id?: string | null
          word: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          first_seen_at?: string | null
          id?: string
          image_url?: string | null
          last_reviewed_at?: string | null
          mastered?: boolean | null
          mastery_level?: number | null
          phoneme_tag?: string | null
          sticker_image_url?: string | null
          student_id?: string
          times_reviewed?: number | null
          unit_id?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_vocabulary_progress_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "curriculum_units"
            referencedColumns: ["id"]
          },
        ]
      }
      student_xp: {
        Row: {
          created_at: string
          current_level: number
          id: string
          last_activity_date: string | null
          motivation_last_signal: string | null
          streak_freezes_remaining: number
          student_id: string
          total_xp: number
          updated_at: string
          xp_in_current_level: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          last_activity_date?: string | null
          motivation_last_signal?: string | null
          streak_freezes_remaining?: number
          student_id: string
          total_xp?: number
          updated_at?: string
          xp_in_current_level?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          last_activity_date?: string | null
          motivation_last_signal?: string | null
          streak_freezes_remaining?: number
          student_id?: string
          total_xp?: number
          updated_at?: string
          xp_in_current_level?: number
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          interval_type: string
          is_active: boolean
          is_trial: boolean
          max_classes_per_month: number | null
          name: string
          price_dzd: number
          price_eur: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval_type?: string
          is_active?: boolean
          is_trial?: boolean
          max_classes_per_month?: number | null
          name: string
          price_dzd?: number
          price_eur?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval_type?: string
          is_active?: boolean
          is_trial?: boolean
          max_classes_per_month?: number | null
          name?: string
          price_dzd?: number
          price_eur?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      substitution_tables: {
        Row: {
          cefr: string
          created_at: string
          grammar_point: string
          hub: string
          id: string
          owner_id: string
          payload: Json
          used_in_lesson_id: string | null
        }
        Insert: {
          cefr: string
          created_at?: string
          grammar_point: string
          hub: string
          id?: string
          owner_id: string
          payload: Json
          used_in_lesson_id?: string | null
        }
        Update: {
          cefr?: string
          created_at?: string
          grammar_point?: string
          hub?: string
          id?: string
          owner_id?: string
          payload?: Json
          used_in_lesson_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          status: string | null
          user_email: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          status?: string | null
          user_email: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          status?: string | null
          user_email?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      system_emails: {
        Row: {
          created_at: string
          delivery_status: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          resend_count: number
          sent_at: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_status?: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resend_count?: number
          sent_at?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_status?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resend_count?: number
          sent_at?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_errors: {
        Row: {
          ai_analysis: string | null
          ai_model: string | null
          analyzed_at: string | null
          component_name: string | null
          created_at: string
          error_message: string
          id: string
          route: string | null
          stack_trace: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          ai_analysis?: string | null
          ai_model?: string | null
          analyzed_at?: string | null
          component_name?: string | null
          created_at?: string
          error_message: string
          id?: string
          route?: string | null
          stack_trace?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          ai_analysis?: string | null
          ai_model?: string | null
          analyzed_at?: string | null
          component_name?: string | null
          created_at?: string
          error_message?: string
          id?: string
          route?: string | null
          stack_trace?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_transitions: {
        Row: {
          from_system: string | null
          id: string
          metadata: Json | null
          to_system: string
          transition_date: string | null
          trigger_reason: string
          triggered_by: string | null
          user_id: string
        }
        Insert: {
          from_system?: string | null
          id?: string
          metadata?: Json | null
          to_system: string
          transition_date?: string | null
          trigger_reason: string
          triggered_by?: string | null
          user_id: string
        }
        Update: {
          from_system?: string | null
          id?: string
          metadata?: Json | null
          to_system?: string
          transition_date?: string | null
          trigger_reason?: string
          triggered_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_transitions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      systematic_lessons: {
        Row: {
          activities: Json | null
          archived_at: string | null
          archived_reason: string | null
          communication_outcome: string | null
          created_at: string | null
          curriculum_level_id: string
          difficulty_level: number | null
          estimated_duration: number | null
          gamified_elements: Json | null
          grammar_focus: string | null
          id: string
          is_review_lesson: boolean | null
          lesson_number: number
          lesson_objectives: Json | null
          prerequisite_lessons: string[] | null
          slides_content: Json | null
          status: string | null
          title: string
          topic: string
          updated_at: string | null
          vocabulary_set: Json | null
        }
        Insert: {
          activities?: Json | null
          archived_at?: string | null
          archived_reason?: string | null
          communication_outcome?: string | null
          created_at?: string | null
          curriculum_level_id: string
          difficulty_level?: number | null
          estimated_duration?: number | null
          gamified_elements?: Json | null
          grammar_focus?: string | null
          id?: string
          is_review_lesson?: boolean | null
          lesson_number: number
          lesson_objectives?: Json | null
          prerequisite_lessons?: string[] | null
          slides_content?: Json | null
          status?: string | null
          title: string
          topic: string
          updated_at?: string | null
          vocabulary_set?: Json | null
        }
        Update: {
          activities?: Json | null
          archived_at?: string | null
          archived_reason?: string | null
          communication_outcome?: string | null
          created_at?: string | null
          curriculum_level_id?: string
          difficulty_level?: number | null
          estimated_duration?: number | null
          gamified_elements?: Json | null
          grammar_focus?: string | null
          id?: string
          is_review_lesson?: boolean | null
          lesson_number?: number
          lesson_objectives?: Json | null
          prerequisite_lessons?: string[] | null
          slides_content?: Json | null
          status?: string | null
          title?: string
          topic?: string
          updated_at?: string | null
          vocabulary_set?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "systematic_lessons_curriculum_level_id_fkey"
            columns: ["curriculum_level_id"]
            isOneToOne: false
            referencedRelation: "curriculum_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_absences: {
        Row: {
          absence_date: string
          absence_type: string
          created_at: string | null
          id: string
          lesson_id: string | null
          penalty_applied: boolean | null
          suspension_applied: boolean | null
          teacher_id: string
          warning_given: boolean | null
        }
        Insert: {
          absence_date: string
          absence_type: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          penalty_applied?: boolean | null
          suspension_applied?: boolean | null
          teacher_id: string
          warning_given?: boolean | null
        }
        Update: {
          absence_date?: string
          absence_type?: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          penalty_applied?: boolean | null
          suspension_applied?: boolean | null
          teacher_id?: string
          warning_given?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_absences_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          earned_at: string | null
          id: string
          points_awarded: number | null
          teacher_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          earned_at?: string | null
          id?: string
          points_awarded?: number | null
          teacher_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          earned_at?: string | null
          id?: string
          points_awarded?: number | null
          teacher_id?: string
        }
        Relationships: []
      }
      teacher_applications: {
        Row: {
          address: string | null
          admin_notes: string | null
          age_groups_experience: string[] | null
          availability: string | null
          bio: string | null
          certifications: string[] | null
          classroom_management: string | null
          contact_notes: string | null
          cover_letter: string | null
          created_at: string | null
          current_stage: string | null
          cv_url: string | null
          date_of_birth: string | null
          documents_approved: boolean | null
          education: string | null
          email: string
          equipment_test_passed: boolean | null
          esl_certification: string | null
          first_name: string
          grammar_score: number | null
          grammar_test_status: string
          hub_preference: string | null
          id: string
          interview_feedback: string | null
          interview_invite_sent_at: string | null
          interview_invite_token: string | null
          interview_passed: boolean | null
          interview_scheduled_at: string | null
          interviewed_by: string | null
          intro_video_approved: boolean | null
          languages_spoken: string[] | null
          last_contact_date: string | null
          last_name: string
          market_region: Database["public"]["Enums"]["market_region"]
          motivation: string | null
          nationality: string | null
          phone: string | null
          portfolio_url: string | null
          preferred_age_groups: string[] | null
          preferred_schedule: string | null
          previous_roles: string | null
          professional_references: Json | null
          rejection_reason: string | null
          salary_expectation: number | null
          skills: string[] | null
          status: string | null
          teaching_experience_years: number | null
          teaching_methodology: string | null
          teaching_philosophy: string | null
          updated_at: string | null
          user_id: string | null
          video_description: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          age_groups_experience?: string[] | null
          availability?: string | null
          bio?: string | null
          certifications?: string[] | null
          classroom_management?: string | null
          contact_notes?: string | null
          cover_letter?: string | null
          created_at?: string | null
          current_stage?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          documents_approved?: boolean | null
          education?: string | null
          email: string
          equipment_test_passed?: boolean | null
          esl_certification?: string | null
          first_name: string
          grammar_score?: number | null
          grammar_test_status?: string
          hub_preference?: string | null
          id?: string
          interview_feedback?: string | null
          interview_invite_sent_at?: string | null
          interview_invite_token?: string | null
          interview_passed?: boolean | null
          interview_scheduled_at?: string | null
          interviewed_by?: string | null
          intro_video_approved?: boolean | null
          languages_spoken?: string[] | null
          last_contact_date?: string | null
          last_name: string
          market_region?: Database["public"]["Enums"]["market_region"]
          motivation?: string | null
          nationality?: string | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_age_groups?: string[] | null
          preferred_schedule?: string | null
          previous_roles?: string | null
          professional_references?: Json | null
          rejection_reason?: string | null
          salary_expectation?: number | null
          skills?: string[] | null
          status?: string | null
          teaching_experience_years?: number | null
          teaching_methodology?: string | null
          teaching_philosophy?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_description?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          age_groups_experience?: string[] | null
          availability?: string | null
          bio?: string | null
          certifications?: string[] | null
          classroom_management?: string | null
          contact_notes?: string | null
          cover_letter?: string | null
          created_at?: string | null
          current_stage?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          documents_approved?: boolean | null
          education?: string | null
          email?: string
          equipment_test_passed?: boolean | null
          esl_certification?: string | null
          first_name?: string
          grammar_score?: number | null
          grammar_test_status?: string
          hub_preference?: string | null
          id?: string
          interview_feedback?: string | null
          interview_invite_sent_at?: string | null
          interview_invite_token?: string | null
          interview_passed?: boolean | null
          interview_scheduled_at?: string | null
          interviewed_by?: string | null
          intro_video_approved?: boolean | null
          languages_spoken?: string[] | null
          last_contact_date?: string | null
          last_name?: string
          market_region?: Database["public"]["Enums"]["market_region"]
          motivation?: string | null
          nationality?: string | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_age_groups?: string[] | null
          preferred_schedule?: string | null
          previous_roles?: string | null
          professional_references?: Json | null
          rejection_reason?: string | null
          salary_expectation?: number | null
          skills?: string[] | null
          status?: string | null
          teaching_experience_years?: number | null
          teaching_methodology?: string | null
          teaching_philosophy?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_description?: string | null
        }
        Relationships: []
      }
      teacher_availability: {
        Row: {
          created_at: string
          duration: number
          end_time: string
          hub_specialty: string | null
          id: string
          is_available: boolean
          is_booked: boolean
          lesson_id: string | null
          lesson_title: string | null
          lesson_type: string
          notes: string | null
          price_per_hour: number
          recurring_pattern: Json | null
          start_time: string
          student_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number
          end_time: string
          hub_specialty?: string | null
          id?: string
          is_available?: boolean
          is_booked?: boolean
          lesson_id?: string | null
          lesson_title?: string | null
          lesson_type?: string
          notes?: string | null
          price_per_hour?: number
          recurring_pattern?: Json | null
          start_time: string
          student_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number
          end_time?: string
          hub_specialty?: string | null
          id?: string
          is_available?: boolean
          is_booked?: boolean
          lesson_id?: string | null
          lesson_title?: string | null
          lesson_type?: string
          notes?: string | null
          price_per_hour?: number
          recurring_pattern?: Json | null
          start_time?: string
          student_id?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_availability_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_earnings: {
        Row: {
          amount: number | null
          booking_id: string | null
          created_at: string | null
          earned_at: string | null
          gross_amount: number
          id: string
          lesson_id: string
          paid_at: string | null
          payment_id: string | null
          platform_amount: number
          revenue_split_id: string | null
          split_percentage: number
          status: string | null
          teacher_amount: number
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          earned_at?: string | null
          gross_amount: number
          id?: string
          lesson_id: string
          paid_at?: string | null
          payment_id?: string | null
          platform_amount: number
          revenue_split_id?: string | null
          split_percentage: number
          status?: string | null
          teacher_amount: number
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          earned_at?: string | null
          gross_amount?: number
          id?: string
          lesson_id?: string
          paid_at?: string | null
          payment_id?: string | null
          platform_amount?: number
          revenue_split_id?: string | null
          split_percentage?: number
          status?: string | null
          teacher_amount?: number
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "class_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_earnings_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_earnings_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_earnings_revenue_split_id_fkey"
            columns: ["revenue_split_id"]
            isOneToOne: false
            referencedRelation: "revenue_splits"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_equipment_tests: {
        Row: {
          application_id: string | null
          created_at: string | null
          download_speed: number | null
          id: string
          microphone_test: boolean | null
          overall_passed: boolean | null
          ping_latency: number | null
          screen_sharing_test: boolean | null
          speaker_test: boolean | null
          test_completed_at: string | null
          upload_speed: number | null
          webcam_test: boolean | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          download_speed?: number | null
          id?: string
          microphone_test?: boolean | null
          overall_passed?: boolean | null
          ping_latency?: number | null
          screen_sharing_test?: boolean | null
          speaker_test?: boolean | null
          test_completed_at?: string | null
          upload_speed?: number | null
          webcam_test?: boolean | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          download_speed?: number | null
          id?: string
          microphone_test?: boolean | null
          overall_passed?: boolean | null
          ping_latency?: number | null
          screen_sharing_test?: boolean | null
          speaker_test?: boolean | null
          test_completed_at?: string | null
          upload_speed?: number | null
          webcam_test?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_equipment_tests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "teacher_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_grammar_tests: {
        Row: {
          answers: Json
          application_id: string
          created_at: string
          email: string
          id: string
          passed: boolean
          percentage: number
          question_ids: Json
          score: number
          started_at: string
          submitted_at: string | null
          total: number
        }
        Insert: {
          answers?: Json
          application_id: string
          created_at?: string
          email: string
          id?: string
          passed?: boolean
          percentage?: number
          question_ids?: Json
          score?: number
          started_at?: string
          submitted_at?: string | null
          total?: number
        }
        Update: {
          answers?: Json
          application_id?: string
          created_at?: string
          email?: string
          id?: string
          passed?: boolean
          percentage?: number
          question_ids?: Json
          score?: number
          started_at?: string
          submitted_at?: string | null
          total?: number
        }
        Relationships: []
      }
      teacher_interviews: {
        Row: {
          application_id: string | null
          approved: boolean | null
          created_at: string | null
          duration: number | null
          id: string
          interview_notes: string | null
          interview_type: string | null
          interviewer_id: string | null
          rating: number | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
          zoom_link: string | null
        }
        Insert: {
          application_id?: string | null
          approved?: boolean | null
          created_at?: string | null
          duration?: number | null
          id?: string
          interview_notes?: string | null
          interview_type?: string | null
          interviewer_id?: string | null
          rating?: number | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
          zoom_link?: string | null
        }
        Update: {
          application_id?: string | null
          approved?: boolean | null
          created_at?: string | null
          duration?: number | null
          id?: string
          interview_notes?: string | null
          interview_type?: string | null
          interviewer_id?: string | null
          rating?: number | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "teacher_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_kpi_alerts: {
        Row: {
          consecutive_weeks: number
          created_at: string
          id: string
          kpi_score: number
          notified_at: string | null
          teacher_id: string
          week_start: string
        }
        Insert: {
          consecutive_weeks?: number
          created_at?: string
          id?: string
          kpi_score: number
          notified_at?: string | null
          teacher_id: string
          week_start: string
        }
        Update: {
          consecutive_weeks?: number
          created_at?: string
          id?: string
          kpi_score?: number
          notified_at?: string | null
          teacher_id?: string
          week_start?: string
        }
        Relationships: []
      }
      teacher_kpi_snapshots: {
        Row: {
          attendance_rate: number
          created_at: string
          curriculum_coverage: number
          feedback_completion_rate: number
          id: string
          lesson_quality_score: number
          lessons_taught: number
          overall_kpi_score: number
          response_time_score: number
          snapshot_date: string
          student_progress_impact: number
          teacher_id: string
        }
        Insert: {
          attendance_rate?: number
          created_at?: string
          curriculum_coverage?: number
          feedback_completion_rate?: number
          id?: string
          lesson_quality_score?: number
          lessons_taught?: number
          overall_kpi_score?: number
          response_time_score?: number
          snapshot_date?: string
          student_progress_impact?: number
          teacher_id: string
        }
        Update: {
          attendance_rate?: number
          created_at?: string
          curriculum_coverage?: number
          feedback_completion_rate?: number
          id?: string
          lesson_quality_score?: number
          lessons_taught?: number
          overall_kpi_score?: number
          response_time_score?: number
          snapshot_date?: string
          student_progress_impact?: number
          teacher_id?: string
        }
        Relationships: []
      }
      teacher_onboarding_progress: {
        Row: {
          application_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          step_name: string
        }
        Insert: {
          application_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step_name: string
        }
        Update: {
          application_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_onboarding_progress_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "teacher_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_payouts: {
        Row: {
          created_at: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payout_period_end: string
          payout_period_start: string
          status: string | null
          teacher_id: string
          total_earnings: number
          total_lessons: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payout_period_end: string
          payout_period_start: string
          status?: string | null
          teacher_id: string
          total_earnings?: number
          total_lessons?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payout_period_end?: string
          payout_period_start?: string
          status?: string | null
          teacher_id?: string
          total_earnings?: number
          total_lessons?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_payouts_ledger: {
        Row: {
          amount: number
          classes_count: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          paid_at: string
          paid_by: string | null
          period_end: string
          period_start: string
          rate_applied: number
          status: string
          teacher_user_id: string
        }
        Insert: {
          amount?: number
          classes_count?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string
          paid_by?: string | null
          period_end: string
          period_start: string
          rate_applied?: number
          status?: string
          teacher_user_id: string
        }
        Update: {
          amount?: number
          classes_count?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string
          paid_by?: string | null
          period_end?: string
          period_start?: string
          rate_applied?: number
          status?: string
          teacher_user_id?: string
        }
        Relationships: []
      }
      teacher_penalties: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          notes: string | null
          penalty_amount: number | null
          penalty_date: string | null
          penalty_type: string
          resolved: boolean | null
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          notes?: string | null
          penalty_amount?: number | null
          penalty_date?: string | null
          penalty_type: string
          resolved?: boolean | null
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          notes?: string | null
          penalty_amount?: number | null
          penalty_date?: string | null
          penalty_type?: string
          resolved?: boolean | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_penalties_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_performance_metrics: {
        Row: {
          active_students: number
          attendance_rate: number | null
          created_at: string | null
          curriculum_coverage: number | null
          feedback_completion_rate: number | null
          id: string
          last_lesson_at: string | null
          lesson_quality_score: number | null
          lessons_taught: number
          overall_kpi_score: number | null
          response_time_score: number | null
          retention_rate: number
          student_progress_impact: number | null
          teacher_id: string
          total_minutes_taught: number
          updated_at: string | null
        }
        Insert: {
          active_students?: number
          attendance_rate?: number | null
          created_at?: string | null
          curriculum_coverage?: number | null
          feedback_completion_rate?: number | null
          id?: string
          last_lesson_at?: string | null
          lesson_quality_score?: number | null
          lessons_taught?: number
          overall_kpi_score?: number | null
          response_time_score?: number | null
          retention_rate?: number
          student_progress_impact?: number | null
          teacher_id: string
          total_minutes_taught?: number
          updated_at?: string | null
        }
        Update: {
          active_students?: number
          attendance_rate?: number | null
          created_at?: string | null
          curriculum_coverage?: number | null
          feedback_completion_rate?: number | null
          id?: string
          last_lesson_at?: string | null
          lesson_quality_score?: number | null
          lessons_taught?: number
          overall_kpi_score?: number | null
          response_time_score?: number | null
          retention_rate?: number
          student_progress_impact?: number | null
          teacher_id?: string
          total_minutes_taught?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          accent: string | null
          assigned_hubs: string[]
          availability_schedule: Json | null
          bio: string | null
          can_teach: boolean | null
          certificate_urls: string[] | null
          created_at: string
          hourly_rate_dzd: number | null
          hourly_rate_eur: number | null
          hub_role: string
          id: string
          intro_video_url: string | null
          is_available: boolean | null
          languages_spoken: string[] | null
          market_access: string[]
          market_region: Database["public"]["Enums"]["market_region"]
          payoneer_account_email: string | null
          payout_rate_override: number | null
          per_class_rate: number
          profile_approved_by_admin: boolean | null
          profile_complete: boolean | null
          profile_image_url: string | null
          rating: number | null
          specializations: string[] | null
          timezone: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          video_rejection_reason: string | null
          video_status: string | null
          video_url: string | null
          welcome_shown: boolean
          years_experience: number | null
        }
        Insert: {
          accent?: string | null
          assigned_hubs?: string[]
          availability_schedule?: Json | null
          bio?: string | null
          can_teach?: boolean | null
          certificate_urls?: string[] | null
          created_at?: string
          hourly_rate_dzd?: number | null
          hourly_rate_eur?: number | null
          hub_role?: string
          id?: string
          intro_video_url?: string | null
          is_available?: boolean | null
          languages_spoken?: string[] | null
          market_access?: string[]
          market_region?: Database["public"]["Enums"]["market_region"]
          payoneer_account_email?: string | null
          payout_rate_override?: number | null
          per_class_rate?: number
          profile_approved_by_admin?: boolean | null
          profile_complete?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          timezone?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          video_rejection_reason?: string | null
          video_status?: string | null
          video_url?: string | null
          welcome_shown?: boolean
          years_experience?: number | null
        }
        Update: {
          accent?: string | null
          assigned_hubs?: string[]
          availability_schedule?: Json | null
          bio?: string | null
          can_teach?: boolean | null
          certificate_urls?: string[] | null
          created_at?: string
          hourly_rate_dzd?: number | null
          hourly_rate_eur?: number | null
          hub_role?: string
          id?: string
          intro_video_url?: string | null
          is_available?: boolean | null
          languages_spoken?: string[] | null
          market_access?: string[]
          market_region?: Database["public"]["Enums"]["market_region"]
          payoneer_account_email?: string | null
          payout_rate_override?: number | null
          per_class_rate?: number
          profile_approved_by_admin?: boolean | null
          profile_complete?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          timezone?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          video_rejection_reason?: string | null
          video_status?: string | null
          video_url?: string | null
          welcome_shown?: boolean
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_reviews: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          is_public: boolean | null
          rating: number
          review_text: string | null
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          rating: number
          review_text?: string | null
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          rating?: number
          review_text?: string | null
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "class_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_reviews_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_scenario_overrides: {
        Row: {
          active: boolean
          cefr: string
          clone_count: number
          cloned_from: string | null
          created_at: string
          description: string | null
          engine: string
          hub: string
          id: string
          is_public: boolean
          notes: string | null
          scenario: Json
          teacher_id: string
          title: string | null
          topic: string | null
          updated_at: string
          vocab_hash: string
        }
        Insert: {
          active?: boolean
          cefr: string
          clone_count?: number
          cloned_from?: string | null
          created_at?: string
          description?: string | null
          engine: string
          hub: string
          id?: string
          is_public?: boolean
          notes?: string | null
          scenario: Json
          teacher_id: string
          title?: string | null
          topic?: string | null
          updated_at?: string
          vocab_hash: string
        }
        Update: {
          active?: boolean
          cefr?: string
          clone_count?: number
          cloned_from?: string | null
          created_at?: string
          description?: string | null
          engine?: string
          hub?: string
          id?: string
          is_public?: boolean
          notes?: string | null
          scenario?: Json
          teacher_id?: string
          title?: string | null
          topic?: string | null
          updated_at?: string
          vocab_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_scenario_overrides_cloned_from_fkey"
            columns: ["cloned_from"]
            isOneToOne: false
            referencedRelation: "teacher_scenario_overrides"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_scenario_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_reason: string | null
          moderation_status: string
          rater_id: string
          scenario_id: string
          stars: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          moderation_status?: string
          rater_id: string
          scenario_id: string
          stars: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          moderation_status?: string
          rater_id?: string
          scenario_id?: string
          stars?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_scenario_ratings_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "teacher_scenario_overrides"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          payoneer_account_email: string
          processed_at: string | null
          rejection_reason: string | null
          requested_at: string
          status: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          payoneer_account_email: string
          processed_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          payoneer_account_email?: string
          processed_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          order_index: number | null
          target_system: string
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          order_index?: number | null
          target_system: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          order_index?: number | null
          target_system?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      unit_lessons: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          lesson_order: number
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          lesson_order: number
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          lesson_order?: number
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "systematic_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "curriculum_units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_missions: {
        Row: {
          created_at: string
          goal_description: string | null
          id: string
          mission_text: string
          mission_tip: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goal_description?: string | null
          id?: string
          mission_text: string
          mission_tip?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goal_description?: string | null
          id?: string
          mission_text?: string
          mission_tip?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_missions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: true
            referencedRelation: "curriculum_units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_progress_reports: {
        Row: {
          accuracy: number
          cefr: string
          created_at: string
          engine_accuracy: number
          engine_runs: Json
          hub: string
          id: string
          lessons_completed: number | null
          lessons_total: number | null
          mastered_words: string[]
          quiz_accuracy: number | null
          share_token: string | null
          stars: number
          student_name: string | null
          total_attempts: number
          total_correct: number
          total_duration_ms: number
          unit_id: string
          unit_title: string | null
          user_id: string
          weak_words: string[]
        }
        Insert: {
          accuracy: number
          cefr: string
          created_at?: string
          engine_accuracy?: number
          engine_runs?: Json
          hub: string
          id?: string
          lessons_completed?: number | null
          lessons_total?: number | null
          mastered_words?: string[]
          quiz_accuracy?: number | null
          share_token?: string | null
          stars: number
          student_name?: string | null
          total_attempts?: number
          total_correct?: number
          total_duration_ms?: number
          unit_id: string
          unit_title?: string | null
          user_id: string
          weak_words?: string[]
        }
        Update: {
          accuracy?: number
          cefr?: string
          created_at?: string
          engine_accuracy?: number
          engine_runs?: Json
          hub?: string
          id?: string
          lessons_completed?: number | null
          lessons_total?: number | null
          mastered_words?: string[]
          quiz_accuracy?: number | null
          share_token?: string | null
          stars?: number
          student_name?: string | null
          total_attempts?: number
          total_correct?: number
          total_duration_ms?: number
          unit_id?: string
          unit_title?: string | null
          user_id?: string
          weak_words?: string[]
        }
        Relationships: []
      }
      user_community_stats: {
        Row: {
          badges_earned: string[] | null
          community_points: number | null
          created_at: string | null
          id: string
          last_activity_date: string | null
          reputation_score: number | null
          streak_days: number | null
          total_challenges_completed: number | null
          total_communities: number | null
          total_events_attended: number | null
          total_likes_received: number | null
          total_posts: number | null
          total_replies: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges_earned?: string[] | null
          community_points?: number | null
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          reputation_score?: number | null
          streak_days?: number | null
          total_challenges_completed?: number | null
          total_communities?: number | null
          total_events_attended?: number | null
          total_likes_received?: number | null
          total_posts?: number | null
          total_replies?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges_earned?: string[] | null
          community_points?: number | null
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          reputation_score?: number | null
          streak_days?: number | null
          total_challenges_completed?: number | null
          total_communities?: number | null
          total_events_attended?: number | null
          total_likes_received?: number | null
          total_posts?: number | null
          total_replies?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          last_refill_at: string
          lesson_credits: number
          lesson_credits_monthly_refill: number
          updated_at: string
          user_id: string
          voice_energy: number
          voice_energy_monthly_refill: number
        }
        Insert: {
          created_at?: string
          last_refill_at?: string
          lesson_credits?: number
          lesson_credits_monthly_refill?: number
          updated_at?: string
          user_id: string
          voice_energy?: number
          voice_energy_monthly_refill?: number
        }
        Update: {
          created_at?: string
          last_refill_at?: string
          lesson_credits?: number
          lesson_credits_monthly_refill?: number
          updated_at?: string
          user_id?: string
          voice_energy?: number
          voice_energy_monthly_refill?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_active_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          classes_used_this_month: number
          created_at: string
          id: string
          payment_method: string | null
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_start: string
          trial_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          classes_used_this_month?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          classes_used_this_month?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_id: number | null
          cefr_level: string | null
          cohort_group: string | null
          created_at: string
          current_level_id: string | null
          current_system: string | null
          curriculum_framework: string | null
          email: string
          full_name: string
          id: string
          learning_mode: string | null
          local_curriculum_context: Json
          market_region: Database["public"]["Enums"]["market_region"]
          payment_locked: boolean | null
          placement_method: string | null
          preferred_language: string
          primary_organization_id: string | null
          referral_code: string | null
          referred_by: string | null
          region: string | null
          role: string
          storybook_style_pref: string | null
          teacher_level: string | null
          teacher_points: number | null
          total_xp: number
          updated_at: string
        }
        Insert: {
          avatar_id?: number | null
          cefr_level?: string | null
          cohort_group?: string | null
          created_at?: string
          current_level_id?: string | null
          current_system?: string | null
          curriculum_framework?: string | null
          email: string
          full_name: string
          id: string
          learning_mode?: string | null
          local_curriculum_context?: Json
          market_region?: Database["public"]["Enums"]["market_region"]
          payment_locked?: boolean | null
          placement_method?: string | null
          preferred_language?: string
          primary_organization_id?: string | null
          referral_code?: string | null
          referred_by?: string | null
          region?: string | null
          role: string
          storybook_style_pref?: string | null
          teacher_level?: string | null
          teacher_points?: number | null
          total_xp?: number
          updated_at?: string
        }
        Update: {
          avatar_id?: number | null
          cefr_level?: string | null
          cohort_group?: string | null
          created_at?: string
          current_level_id?: string | null
          current_system?: string | null
          curriculum_framework?: string | null
          email?: string
          full_name?: string
          id?: string
          learning_mode?: string | null
          local_curriculum_context?: Json
          market_region?: Database["public"]["Enums"]["market_region"]
          payment_locked?: boolean | null
          placement_method?: string | null
          preferred_language?: string
          primary_organization_id?: string | null
          referral_code?: string | null
          referred_by?: string | null
          region?: string | null
          role?: string
          storybook_style_pref?: string | null
          teacher_level?: string | null
          teacher_points?: number | null
          total_xp?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_current_level_id_fkey"
            columns: ["current_level_id"]
            isOneToOne: false
            referencedRelation: "curriculum_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_primary_organization_id_fkey"
            columns: ["primary_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      video_generation_cache: {
        Row: {
          cache_key: string
          cefr: string | null
          created_at: string
          duration_seconds: number
          hit_count: number
          hub: string | null
          id: string
          prompt: string
          starting_frame_url: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          cache_key: string
          cefr?: string | null
          created_at?: string
          duration_seconds?: number
          hit_count?: number
          hub?: string | null
          id?: string
          prompt: string
          starting_frame_url?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          cache_key?: string
          cefr?: string | null
          created_at?: string
          duration_seconds?: number
          hit_count?: number
          hub?: string | null
          id?: string
          prompt?: string
          starting_frame_url?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      virtual_rewards: {
        Row: {
          category: string
          cost_coins: number
          created_at: string
          description: string
          id: string
          is_available: boolean
          limited_quantity: number | null
          metadata: Json
          name: string
          purchased_count: number
          rarity: string
        }
        Insert: {
          category: string
          cost_coins: number
          created_at?: string
          description: string
          id?: string
          is_available?: boolean
          limited_quantity?: number | null
          metadata?: Json
          name: string
          purchased_count?: number
          rarity?: string
        }
        Update: {
          category?: string
          cost_coins?: number
          created_at?: string
          description?: string
          id?: string
          is_available?: boolean
          limited_quantity?: number | null
          metadata?: Json
          name?: string
          purchased_count?: number
          rarity?: string
        }
        Relationships: []
      }
      vocab_image_cache: {
        Row: {
          attempts: number
          cache_key: string
          cefr: string | null
          created_at: string
          hub: string | null
          image_prompt: string | null
          image_url: string | null
          last_error: string | null
          plan: Json | null
          status: string
          style: string
          theme: string | null
          updated_at: string
          word: string
        }
        Insert: {
          attempts?: number
          cache_key: string
          cefr?: string | null
          created_at?: string
          hub?: string | null
          image_prompt?: string | null
          image_url?: string | null
          last_error?: string | null
          plan?: Json | null
          status?: string
          style: string
          theme?: string | null
          updated_at?: string
          word: string
        }
        Update: {
          attempts?: number
          cache_key?: string
          cefr?: string | null
          created_at?: string
          hub?: string | null
          image_prompt?: string | null
          image_url?: string | null
          last_error?: string | null
          plan?: Json | null
          status?: string
          style?: string
          theme?: string | null
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
      vocabulary_bank: {
        Row: {
          cefr_level: string | null
          created_at: string
          definition: string
          example: string | null
          hub_scope: string[] | null
          id: string
          ipa: string | null
          theme: string
          word: string
        }
        Insert: {
          cefr_level?: string | null
          created_at?: string
          definition: string
          example?: string | null
          hub_scope?: string[] | null
          id?: string
          ipa?: string | null
          theme: string
          word: string
        }
        Update: {
          cefr_level?: string | null
          created_at?: string
          definition?: string
          example?: string | null
          hub_scope?: string[] | null
          id?: string
          ipa?: string | null
          theme?: string
          word?: string
        }
        Relationships: []
      }
      vocabulary_progression: {
        Row: {
          age_range: string
          cefr_level: string
          created_at: string | null
          id: string
          themes: Json
          word_lists: Json
        }
        Insert: {
          age_range: string
          cefr_level: string
          created_at?: string | null
          id?: string
          themes: Json
          word_lists: Json
        }
        Update: {
          age_range?: string
          cefr_level?: string
          created_at?: string | null
          id?: string
          themes?: Json
          word_lists?: Json
        }
        Relationships: []
      }
      weekly_assessments: {
        Row: {
          assessment_data: Json | null
          completed_at: string | null
          conversation_duration_seconds: number | null
          conversation_fluency_score: number | null
          curriculum_id: string
          grammar_accuracy_percentage: number | null
          id: string
          neuroscience_retention_score: number | null
          sentence_construction_score: number | null
          student_id: string
          theme: string
          vocabulary_accuracy_percentage: number | null
          week_number: number
        }
        Insert: {
          assessment_data?: Json | null
          completed_at?: string | null
          conversation_duration_seconds?: number | null
          conversation_fluency_score?: number | null
          curriculum_id: string
          grammar_accuracy_percentage?: number | null
          id?: string
          neuroscience_retention_score?: number | null
          sentence_construction_score?: number | null
          student_id: string
          theme: string
          vocabulary_accuracy_percentage?: number | null
          week_number: number
        }
        Update: {
          assessment_data?: Json | null
          completed_at?: string | null
          conversation_duration_seconds?: number | null
          conversation_fluency_score?: number | null
          curriculum_id?: string
          grammar_accuracy_percentage?: number | null
          id?: string
          neuroscience_retention_score?: number | null
          sentence_construction_score?: number | null
          student_id?: string
          theme?: string
          vocabulary_accuracy_percentage?: number | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_assessments_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "generated_curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      wtc_biometric_logs: {
        Row: {
          age: number | null
          anxiety_flag: boolean
          created_at: string
          flag_reason: string | null
          gaze_wander_seconds: number | null
          hub: string
          id: string
          is_voiced: boolean | null
          lesson_id: string | null
          memory_item_id: string | null
          raw: Json
          slide_id: string | null
          spectral_tilt_db: number | null
          student_id: string
          trace_deviation_px: number | null
          voice_dbfs: number | null
        }
        Insert: {
          age?: number | null
          anxiety_flag?: boolean
          created_at?: string
          flag_reason?: string | null
          gaze_wander_seconds?: number | null
          hub: string
          id?: string
          is_voiced?: boolean | null
          lesson_id?: string | null
          memory_item_id?: string | null
          raw?: Json
          slide_id?: string | null
          spectral_tilt_db?: number | null
          student_id: string
          trace_deviation_px?: number | null
          voice_dbfs?: number | null
        }
        Update: {
          age?: number | null
          anxiety_flag?: boolean
          created_at?: string
          flag_reason?: string | null
          gaze_wander_seconds?: number | null
          hub?: string
          id?: string
          is_voiced?: boolean | null
          lesson_id?: string | null
          memory_item_id?: string | null
          raw?: Json
          slide_id?: string | null
          spectral_tilt_db?: number | null
          student_id?: string
          trace_deviation_px?: number | null
          voice_dbfs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wtc_biometric_logs_memory_item_id_fkey"
            columns: ["memory_item_id"]
            isOneToOne: false
            referencedRelation: "memory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wtc_signals: {
        Row: {
          anxiety_level: string
          gaze_ratio: number | null
          gesture_rate: number | null
          id: string
          posture: string | null
          recorded_at: string
          session_id: string | null
          student_id: string
          triggered_action: string | null
          volume: string | null
          wtc_score: number
        }
        Insert: {
          anxiety_level: string
          gaze_ratio?: number | null
          gesture_rate?: number | null
          id?: string
          posture?: string | null
          recorded_at?: string
          session_id?: string | null
          student_id: string
          triggered_action?: string | null
          volume?: string | null
          wtc_score: number
        }
        Update: {
          anxiety_level?: string
          gaze_ratio?: number | null
          gesture_rate?: number | null
          id?: string
          posture?: string | null
          recorded_at?: string
          session_id?: string | null
          student_id?: string
          triggered_action?: string | null
          volume?: string | null
          wtc_score?: number
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          action: string
          created_at: string
          id: string
          multiplier: number
          multiplier_reason: string | null
          ref_id: string | null
          student_id: string
          xp: number
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          multiplier?: number
          multiplier_reason?: string | null
          ref_id?: string | null
          student_id: string
          xp: number
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          multiplier?: number
          multiplier_reason?: string | null
          ref_id?: string | null
          student_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      academy_coin_balances: {
        Row: {
          coins: number | null
          student_id: string | null
        }
        Relationships: []
      }
      assessment_questions_student: {
        Row: {
          assessment_id: string | null
          audio_url: string | null
          id: string | null
          metadata: Json | null
          options: Json | null
          points: number | null
          question_order: number | null
          question_text: string | null
          question_type: string | null
        }
        Insert: {
          assessment_id?: string | null
          audio_url?: string | null
          id?: string | null
          metadata?: Json | null
          options?: Json | null
          points?: number | null
          question_order?: number | null
          question_text?: string | null
          question_type?: string | null
        }
        Update: {
          assessment_id?: string | null
          audio_url?: string | null
          id?: string | null
          metadata?: Json | null
          options?: Json | null
          points?: number | null
          question_order?: number | null
          question_text?: string | null
          question_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_items_public: {
        Row: {
          audio_url: string | null
          audio_url_kids: string | null
          cefr: string | null
          id: string | null
          option_audio_urls: Json | null
          option_image_urls: Json | null
          options: Json | null
          prompt: string | null
          skill: string | null
        }
        Insert: {
          audio_url?: string | null
          audio_url_kids?: string | null
          cefr?: string | null
          id?: string | null
          option_audio_urls?: Json | null
          option_image_urls?: Json | null
          options?: Json | null
          prompt?: string | null
          skill?: string | null
        }
        Update: {
          audio_url?: string | null
          audio_url_kids?: string | null
          cefr?: string | null
          id?: string | null
          option_audio_urls?: Json | null
          option_image_urls?: Json | null
          options?: Json | null
          prompt?: string | null
          skill?: string | null
        }
        Relationships: []
      }
      lesson_library_view: {
        Row: {
          age_group: string | null
          cefr_level: string | null
          created_at: string | null
          creator_name: string | null
          duration_minutes: number | null
          id: string | null
          learning_objectives: string[] | null
          screens_data: Json | null
          sequence_number: number | null
          status: string | null
          title: string | null
          topic: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      notification_logs_teacher_safe: {
        Row: {
          created_at: string | null
          email_sent_at: string | null
          id: string | null
          status: string | null
          student_id: string | null
          template_name: string | null
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_sent_at?: string | null
          id?: string | null
          status?: string | null
          student_id?: string | null
          template_name?: string | null
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_sent_at?: string | null
          id?: string | null
          status?: string | null
          student_id?: string | null
          template_name?: string | null
          unit_id?: string | null
        }
        Relationships: []
      }
      teacher_profiles_public: {
        Row: {
          accent: string | null
          bio: string | null
          created_at: string | null
          hourly_rate_dzd: number | null
          hourly_rate_eur: number | null
          hub_role: string | null
          id: string | null
          intro_video_url: string | null
          is_available: boolean | null
          languages_spoken: string[] | null
          market_region: Database["public"]["Enums"]["market_region"] | null
          profile_image_url: string | null
          rating: number | null
          specializations: string[] | null
          timezone: string | null
          total_reviews: number | null
          user_id: string | null
          video_url: string | null
          years_experience: number | null
        }
        Insert: {
          accent?: string | null
          bio?: string | null
          created_at?: string | null
          hourly_rate_dzd?: number | null
          hourly_rate_eur?: number | null
          hub_role?: string | null
          id?: string | null
          intro_video_url?: string | null
          is_available?: boolean | null
          languages_spoken?: string[] | null
          market_region?: Database["public"]["Enums"]["market_region"] | null
          profile_image_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          timezone?: string | null
          total_reviews?: number | null
          user_id?: string | null
          video_url?: string | null
          years_experience?: number | null
        }
        Update: {
          accent?: string | null
          bio?: string | null
          created_at?: string | null
          hourly_rate_dzd?: number | null
          hourly_rate_eur?: number | null
          hub_role?: string | null
          id?: string | null
          intro_video_url?: string | null
          is_available?: boolean | null
          languages_spoken?: string[] | null
          market_region?: Database["public"]["Enums"]["market_region"] | null
          profile_image_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          timezone?: string | null
          total_reviews?: number | null
          user_id?: string | null
          video_url?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      world_engagement_summary: {
        Row: {
          lesson_count: number | null
          unit_count: number | null
          world_id: string | null
          world_name: string | null
          world_slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_classroom_resolution: {
        Args: {
          p_notes?: string
          p_resolution_type: string
          p_session_id: string
        }
        Returns: Json
      }
      award_academy_coins: {
        Args: {
          p_amount: number
          p_block_id?: string
          p_lesson_id?: string
          p_reason: string
        }
        Returns: Json
      }
      award_classroom_star: {
        Args: { p_amount?: number; p_session: string; p_student: string }
        Returns: Json
      }
      book_class_slot: {
        Args: {
          p_duration: number
          p_hub_type: string
          p_is_trial?: boolean
          p_lesson_title: string
          p_scheduled_at: string
          p_slot_ids: string[]
          p_teacher_id: string
        }
        Returns: Json
      }
      book_interview_slot: {
        Args: { p_starts_at: string; p_token: string }
        Returns: {
          application_id: string
          duration_minutes: number
          interview_id: string
          room_token: string
          scheduled_at: string
          teacher_email: string
          teacher_name: string
        }[]
      }
      can_access_booking_session: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: boolean
      }
      can_access_lesson: {
        Args: { room_uuid: string; user_uuid: string }
        Returns: boolean
      }
      cancel_interview_slot: {
        Args: { p_token: string }
        Returns: {
          booking_expires_at: string
          id: string
          remaining_reschedules: number
          reschedule_count: number
          scheduled_at: string
          status: string
        }[]
      }
      check_achievements: {
        Args: { activity_data: Json; student_uuid: string }
        Returns: Json[]
      }
      check_teacher_penalties: {
        Args: { teacher_uuid: string }
        Returns: undefined
      }
      cleanup_stale_classroom_sessions: { Args: never; Returns: number }
      clear_pending_earnings: { Args: never; Returns: number }
      complete_referral: { Args: { friend_uuid: string }; Returns: undefined }
      consume_credit: { Args: { p_student_id: string }; Returns: boolean }
      consume_lesson_credit: {
        Args: { p_user_id: string }
        Returns: {
          remaining: number
          success: boolean
        }[]
      }
      consume_voice_energy: {
        Args: { p_user_id: string }
        Returns: {
          remaining: number
          success: boolean
        }[]
      }
      create_admin_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_notification_type: string
          p_title: string
        }
        Returns: undefined
      }
      current_market_region: {
        Args: never
        Returns: Database["public"]["Enums"]["market_region"]
      }
      delete_email: {
        Args: { _message_id: number; _queue_name: string }
        Returns: boolean
      }
      end_lesson: { Args: { p_booking_id: string }; Returns: Json }
      enqueue_email: {
        Args: { _payload: Json; _queue_name: string }
        Returns: number
      }
      ensure_user_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      flag_atrisk_teachers: { Args: never; Returns: number }
      generate_adaptive_learning_path: {
        Args: {
          difficulty_pref?: string
          learning_style_param?: string
          student_uuid: string
          target_cefr_level: string
        }
        Returns: string
      }
      generate_room_id: { Args: never; Returns: string }
      get_admin_dashboard_stats: {
        Args: never
        Returns: {
          lessons_booked_week: number
          new_students_week: number
          new_teachers_week: number
          total_lessons_completed: number
          total_students: number
          total_teachers: number
          upcoming_lessons: number
        }[]
      }
      get_approved_teachers: {
        Args: never
        Returns: {
          accent: string
          bio: string
          can_teach: boolean
          full_name: string
          hourly_rate_dzd: number
          hourly_rate_eur: number
          hub_role: string
          id: string
          is_available: boolean
          languages_spoken: string[]
          market_access: string[]
          profile_approved_by_admin: boolean
          profile_complete: boolean
          profile_image_url: string
          rating: number
          specializations: string[]
          timezone: string
          total_reviews: number
          user_id: string
          video_url: string
          years_experience: number
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_due_review_items: {
        Args: { p_hub?: string; p_limit?: number; p_user_id: string }
        Returns: {
          hub: string
          item_key: string
          item_type: string
          mastery_score: number
          next_review_at: string
        }[]
      }
      get_global_skill_averages: {
        Args: never
        Returns: {
          avg_score: number
          skill_name: string
        }[]
      }
      get_organization_analytics: { Args: { org_uuid: string }; Returns: Json }
      get_pending_reminders: {
        Args: never
        Returns: {
          lesson_date: string
          lesson_id: string
          lesson_title: string
          recipient_email: string
          recipient_name: string
          recipient_type: string
          reminder_id: string
          reminder_type: string
          room_link: string
          student_name: string
          teacher_name: string
        }[]
      }
      get_security_dashboard: { Args: never; Returns: Json }
      get_security_metrics: { Args: never; Returns: Json }
      get_security_status: { Args: never; Returns: Json }
      get_student_curriculum_analytics: {
        Args: { p_curriculum_id: string; p_student_id: string }
        Returns: Json
      }
      get_student_lesson_stats: {
        Args: { student_uuid: string }
        Returns: Json
      }
      get_student_progress_for_parent: {
        Args: { p_parent_id: string; p_student_id: string }
        Returns: Json
      }
      get_student_success_prediction: {
        Args: { student_uuid: string }
        Returns: Json
      }
      get_student_upcoming_lessons: {
        Args: { student_uuid: string }
        Returns: {
          class_booking_id: string
          duration: number
          id: string
          room_id: string
          room_link: string
          scheduled_at: string
          status: string
          teacher_id: string
          teacher_name: string
          title: string
        }[]
      }
      get_teacher_available_balance: {
        Args: { teacher_uuid: string }
        Returns: number
      }
      get_teacher_earnings_summary: {
        Args: { teacher_uuid: string }
        Returns: Json
      }
      get_teacher_monthly_owed: {
        Args: { p_teacher_user_id: string }
        Returns: {
          amount: number
          classes_count: number
          period_end: string
          period_start: string
          rate_applied: number
        }[]
      }
      get_teacher_profile_with_payment: {
        Args: { teacher_user_id: string }
        Returns: {
          accent: string
          bio: string
          full_name: string
          hourly_rate_dzd: number
          hourly_rate_eur: number
          id: string
          is_available: boolean
          languages_spoken: string[]
          payoneer_account_email: string
          profile_image_url: string
          rating: number
          specializations: string[]
          timezone: string
          total_reviews: number
          user_id: string
          video_url: string
          years_experience: number
        }[]
      }
      get_teacher_upcoming_lessons: {
        Args: { teacher_uuid: string }
        Returns: {
          class_booking_id: string
          duration: number
          id: string
          room_id: string
          room_link: string
          scheduled_at: string
          status: string
          student_id: string
          student_name: string
          title: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      handle_security_incident: {
        Args: {
          affected_user_id?: string
          description?: string
          incident_type: string
          severity?: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hub_role_slot_profile: {
        Args: { p_hub_role: string }
        Returns: {
          target_duration: number
          target_hub_specialty: string
        }[]
      }
      increment_template_clone: {
        Args: { template_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_marketing: { Args: { _user_id: string }; Returns: boolean }
      is_user_admin: { Args: never; Returns: boolean }
      is_user_teacher: { Args: never; Returns: boolean }
      jsonb_array_append: {
        Args: { new_value: Json; target: Json }
        Returns: Json
      }
      log_security_event: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: undefined
      }
      mark_student_absent: { Args: { p_session_id: string }; Returns: Json }
      move_to_dlq: {
        Args: {
          _error_message?: string
          _message_id: number
          _queue_name: string
        }
        Returns: boolean
      }
      process_lesson_completion: {
        Args: {
          failure_reason?: string
          lesson_status: string
          lesson_uuid: string
        }
        Returns: Json
      }
      purchase_virtual_reward: {
        Args: { reward_uuid: string; student_uuid: string }
        Returns: Json
      }
      purge_stale_data: { Args: never; Returns: undefined }
      read_email_batch: {
        Args: { _batch_size?: number; _queue_name: string }
        Returns: {
          attempts: number
          created_at: string
          expires_at: string
          id: number
          payload: Json
        }[]
      }
      recompute_teacher_kpis: { Args: never; Returns: number }
      record_biometric_anxiety: {
        Args: {
          p_gaze_seconds?: number
          p_item_key: string
          p_session_id?: string
          p_speech_db?: number
          p_student_id: string
          p_trace_px?: number
        }
        Returns: Json
      }
      refund_credit: { Args: { p_student_id: string }; Returns: undefined }
      reset_monthly_class_usage: { Args: never; Returns: undefined }
      resolve_classroom_id: { Args: { any_id: string }; Returns: string }
      save_placement_test_result: {
        Args: {
          p_cefr_level: string
          p_score: number
          p_total: number
          p_user_id: string
        }
        Returns: boolean
      }
      schedule_lesson_reminders: {
        Args: { p_lesson_id: string }
        Returns: undefined
      }
      score_cat_answer: {
        Args: { _answer_index: number; _item_id: string }
        Returns: boolean
      }
      server_now: { Args: never; Returns: string }
      submit_teacher_application:
        | {
            Args: {
              p_address?: string
              p_certifications?: string[]
              p_cover_letter?: string
              p_cv_url?: string
              p_education?: string
              p_email: string
              p_first_name: string
              p_languages_spoken?: string[]
              p_last_name: string
              p_phone?: string
              p_teaching_experience_years?: number
            }
            Returns: string
          }
        | { Args: { p_payload: Json }; Returns: string }
      tick_heartbeat: {
        Args: { p_role: string; p_session_id: string }
        Returns: undefined
      }
      update_learning_currency: {
        Args: {
          coins_to_add: number
          currency_source?: string
          student_uuid: string
        }
        Returns: Json
      }
      update_learning_model: {
        Args: {
          confidence?: number
          model_type_param: string
          new_model_data: Json
          student_uuid: string
        }
        Returns: string
      }
      update_learning_streak: {
        Args: { streak_type_param?: string; student_uuid: string }
        Returns: Json
      }
      update_student_xp: {
        Args: { student_uuid: string; xp_to_add: number }
        Returns: Json
      }
      update_teacher_performance_metrics: {
        Args: { teacher_uuid: string }
        Returns: undefined
      }
      upsert_mastery: {
        Args: {
          p_hub?: string
          p_item_key: string
          p_item_type?: string
          p_passed?: boolean
          p_user_id: string
        }
        Returns: undefined
      }
      upsert_streak: { Args: { p_user_id: string }; Returns: Json }
      validate_security_config: {
        Args: never
        Returns: {
          check_name: string
          details: string
          risk_level: string
          status: string
        }[]
      }
      verify_admin_access: {
        Args: { required_permission?: string }
        Returns: boolean
      }
      verify_certificate: {
        Args: { _code: string }
        Returns: {
          cefr_level: string
          certificate_number: string
          hours_completed: number
          issue_date: string
          score_achieved: number
          skills_demonstrated: string[]
          student_name: string
          teacher_name: string
          verification_code: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "student"
        | "teacher"
        | "admin"
        | "content_creator"
        | "parent"
        | "marketing"
      community_category:
        | "conversation_practice"
        | "business_english"
        | "ielts_preparation"
        | "academic_english"
        | "cultural_exchange"
        | "pronunciation"
        | "writing_practice"
        | "general_discussion"
      community_privacy: "public" | "private" | "invite_only"
      community_role: "owner" | "moderator" | "member" | "guest"
      library_status:
        | "locked"
        | "unlocked"
        | "reading"
        | "completed"
        | "favorite"
      market_region: "DZ" | "INTL"
      reading_session_mode: "solo" | "classroom"
      scaffold_level: "heavy" | "medium" | "light" | "independent"
      storybook_page_type:
        | "narration"
        | "dialogue"
        | "illustration"
        | "interaction"
        | "reflection"
        | "vocab_spotlight"
        | "speaking_checkpoint"
        | "comprehension"
      storybook_status: "draft" | "published" | "archived"
      student_level: "playground" | "academy" | "professional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "student",
        "teacher",
        "admin",
        "content_creator",
        "parent",
        "marketing",
      ],
      community_category: [
        "conversation_practice",
        "business_english",
        "ielts_preparation",
        "academic_english",
        "cultural_exchange",
        "pronunciation",
        "writing_practice",
        "general_discussion",
      ],
      community_privacy: ["public", "private", "invite_only"],
      community_role: ["owner", "moderator", "member", "guest"],
      library_status: [
        "locked",
        "unlocked",
        "reading",
        "completed",
        "favorite",
      ],
      market_region: ["DZ", "INTL"],
      reading_session_mode: ["solo", "classroom"],
      scaffold_level: ["heavy", "medium", "light", "independent"],
      storybook_page_type: [
        "narration",
        "dialogue",
        "illustration",
        "interaction",
        "reflection",
        "vocab_spotlight",
        "speaking_checkpoint",
        "comprehension",
      ],
      storybook_status: ["draft", "published", "archived"],
      student_level: ["playground", "academy", "professional"],
    },
  },
} as const
