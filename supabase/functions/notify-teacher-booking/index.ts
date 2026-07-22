import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin recipients CC'd on every booking
const ADMIN_RECIPIENTS = ["f.zahra.Djaanine@engleuphoria.com"];

function toIcsDate(d: Date): string {
  // YYYYMMDDTHHMMSSZ (UTC)
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(s: string): string {
  return (s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function buildCalendarLinks(opts: {
  title: string;
  start: Date;
  durationMin: number;
  description: string;
  location: string;
  uid: string;
}) {
  const end = new Date(opts.start.getTime() + opts.durationMin * 60 * 1000);
  const startStr = toIcsDate(opts.start);
  const endStr = toIcsDate(end);

  // Google Calendar quick-add
  const googleCalendarUrl =
    "https://www.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(opts.title)}` +
    `&dates=${startStr}/${endStr}` +
    `&details=${encodeURIComponent(opts.description)}` +
    `&location=${encodeURIComponent(opts.location)}`;

  // ICS as data URL (works in Apple Mail / Outlook desktop)
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EnglEuphoria//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@engleuphoria.com`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${escapeIcs(opts.title)}`,
    `DESCRIPTION:${escapeIcs(opts.description)}`,
    `LOCATION:${escapeIcs(opts.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  return { googleCalendarUrl, icsUrl };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const payload = await req.json();
    const lessonId = payload.record?.id;
    if (!lessonId) throw new Error("No lesson ID provided");

    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        id, title, scheduled_at, duration, room_link,
        teacher:users!lessons_teacher_id_fkey(email, full_name),
        student:users!lessons_student_id_fkey(full_name)
      `)
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      throw new Error(`Failed to fetch lesson: ${lessonError?.message}`);
    }

    const teacher: any = Array.isArray((lesson as any).teacher) ? (lesson as any).teacher[0] : (lesson as any).teacher;
    const student: any = Array.isArray((lesson as any).student) ? (lesson as any).student[0] : (lesson as any).student;

    const scheduledDate = new Date(lesson.scheduled_at);
    const durationMin = Number(lesson.duration) || 60;
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    });
    const durationLabel = `${durationMin} minutes`;

    const lessonTitle = lesson.title || "English Lesson";
    const roomLink = lesson.room_link || "";
    const description = `${lessonTitle} with ${student?.full_name || "your student"} on EnglEuphoria.${roomLink ? `\n\nClassroom: ${roomLink}` : ""}`;
    const { googleCalendarUrl, icsUrl } = buildCalendarLinks({
      title: lessonTitle,
      start: scheduledDate,
      durationMin,
      description,
      location: roomLink || "EnglEuphoria online classroom",
      uid: `lesson-${lessonId}`,
    });

    // 1) Email the teacher
    if (teacher?.email) {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "teacher-booking",
          recipientEmail: teacher.email,
          idempotencyKey: `teacher-booking-${lessonId}`,
          templateData: {
            teacherName: teacher?.full_name,
            studentName: student?.full_name,
            lessonTitle,
            lessonDate: formattedDate,
            lessonTime: formattedTime,
            durationLabel,
            roomLink,
            googleCalendarUrl,
            icsUrl,
          },
        },
        headers: internalAuthHeaders(),
      });
      if (error) console.error("Teacher email failed:", error);
    }

    // 2) Alert each admin (event-driven 1:1 — one specific booking per recipient)
    for (const adminEmail of ADMIN_RECIPIENTS) {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "admin-booking-alert",
          recipientEmail: adminEmail,
          idempotencyKey: `admin-booking-${lessonId}-${adminEmail}`,
          templateData: {
            teacherName: teacher?.full_name,
            teacherEmail: teacher?.email,
            studentName: student?.full_name,
            lessonTitle,
            lessonDate: formattedDate,
            lessonTime: formattedTime,
            durationLabel,
          },
        },
        headers: internalAuthHeaders(),
      });
      if (error) console.error(`Admin alert failed for ${adminEmail}:`, error);
    }

    console.log("Booking notifications dispatched for lesson:", lessonId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error in notify-teacher-booking:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
