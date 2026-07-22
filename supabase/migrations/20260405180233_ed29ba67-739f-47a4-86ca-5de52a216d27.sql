
-- Student Inventory: tracks which accessories each student has unlocked
CREATE TABLE IF NOT EXISTS public.student_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessory_id UUID NOT NULL REFERENCES public.accessories(id) ON DELETE CASCADE,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, accessory_id)
);

-- Enable RLS
ALTER TABLE public.student_inventory ENABLE ROW LEVEL SECURITY;

-- Students can view their own inventory
CREATE POLICY "Students can view own inventory"
  ON public.student_inventory FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Students can update their own items (equip/unequip)
CREATE POLICY "Students can update own inventory"
  ON public.student_inventory FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Only server/service role inserts (via edge function or trigger), but allow authenticated insert for lesson completion flow
CREATE POLICY "Students can insert own inventory"
  ON public.student_inventory FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Index for fast lookups
CREATE INDEX idx_student_inventory_student ON public.student_inventory(student_id);
CREATE INDEX idx_student_inventory_accessory ON public.student_inventory(accessory_id);
