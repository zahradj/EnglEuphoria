// Runs every minute (pg_cron). Tells the student AND the teacher their lesson is about to start:
// at about 1 hour and again at 15 minutes. Each is sent once (lesson_push_reminders remembers it).
// It writes an in-app notification; the database turns that into a phone / tablet push (push_on_notification).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { requireInternalSecret } from "../_shared/internalAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

type Lang = "en" | "fr" | "es" | "it" | "tr" | "ar";
const LANGS: Lang[] = ["en", "fr", "es", "it", "tr", "ar"];

// {n} = minutes left, {name} = the other person in the lesson.
const TEXT: Record<Lang, { h1: string; m: string; student: string; teacher: string }> = {
  en: {
    h1: "Your lesson starts in about 1 hour",
    m: "Your lesson starts in {n} min",
    student: "Lesson with {name}. Tap to check your camera and mic and get ready.",
    teacher: "Lesson with {name}. Tap to open the classroom.",
  },
  fr: {
    h1: "Votre cours commence dans environ 1 heure",
    m: "Votre cours commence dans {n} min",
    student: "Cours avec {name}. Touchez pour vérifier votre caméra et votre micro et vous préparer.",
    teacher: "Cours avec {name}. Touchez pour ouvrir la classe.",
  },
  es: {
    h1: "Tu clase empieza en aproximadamente 1 hora",
    m: "Tu clase empieza en {n} min",
    student: "Clase con {name}. Toca para revisar tu cámara y micrófono y prepararte.",
    teacher: "Clase con {name}. Toca para abrir el aula.",
  },
  it: {
    h1: "La tua lezione inizia tra circa 1 ora",
    m: "La tua lezione inizia tra {n} min",
    student: "Lezione con {name}. Tocca per controllare webcam e microfono e prepararti.",
    teacher: "Lezione con {name}. Tocca per aprire la classe.",
  },
  tr: {
    h1: "Dersiniz yaklaşık 1 saat sonra başlıyor",
    m: "Dersiniz {n} dk sonra başlıyor",
    student: "{name} ile ders. Kameranızı ve mikrofonunuzu kontrol edip hazırlanmak için dokunun.",
    teacher: "{name} ile ders. Sınıfı açmak için dokunun.",
  },
  ar: {
    h1: "يبدأ درسك بعد حوالي ساعة",
    m: "يبدأ درسك بعد {n} دقيقة",
    student: "درس مع {name}. اضغط لفحص الكاميرا والميكروفون والاستعداد.",
    teacher: "درس مع {name}. اضغط لفتح الصف.",
  },
};

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ""));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authError = requireInternalSecret(req, corsHeaders);
  if (authError) return authError;

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const now = Date.now();
    const { data: bookings, error } = await supabase
      .from("class_bookings")
      .select("id, scheduled_at, status, student_id, teacher_id")
      .in("status", ["scheduled", "confirmed"])
      .gt("scheduled_at", new Date(now).toISOString())
      .lte("scheduled_at", new Date(now + 60 * 60_000).toISOString());
    if (error) throw error;
    if (!bookings?.length) return new Response(JSON.stringify({ sent: 0 }), { headers: corsHeaders });

    const ids = [...new Set(bookings.flatMap((b) => [b.student_id, b.teacher_id]).filter(Boolean))] as string[];
    const { data: people } = await supabase.from("users").select("id, full_name, preferred_language").in("id", ids);
    const person = new Map((people ?? []).map((p) => [p.id as string, p]));

    let sent = 0;
    for (const b of bookings) {
      const minutes = Math.max(1, Math.round((new Date(b.scheduled_at).getTime() - now) / 60_000));
      // About 1 hour (45-60 min before): skipped for lessons booked late. 15 minutes: any time inside the last 15.
      const kind: "1h" | "15m" | null = minutes > 45 ? "1h" : minutes <= 15 ? "15m" : null;
      if (!kind) continue;

      const sides = [
        { userId: b.student_id as string | null, otherId: b.teacher_id as string | null, role: "student" as const },
        { userId: b.teacher_id as string | null, otherId: b.student_id as string | null, role: "teacher" as const },
      ];
      for (const side of sides) {
        if (!side.userId) continue;
        // Claim it first: if another run already did, the insert conflicts and nothing is sent twice.
        const { error: claimErr } = await supabase
          .from("lesson_push_reminders")
          .insert({ booking_id: b.id, user_id: side.userId, kind });
        if (claimErr) continue;

        const me = person.get(side.userId);
        const lang = (LANGS.includes(me?.preferred_language as Lang) ? me?.preferred_language : "en") as Lang;
        const text = TEXT[lang];
        const otherName = (side.otherId && person.get(side.otherId)?.full_name) || "";
        const { error: notifErr } = await supabase.from("notifications").insert({
          user_id: side.userId,
          title: kind === "1h" ? text.h1 : fill(text.m, { n: minutes }),
          content: fill(side.role === "student" ? text.student : text.teacher, { name: otherName }),
          type: "lesson_reminder",
          is_read: false,
          action_url: `/classroom/${b.id}`,
        });
        if (notifErr) {
          console.error("reminder notification failed", notifErr.message);
          // Release the claim so the next minute tries again.
          await supabase.from("lesson_push_reminders").delete().match({ booking_id: b.id, user_id: side.userId, kind });
          continue;
        }
        sent++;
      }
    }
    return new Response(JSON.stringify({ sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-lesson-push-reminders error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
