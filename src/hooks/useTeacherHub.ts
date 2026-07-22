import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HubKind } from "@/services/recurringSlotsService";

/**
 * Resolve the teacher's primary hub for slot-opening UI.
 *
 * Priority:
 *  1. teacher_profiles.hub_role  → 'playground_specialist' | 'mentor_academy' | 'mentor_success'
 *  2. teacher_profiles.hub_specialty (if present)
 *  3. Fallback: 'academy' (60-minute default)
 *
 * Returns 'playground' | 'academy' | 'success' so the same OpenSlotsDialog
 * works identically across all hubs.
 */
export function useTeacherHub(teacherId?: string | null): HubKind {
  const [hub, setHub] = useState<HubKind>("academy");

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("teacher_profiles")
        .select("hub_role, hub_specialty")
        .eq("user_id", teacherId)
        .maybeSingle();

      if (cancelled || !data) return;

      const role = String((data as any).hub_role ?? "").toLowerCase();
      const specialty = String((data as any).hub_specialty ?? "").toLowerCase();

      if (role.includes("playground") || specialty.includes("playground")) {
        setHub("playground");
      } else if (role.includes("success") || specialty.includes("success")) {
        setHub("success");
      } else if (role.includes("academy") || specialty.includes("academy")) {
        setHub("academy");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  return hub;
}
