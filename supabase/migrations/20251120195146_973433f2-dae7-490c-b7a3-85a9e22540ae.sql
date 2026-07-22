-- First, drop the existing category check constraint
ALTER TABLE public.curriculum_quick_actions 
DROP CONSTRAINT IF EXISTS curriculum_quick_actions_category_check;

-- Add new category constraint that includes all mode categories
ALTER TABLE public.curriculum_quick_actions 
ADD CONSTRAINT curriculum_quick_actions_category_check 
CHECK (category IN ('lesson', 'activity', 'worksheet', 'planning', 'unit', 'curriculum', 'assessment', 'mission', 'resource'));

-- Add mode column to curriculum_quick_actions
ALTER TABLE public.curriculum_quick_actions 
ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'lesson' 
CHECK (mode IN ('lesson', 'unit', 'curriculum', 'assessment', 'mission', 'resource'));

-- Update existing records to have mode='lesson'
UPDATE public.curriculum_quick_actions SET mode = 'lesson' WHERE mode IS NULL;

-- Add composite index for performance
CREATE INDEX IF NOT EXISTS idx_quick_actions_mode_age ON public.curriculum_quick_actions(mode, age_group, order_index);