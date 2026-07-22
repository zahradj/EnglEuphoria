import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, Sparkles, GraduationCap, Briefcase } from "lucide-react";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";

type Hub = "playground" | "academy" | "success";

const HUBS: Array<{
  id: Hub;
  title: string;
  tagline: string;
  duration: string;
  ring: string;
  bg: string;
  icon: React.ReactNode;
}> = [
  {
    id: "playground",
    title: "Playground Hub",
    tagline: "Teach kids aged 4–12 in 30-minute joyful sessions.",
    duration: "30 min",
    ring: "ring-orange-400",
    bg: "from-orange-50 to-yellow-50 border-orange-200",
    icon: <Sparkles className="w-7 h-7 text-orange-500" />,
  },
  {
    id: "academy",
    title: "Academy Hub",
    tagline: "Teach teens aged 13–17 in 60-minute curriculum-led lessons.",
    duration: "60 min",
    ring: "ring-purple-400",
    bg: "from-purple-50 to-violet-50 border-purple-200",
    icon: <GraduationCap className="w-7 h-7 text-purple-600" />,
  },
  {
    id: "success",
    title: "Success Hub",
    tagline: "Coach adult learners in 60-minute professional sessions.",
    duration: "60 min",
    ring: "ring-emerald-400",
    bg: "from-emerald-50 to-teal-50 border-emerald-200",
    icon: <Briefcase className="w-7 h-7 text-emerald-600" />,
  },
];

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const samplerForHub = (hub: Hub) =>
  hub === "playground" ? "playground_sampler" : hub === "success" ? "success_sampler" : "academy_sampler";

const durationForHub = (hub: Hub) => (hub === "playground" ? 30 : 60);

const InterviewScheduler: React.FC = () => {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hub, setHub] = useState<Hub | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedInterviewId, setConfirmedInterviewId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("teacher_applications")
        .select("id, first_name, last_name, email, grammar_test_status, interview_invite_token")
        .eq("interview_invite_token", token)
        .maybeSingle();
      if (error || !data) {
        toast({
          title: "Invalid or expired link",
          description: "Please contact the admissions team.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      setApplication(data);
      setLoading(false);
    })();
  }, [token]);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const handleConfirm = async () => {
    if (!application || !hub || !date || !slot) return;
    setSubmitting(true);
    try {
      const [hh, mm] = slot.split(":").map(Number);
      const scheduled = new Date(date);
      scheduled.setHours(hh, mm, 0, 0);

      const classroomId = crypto.randomUUID();
      const interviewId = crypto.randomUUID();
      const classroomSessionId = `interview-${interviewId}`;

      const { data, error } = await supabase
        .from("interviews")
        .insert({
          id: interviewId,
          application_id: application.id,
          hub,
          hub_type: hub,
          classroom_id: classroomId,
          classroom_session_id: classroomSessionId,
          scheduled_at: scheduled.toISOString(),
          status: "scheduled",
          invite_token: token,
          duration_minutes: durationForHub(hub),
          mock_lesson_key: samplerForHub(hub),
        })
        .select("id, classroom_id")
        .single();
      if (error) throw error;

      await supabase
        .from("teacher_applications")
        .update({ current_stage: "interview_scheduled", status: "interview_scheduled" })
        .eq("id", application.id);

      setConfirmedInterviewId(data.id);
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Could not schedule interview", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-3">
            <h2 className="text-xl font-semibold">Link not recognised</h2>
            <p className="text-slate-600 text-sm">
              This interview link is invalid or has already been used. Please get in touch with the
              admissions team if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {application.first_name}!
          </h1>
          <p className="text-slate-600 text-sm">
            Choose the hub you want to interview for, then pick a date and time.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {[1, 2, 3].map((n) => (
            <React.Fragment key={n}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step >= n ? "bg-primary text-primary-foreground" : "bg-slate-200 text-slate-500"
                }`}
              >
                {n}
              </div>
              {n < 3 && <div className={`flex-1 h-0.5 ${step > n ? "bg-primary" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 1 · Pick your hub</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {HUBS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHub(h.id)}
                  className={`text-left p-5 rounded-xl border bg-gradient-to-br ${h.bg} transition ${
                    hub === h.id ? `ring-2 ${h.ring}` : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {h.icon}
                    <Badge variant="outline">{h.duration}</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900">{h.title}</h3>
                  <p className="text-sm text-slate-700 mt-1">{h.tagline}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button disabled={!hub} onClick={() => setStep(2)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && hub && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 2 · Pick a date and time</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarUI
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < minDate}
                    className="p-0"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Time slot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((s) => (
                      <Button
                        key={s}
                        variant={slot === s ? "default" : "outline"}
                        onClick={() => setSlot(s)}
                        disabled={!date}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!date || !slot || submitting} onClick={handleConfirm}>
                {submitting ? "Booking…" : "Confirm interview"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && confirmedInterviewId && hub && (
          <Card>
            <CardContent className="p-10 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-600" />
              <h2 className="text-2xl font-bold">Interview booked!</h2>
              <p className="text-slate-600">
                Your <strong>{hub.charAt(0).toUpperCase() + hub.slice(1)}</strong> interview is
                confirmed. The interview classroom will open 15 minutes before your scheduled time so
                you can prepare.
              </p>
              <Button onClick={() => navigate(`/interview-classroom/${confirmedInterviewId}`)}>
                Open interview classroom
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InterviewScheduler;
