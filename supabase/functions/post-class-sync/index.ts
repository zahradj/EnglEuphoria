// post-class-sync — populates the student's Vocabulary Vault and Map of Sounds
// after a teacher marks a lesson as completed.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Auth: any authenticated user (teacher closing the booking) may trigger
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { booking_id, student_id: bodyStudentId, lesson_id: bodyLessonId } = await req.json();

    let studentId: string | null = bodyStudentId || null;
    let lessonId: string | null = bodyLessonId || null;

    if (!studentId || !lessonId) {
      if (!booking_id) {
        return new Response(JSON.stringify({ error: "Provide booking_id or (student_id + lesson_id)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: booking, error: bErr } = await supabase
        .from("class_bookings")
        .select("student_id, lesson_id")
        .eq("id", booking_id)
        .maybeSingle();
      if (bErr || !booking) {
        return new Response(JSON.stringify({ error: "Booking not found", detail: bErr?.message }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      studentId = booking.student_id;
      lessonId = booking.lesson_id;
    }

    if (!studentId || !lessonId) {
      return new Response(JSON.stringify({ error: "Booking missing student_id or lesson_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Pull blueprint
    const { data: lesson, error: lErr } = await supabase
      .from("curriculum_lessons")
      .select("id, title, vocabulary_list, phonics_focus, content, unit_id")
      .eq("id", lessonId)
      .maybeSingle();
    if (lErr || !lesson) {
      return new Response(JSON.stringify({ error: "Lesson not found", detail: lErr?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const blueprintContent = (lesson.content as any) || {};
    const vocabRaw: unknown = lesson.vocabulary_list ?? blueprintContent.target_vocabulary ?? blueprintContent.vocabulary ?? [];
    const phonicsRaw: unknown = lesson.phonics_focus ?? blueprintContent.target_phonics ?? blueprintContent.phonics ?? "";

    // Normalize vocabulary into [{word, image_url?, audio_url?}]
    const vocabItems: Array<{ word: string; image_url?: string; audio_url?: string }> = [];
    if (Array.isArray(vocabRaw)) {
      for (const v of vocabRaw) {
        if (typeof v === "string" && v.trim()) vocabItems.push({ word: v.trim() });
        else if (v && typeof v === "object") {
          const w = (v as any).word || (v as any).term || (v as any).text;
          if (w && String(w).trim()) {
            vocabItems.push({
              word: String(w).trim(),
              image_url: (v as any).image_url || (v as any).imageUrl,
              audio_url: (v as any).audio_url || (v as any).audioUrl,
            });
          }
        }
      }
    } else if (typeof vocabRaw === "string" && vocabRaw.trim()) {
      vocabItems.push(...vocabRaw.split(/[,\n]+/).map(s => ({ word: s.trim() })).filter(x => x.word));
    }

    // Normalize phonics into list of phonemes
    const phonicsItems: Array<{ phoneme: string; image_url?: string; audio_url?: string }> = [];
    if (Array.isArray(phonicsRaw)) {
      for (const p of phonicsRaw) {
        if (typeof p === "string" && p.trim()) phonicsItems.push({ phoneme: p.trim() });
        else if (p && typeof p === "object") {
          const sound = (p as any).phoneme || (p as any).sound || (p as any).text;
          if (sound) phonicsItems.push({
            phoneme: String(sound).trim(),
            image_url: (p as any).image_url, audio_url: (p as any).audio_url,
          });
        }
      }
    } else if (typeof phonicsRaw === "string" && phonicsRaw.trim()) {
      phonicsItems.push(...phonicsRaw.split(/[,\n]+/).map(s => ({ phoneme: s.trim() })).filter(x => x.phoneme));
    }

    let vocabSynced = 0;
    let phonicsSynced = 0;

    // Upsert vocabulary
    if (vocabItems.length > 0) {
      const rows = vocabItems.map(v => ({
        student_id: studentId,
        word: v.word,
        unit_id: lesson.unit_id || null,
        image_url: v.image_url || null,
        sticker_image_url: v.image_url || null,
        audio_url: v.audio_url || null,
        mastery_level: 1,
        first_seen_at: new Date().toISOString(),
        last_reviewed_at: new Date().toISOString(),
      }));
      const { error: vErr } = await supabase
        .from("student_vocabulary_progress")
        .upsert(rows, { onConflict: "student_id,word", ignoreDuplicates: false });
      if (vErr) console.error("Vocab upsert error:", vErr);
      else vocabSynced = rows.length;
    }

    // Upsert phonics
    if (phonicsItems.length > 0) {
      const rows = phonicsItems.map(p => ({
        student_id: studentId,
        phoneme: p.phoneme,
        lesson_id: lessonId,
        image_url: p.image_url || null,
        audio_url: p.audio_url || null,
        mastery_level: "introduced",
      }));
      const { error: pErr } = await supabase
        .from("student_phonics_progress")
        .upsert(rows, { onConflict: "student_id,phoneme", ignoreDuplicates: false });
      if (pErr) console.error("Phonics upsert error:", pErr);
      else phonicsSynced = rows.length;
    }

    return new Response(JSON.stringify({
      success: true,
      student_id: studentId,
      lesson_id: lessonId,
      vocab_synced: vocabSynced,
      phonics_synced: phonicsSynced,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
