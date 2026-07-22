-- Final Security Completion: Address remaining issues

-- Query to identify tables with RLS enabled but no policies
-- This will help us understand which tables need policies
DO $$
DECLARE
    r RECORD;
    policy_count INTEGER;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = pg_tables.schemaname 
            AND tablename = pg_tables.tablename
        )
    LOOP
        -- Check if RLS is enabled on this table
        SELECT COUNT(*) INTO policy_count
        FROM information_schema.tables 
        WHERE table_schema = r.schemaname 
        AND table_name = r.tablename;
        
        -- Log tables that might need policies
        RAISE NOTICE 'Table %.% may need RLS policies', r.schemaname, r.tablename;
    END LOOP;
END $$;

-- Add comprehensive RLS policies for any remaining tables that need them

-- For speaking_progress table (if it exists and needs policies)
DO $$
BEGIN
    -- Check if table exists and add policies if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'speaking_progress' AND table_schema = 'public') THEN
        
        -- Policy for viewing own progress
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own speaking progress' AND tablename = 'speaking_progress') THEN
            CREATE POLICY "Users can view their own speaking progress" 
            ON public.speaking_progress 
            FOR SELECT 
            USING (student_id = auth.uid());
        END IF;

        -- Policy for system to insert/update progress
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can manage speaking progress' AND tablename = 'speaking_progress') THEN
            CREATE POLICY "System can manage speaking progress" 
            ON public.speaking_progress 
            FOR ALL 
            USING (student_id = auth.uid()) 
            WITH CHECK (student_id = auth.uid());
        END IF;
    END IF;
END $$;

-- For student_learning_streaks table (if it exists and needs policies)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_learning_streaks' AND table_schema = 'public') THEN
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own learning streaks' AND tablename = 'student_learning_streaks') THEN
            CREATE POLICY "Users can view their own learning streaks" 
            ON public.student_learning_streaks 
            FOR SELECT 
            USING (student_id = auth.uid());
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can manage learning streaks' AND tablename = 'student_learning_streaks') THEN
            CREATE POLICY "System can manage learning streaks" 
            ON public.student_learning_streaks 
            FOR ALL 
            USING (student_id = auth.uid()) 
            WITH CHECK (student_id = auth.uid());
        END IF;
    END IF;
END $$;

-- For learning_currency table (if it exists and needs policies)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_currency' AND table_schema = 'public') THEN
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own learning currency' AND tablename = 'learning_currency') THEN
            CREATE POLICY "Users can view their own learning currency" 
            ON public.learning_currency 
            FOR SELECT 
            USING (student_id = auth.uid());
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can manage learning currency' AND tablename = 'learning_currency') THEN
            CREATE POLICY "System can manage learning currency" 
            ON public.learning_currency 
            FOR ALL 
            USING (student_id = auth.uid()) 
            WITH CHECK (student_id = auth.uid());
        END IF;
    END IF;
END $$;

-- Check and fix any remaining functions that might need search_path set
-- This is a comprehensive approach to catch any missed functions

DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Loop through functions that don't have search_path set
    FOR func_record IN 
        SELECT routine_name, specific_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        AND security_type = 'DEFINER'
        AND routine_name NOT IN (
            SELECT proname 
            FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' 
            AND prosecdef = true 
            AND array_to_string(proconfig, ' ') LIKE '%search_path%'
        )
    LOOP
        RAISE NOTICE 'Function % may need search_path set', func_record.routine_name;
    END LOOP;
END $$;

-- Ensure all critical system functions have proper search_path
-- Update any functions we might have missed

-- Fix generate_adaptive_learning_path if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_adaptive_learning_path') THEN
        CREATE OR REPLACE FUNCTION public.generate_adaptive_learning_path(student_uuid uuid, target_cefr_level text, learning_style_param text DEFAULT 'mixed'::text, difficulty_pref text DEFAULT 'adaptive'::text)
         RETURNS uuid
         LANGUAGE plpgsql
         SECURITY DEFINER
         SET search_path TO 'public'
        AS $function$
        DECLARE
          path_id UUID;
          content_items JSONB;
        BEGIN
          -- Get suitable content based on student's level and preferences
          SELECT jsonb_agg(
            jsonb_build_object(
              'content_id', id,
              'title', title,
              'difficulty_level', difficulty_level,
              'estimated_duration', estimated_duration,
              'order_index', ROW_NUMBER() OVER (ORDER BY difficulty_level, success_rate DESC)
            )
          ) INTO content_items
          FROM public.adaptive_content
          WHERE cefr_level = target_cefr_level 
            AND is_active = true
          ORDER BY difficulty_level, success_rate DESC
          LIMIT 20;

          -- Create personalized learning path
          INSERT INTO public.personalized_learning_paths (
            student_id,
            path_name,
            total_steps,
            path_data,
            learning_style,
            difficulty_preference,
            estimated_completion_days
          ) VALUES (
            student_uuid,
            'AI-Generated Path for ' || target_cefr_level,
            jsonb_array_length(content_items),
            jsonb_build_object('content_sequence', content_items),
            learning_style_param,
            difficulty_pref,
            jsonb_array_length(content_items) * 2 -- Estimate 2 days per item
          )
          RETURNING id INTO path_id;
          
          RETURN path_id;
        END;
        $function$;
    END IF;
END $$;

-- Fix update_learning_model if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_learning_model') THEN
        CREATE OR REPLACE FUNCTION public.update_learning_model(student_uuid uuid, model_type_param text, new_model_data jsonb, confidence numeric DEFAULT 0.8)
         RETURNS uuid
         LANGUAGE plpgsql
         SECURITY DEFINER
         SET search_path TO 'public'
        AS $function$
        DECLARE
          model_id UUID;
        BEGIN
          INSERT INTO public.ai_learning_models (
            student_id, 
            model_type, 
            model_data, 
            confidence_score
          ) VALUES (
            student_uuid, 
            model_type_param, 
            new_model_data, 
            confidence
          )
          ON CONFLICT (student_id, model_type) 
          DO UPDATE SET
            model_data = EXCLUDED.model_data,
            confidence_score = EXCLUDED.confidence_score,
            last_updated_at = NOW()
          RETURNING id INTO model_id;
          
          RETURN model_id;
        END;
        $function$;
    END IF;
END $$;

-- Fix check_achievements if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_achievements') THEN
        CREATE OR REPLACE FUNCTION public.check_achievements(student_uuid uuid, activity_data jsonb)
         RETURNS jsonb[]
         LANGUAGE plpgsql
         SECURITY DEFINER
         SET search_path TO 'public'
        AS $function$
        DECLARE
          achievement RECORD;
          earned_achievements JSONB[] := '{}';
          requirement_key TEXT;
          requirement_value INTEGER;
          student_progress JSONB;
          current_value INTEGER;
        BEGIN
          -- Loop through all active achievements
          FOR achievement IN SELECT * FROM public.achievements WHERE is_active = true LOOP
            -- Check if student already has this achievement
            IF NOT EXISTS (
              SELECT 1 FROM public.student_achievements 
              WHERE student_id = student_uuid AND achievement_id = achievement.id
            ) THEN
              -- Check if requirements are met
              FOR requirement_key, requirement_value IN SELECT * FROM jsonb_each_text(achievement.requirements) LOOP
                current_value := COALESCE((activity_data ->> requirement_key)::INTEGER, 0);
                
                IF current_value >= requirement_value::INTEGER THEN
                  -- Award the achievement
                  INSERT INTO public.student_achievements (student_id, achievement_id)
                  VALUES (student_uuid, achievement.id);
                  
                  -- Add XP reward
                  PERFORM public.update_student_xp(student_uuid, achievement.xp_reward);
                  
                  -- Add to earned achievements array
                  earned_achievements := earned_achievements || jsonb_build_object(
                    'id', achievement.id,
                    'name', achievement.name,
                    'description', achievement.description,
                    'icon', achievement.icon,
                    'xp_reward', achievement.xp_reward
                  );
                END IF;
              END LOOP;
            END IF;
          END LOOP;
          
          RETURN earned_achievements;
        END;
        $function$;
    END IF;
END $$;