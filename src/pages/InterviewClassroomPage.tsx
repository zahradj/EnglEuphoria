import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TeacherClassroom } from "@/components/teacher/classroom";
import { Loader2, Sparkles, GraduationCap, Briefcase } from "lucide-react";

type Hub = "playground" | "academy" | "success";

const normalizeHub = (value?: string | null): Hub | null => {
  const v = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (!v) return null;
  if (v.includes('playground') || v.includes('kid') || v.includes('child')) return 'playground';
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'success';
  if (v.includes('academy') || v.includes('teen')) return 'academy';
  return null;
};

const HUB_THEME: Record<Hub, { label: string; bg: string; pill: string; icon: React.ReactNode; teacherHub: "playground" | "academy" | "professional" }> = {
  playground: {
    label: "Playground Interview",
    bg: "bg-white",
    pill: "bg-orange-500 text-white",
    icon: <Sparkles className="w-4 h-4" />,
    teacherHub: "playground",
  },
  academy: {
    label: "Academy Interview",
    bg: "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50",
    pill: "bg-purple-600 text-white",
    icon: <GraduationCap className="w-4 h-4" />,
    teacherHub: "academy",
  },
  success: {
    label: "Success Interview",
    bg: "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50",
    pill: "bg-emerald-600 text-white",
    icon: <Briefcase className="w-4 h-4" />,
    teacherHub: "professional",
  },
};

const InterviewClassroomPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!interviewId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("interviews")
        .select("id, hub, hub_type, classroom_id, scheduled_at, application_id")
        .eq("id", interviewId)
        .maybeSingle();

      let appData: any = null;
      if (data?.application_id) {
        const { data: app } = await supabase
          .from("teacher_applications")
          .select("first_name, last_name")
          .eq("id", data.application_id)
          .maybeSingle();
        appData = app;
      }
      setInterview({ ...data, application: appData });
      setLoading(false);
    })();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const resolvedHub = normalizeHub(interview?.hub_type) ?? normalizeHub(interview?.hub);
  if (!interview || !resolvedHub) {
    return <Navigate to="/" replace />;
  }

  const hub = resolvedHub;
  const theme = HUB_THEME[hub];

  const candidateName = interview.application
    ? `${interview.application.first_name} ${interview.application.last_name}`.trim()
    : "Candidate";

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="relative z-10 bg-white/70 backdrop-blur-md border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${theme.pill}`}>
              {theme.icon}
              {theme.label}
            </span>
            <span className="text-xs text-slate-700 truncate">
              Candidate: <strong>{candidateName}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 shrink-0">
            {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : "—"}
          </span>
        </div>
      </div>

      <TeacherClassroom
        classId={interview.classroom_id ?? interview.id}
        teacherName={candidateName}
        studentName="Interviewer"
        lessonTitle={`${theme.label} · Demo lesson`}
        hubType={theme.teacherHub}
        scheduledAt={interview.scheduled_at}
        isInterview
      />

    </div>
  );
};

export default InterviewClassroomPage;
