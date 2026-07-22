import React, { useMemo } from 'react';
import { useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Clock, BookOpen, ArrowRight, ClipboardCheck, Sparkles, Trophy } from 'lucide-react';
import pipMascot from '@/assets/pip-fox-mascot-v2.png';
import ariaOwl from '@/assets/aria-owl-mascot-v2.png';
import maxEagle from '@/assets/max-eagle-mascot-v2.png';
import { StudentLessonOutcomeDialog } from '@/components/classroom/StudentLessonOutcomeDialog';
import { FLAG_META, IncidentFlag, toneClasses } from '@/components/classroom/incidentFlags';


type Hub = 'playground' | 'academy' | 'professional';

interface HubBrand {
  pageGradient: string;
  cardGlow: string;
  ringColor: string;
  accent: string;
  accentSoft: string;
  btn: string;
  bubbleGradient: string;
  badgeGradient: string;
  confetti: string[];
  characterImg: string;
  characterName: string;
  greeting: string;
}

const HUB_BRAND: Record<Hub, HubBrand> = {
  playground: {
    pageGradient:
      'radial-gradient(120% 90% at 0% 0%, #FFE9B8 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, #FFB779 0%, transparent 55%), linear-gradient(135deg, #FFF8E5 0%, #FFE1C2 100%)',
    cardGlow: '0 30px 80px -20px rgba(254,106,47,0.35), 0 8px 24px -8px rgba(254,106,47,0.25)',
    ringColor: 'rgba(254,106,47,0.25)',
    accent: 'text-[#E25410]',
    accentSoft: 'bg-orange-50',
    btn: 'bg-gradient-to-r from-[#FE6A2F] to-[#FFB347] hover:from-[#E85A22] hover:to-[#FFA033] shadow-lg shadow-orange-300/40',
    bubbleGradient: 'from-[#FFF6D6] via-[#FFD89B] to-[#FE6A2F]',
    badgeGradient: 'from-[#FFC766] via-[#FF9A3D] to-[#FE6A2F]',
    confetti: ['#FE6A2F', '#FFB347', '#FFD89B', '#FFE9B8'],
    characterImg: pipMascot,
    characterName: 'Pip the Fox',
    greeting: 'Great work today',
  },
  academy: {
    pageGradient:
      'radial-gradient(120% 90% at 0% 0%, #EDE9FE 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, #C4B5FD 0%, transparent 55%), linear-gradient(135deg, #FAF5FF 0%, #E9D5FF 100%)',
    cardGlow: '0 30px 80px -20px rgba(107,33,168,0.35), 0 8px 24px -8px rgba(107,33,168,0.25)',
    ringColor: 'rgba(107,33,168,0.25)',
    accent: 'text-[#6B21A8]',
    accentSoft: 'bg-purple-50',
    btn: 'bg-gradient-to-r from-[#6B21A8] to-[#A855F7] hover:from-[#581C87] hover:to-[#9333EA] shadow-lg shadow-purple-300/40',
    bubbleGradient: 'from-[#F5F3FF] via-[#C4B5FD] to-[#6B21A8]',
    badgeGradient: 'from-[#A78BFA] via-[#8B5CF6] to-[#6B21A8]',
    confetti: ['#6B21A8', '#A855F7', '#C4B5FD', '#EDE9FE'],
    characterImg: ariaOwl,
    characterName: 'Aria the Owl',
    greeting: 'Brilliant lesson',
  },
  professional: {
    pageGradient:
      'radial-gradient(120% 90% at 0% 0%, #D1FAE5 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, #6EE7B7 0%, transparent 55%), linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)',
    cardGlow: '0 30px 80px -20px rgba(5,150,105,0.35), 0 8px 24px -8px rgba(5,150,105,0.25)',
    ringColor: 'rgba(5,150,105,0.25)',
    accent: 'text-[#047857]',
    accentSoft: 'bg-emerald-50',
    btn: 'bg-gradient-to-r from-[#059669] to-[#34D399] hover:from-[#047857] hover:to-[#10B981] shadow-lg shadow-emerald-300/40',
    bubbleGradient: 'from-[#ECFDF5] via-[#6EE7B7] to-[#059669]',
    badgeGradient: 'from-[#34D399] via-[#10B981] to-[#059669]',
    confetti: ['#059669', '#10B981', '#6EE7B7', '#D1FAE5'],
    characterImg: maxEagle,
    characterName: 'Max the Eagle',
    greeting: 'Session complete',
  },
};

const STUDENT_PRAISE = ['Great job!', 'Amazing work!', 'You did it!', 'Super star!', "You're on fire!", 'Brilliant!'];
const TEACHER_PRAISE = ['Class wrapped!', 'Beautifully done.', 'Another one in the books.'];

const PostLessonSummary: React.FC = () => {
  const { id: bookingId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as { hub?: string; isInterview?: boolean; viewerRole?: 'teacher' | 'student'; leftEarly?: boolean } | null);
  const navHub = navState?.hub?.toLowerCase();
  const navIsInterview = navState?.isInterview === true;
  const navViewerRole = navState?.viewerRole;
  const navLeftEarly = navState?.leftEarly === true;

  const { data, isLoading } = useQuery({
    queryKey: ['post-lesson-summary', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const { data: resolvedId } = await supabase.rpc('resolve_classroom_id', { any_id: bookingId });
      // For interview rooms, resolve_classroom_id returns null (interview ids
      // aren't class_bookings). Fall back to bookingId so the interview lookup
      // still runs and we don't render the default 'academy' purple card.
      const lookupId = resolvedId ?? bookingId;

      const [{ data: booking }, { data: session }, { data: interview }, { data: incidents }, { data: verdict }, { data: leftEarlyAudit }] = await Promise.all([
        supabase
          .from('class_bookings')
          .select('id, teacher_id, student_id, scheduled_at, duration, hub_type')
          .eq('id', lookupId)
          .maybeSingle(),
        supabase
          .from('classroom_sessions')
          .select('lesson_title, lesson_id, started_at, ended_at, star_count, current_slide_index, lesson_slides')
          .eq('room_id', lookupId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('interviews')
          .select('id, hub, hub_type, scheduled_at, classroom_session_id, classroom_id, applicant_user_id, teacher_email')
          .or(`id.eq.${lookupId},classroom_session_id.eq.${lookupId},classroom_id.eq.${lookupId}`)
          .maybeSingle(),
        supabase
          .from('lesson_incident_reports')
          .select('reporter_role, outcome, flags, notes, created_at')
          .eq('room_id', lookupId)
          .order('created_at', { ascending: true }),
        supabase
          .from('classroom_incident_verdicts')
          .select('status, fault_party, confidence, summary, recommended_action')
          .eq('room_id', lookupId)
          .maybeSingle(),
        supabase
          .from('audit_logs')
          .select('action, new_values')
          .in('action', ['class_ended', 'trial_ended'])
          .eq('resource_id', lookupId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const auditLeftEarly = (leftEarlyAudit?.new_values as { left_early?: boolean } | null)?.left_early === true;

      return { booking, session, interview, incidents: incidents ?? [], verdict: verdict ?? null, lookupId, auditLeftEarly };
    },

    enabled: !!bookingId && !!user?.id,
  });



  const booking = data?.booking;
  const session = data?.session;
  const interview = data?.interview;
  const incidents = (data?.incidents ?? []) as Array<{
    reporter_role: 'teacher' | 'student';
    outcome: 'completed' | 'not_completed';
    flags: string[];
    notes: string | null;
  }>;
  const verdict = (data?.verdict ?? null) as {
    status: string;
    fault_party: 'none' | 'student' | 'teacher' | 'both' | 'platform' | 'unknown';
    confidence: number | null;
    summary: string | null;
    recommended_action: string | null;
  } | null;
  const lookupId = data?.lookupId as string | undefined;
  const isInterview = !!interview || navIsInterview;
  const isTeacher = navViewerRole === 'teacher' || (!!booking && booking?.teacher_id === user?.id);
  const leftEarly = navLeftEarly || data?.auditLeftEarly === true;

  const rawHub = (
    navHub ??
    booking?.hub_type ??
    (interview as { hub_type?: string; hub?: string } | undefined)?.hub_type ??
    interview?.hub ??
    'academy'
  )
    .toString()
    .toLowerCase();
  const hub: Hub =
    rawHub === 'playground' || rawHub === 'kids'
      ? 'playground'
      : rawHub === 'success' || rawHub === 'professional' || rawHub === 'adults'
        ? 'professional'
        : 'academy';
  const brand = HUB_BRAND[hub];

  const praise = useMemo(() => {
    const pool = isTeacher ? TEACHER_PRAISE : STUDENT_PRAISE;
    const seed = (bookingId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return pool[seed % pool.length];
  }, [bookingId, isTeacher]);

  // Stable confetti positions (don't reshuffle on re-render)
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: 6 + ((i * 7) % 10),
        rotate: (i * 47) % 360,
        color: brand.confetti[i % brand.confetti.length],
        delay: (i % 8) * 0.15,
      })),
    [brand.confetti],
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!bookingId) return <Navigate to="/dashboard" replace />;

  const startedAt = session?.started_at ? new Date(session.started_at) : null;
  const endedAt = session?.ended_at ? new Date(session.ended_at) : new Date();
  const durationMin = startedAt
    ? Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))
    : booking?.duration ?? null;

  const slidesCovered = (session?.current_slide_index ?? 0) + 1;
  const totalSlides = Array.isArray(session?.lesson_slides) ? (session?.lesson_slides as unknown[]).length : null;
  const stars = session?.star_count ?? 0;
  const dashboardPath = isTeacher
    ? '/teacher'
    : hub === 'playground'
    ? '/playground'
    : hub === 'professional'
    ? '/hub'
    : '/academy';

  const Shell: React.FC<{ children: React.ReactNode; maxW?: string }> = ({ children, maxW = 'max-w-2xl' }) => (
    <div
      className="relative min-h-dvh flex items-center justify-center p-6 overflow-hidden"
      style={{ background: brand.pageGradient }}
    >
      {/* Floating confetti backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-sm opacity-70 animate-[float_6s_ease-in-out_infinite]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(15deg); }
        }
        @keyframes bubble-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes card-rise {
          0% { transform: translateY(28px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div
        className={`relative w-full ${maxW} rounded-[2rem] bg-white/85 backdrop-blur-xl px-8 pt-28 pb-10 md:px-12 md:pt-32 md:pb-12 text-center`}
        style={{
          boxShadow: brand.cardGlow,
          border: `1px solid ${brand.ringColor}`,
          animation: 'card-rise 0.6s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Character bubble */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2" style={{ animation: 'bubble-pop 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div
            className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${brand.bubbleGradient} ring-[6px] ring-white flex items-center justify-center overflow-hidden`}
            style={{ boxShadow: brand.cardGlow }}
            aria-label={brand.characterName}
          >
            <img
              src={brand.characterImg}
              alt={brand.characterName}
              className="w-36 h-36 object-contain drop-shadow-lg select-none"
              draggable={false}
              loading="lazy"
              width={1024}
              height={1024}
            />

            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-300 drop-shadow" />
          </div>
        </div>

        {children}
      </div>
    </div>
  );

  if (isInterview) {
    return (
      <Shell maxW="max-w-xl">
        <div className="flex justify-center mb-5">
          <div
            className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r ${brand.badgeGradient} text-white text-sm font-bold shadow-md tracking-wide`}
          >
            <Sparkles className="w-4 h-4 fill-white" />
            {isTeacher ? 'Interview wrapped' : 'Thank you!'}
          </div>
        </div>
        <h1 className={`text-3xl md:text-4xl font-extrabold ${brand.accent} mb-3`}>
          {isTeacher ? 'Demo interview complete' : 'Thank you for your time'}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-md mx-auto">
          {isTeacher
            ? 'Thanks for delivering the demo. Please submit your wrap-up notes within 24 hours so our team can review the session and follow up. You can safely close this window.'
            : 'Your demo interview has ended. We appreciate the effort you put into this session — our team will be in touch with next steps soon.'}
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Praise badge */}
      <div className="flex justify-center mb-4">
        <div
          className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r ${brand.badgeGradient} text-white text-sm font-bold shadow-md tracking-wide`}
        >
          <Trophy className="w-4 h-4 fill-white" />
          {praise}
        </div>
      </div>

      {/* Header */}
      <h1 className={`text-3xl md:text-5xl font-extrabold ${brand.accent} tracking-tight`}>
        {isTeacher ? 'Class wrapped' : brand.greeting}
      </h1>
      <p className="text-base text-slate-600 mt-2">
        {session?.lesson_title || 'Your lesson'} {durationMin ? `· ${durationMin} min` : ''}
      </p>
      {!isTeacher && (
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${brand.accent} opacity-80 mt-1`}>
          with {brand.characterName}
        </p>
      )}

      {leftEarly && (
        <div className="mt-5 mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50/90 backdrop-blur px-4 py-3 text-left">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700 mb-0.5">
            Session ended early
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {isTeacher
              ? 'You ended before the core was complete — wrap-up feedback was skipped and the student\u2019s credit will be refunded automatically.'
              : 'Your class ended earlier than planned. No feedback needed — your credit has been returned to your account.'}
          </p>
        </div>
      )}


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Stat icon={<Star className="w-5 h-5" />} label="Stars earned" value={stars} accent={brand.accent} soft={brand.accentSoft} />
        <Stat
          icon={<BookOpen className="w-5 h-5" />}
          label="Slides covered"
          value={totalSlides ? `${slidesCovered} / ${totalSlides}` : slidesCovered}
          accent={brand.accent}
          soft={brand.accentSoft}
        />
        <Stat
          icon={<Clock className="w-5 h-5" />}
          label="Duration"
          value={durationMin ? `${durationMin} min` : '—'}
          accent={brand.accent}
          soft={brand.accentSoft}
        />
      </div>

      {/* Lesson notes — show the OTHER party's report only (no duplicate of your own submission) */}
      {(() => {
        const viewerRole: 'teacher' | 'student' = isTeacher ? 'teacher' : 'student';
        const otherReports = incidents.filter((r) => r.reporter_role !== viewerRole);
        if (otherReports.length === 0) return null;
        return (
          <div className="mt-7 text-left rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
              Lesson notes
            </div>
            <div className="space-y-3">
              {otherReports.map((rep, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-600">
                    {rep.reporter_role === 'teacher' ? '👩‍🏫 Teacher' : '🧒 Student'}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.outcome === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {rep.outcome === 'completed' ? 'Completed' : 'Had issues'}
                    </span>
                  </div>
                  {rep.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {rep.flags.map((f) => {
                        const meta = FLAG_META[f as IncidentFlag];
                        if (!meta) return null;
                        return (
                          <span
                            key={f}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${toneClasses(meta.tone)}`}
                          >
                            {meta.emoji} {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {rep.notes && (
                    <p className="text-xs text-slate-600 italic">"{rep.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* AI Senior Engineer verdict — classroom status stamp */}
      {verdict && (
        <div className="mt-4 text-left rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              AI verdict
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                verdict.fault_party === 'none'
                  ? 'bg-emerald-100 text-emerald-700'
                  : verdict.fault_party === 'teacher'
                  ? 'bg-purple-100 text-purple-700'
                  : verdict.fault_party === 'student'
                  ? 'bg-amber-100 text-amber-700'
                  : verdict.fault_party === 'both'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {verdict.status.replace(/_/g, ' ')} · {verdict.fault_party}
            </span>
          </div>
          {verdict.summary && (
            <p className="text-xs text-slate-700 leading-relaxed">{verdict.summary}</p>
          )}
          {verdict.recommended_action && (
            <p className="text-[11px] text-slate-500 italic mt-1">
              ➜ {verdict.recommended_action}
            </p>
          )}
        </div>
      )}



      {/* Student outcome dialog removed — handled inline in classroom wrap-up */}



      {/* Role-specific message */}
      <p className="text-sm text-slate-600 leading-relaxed mt-7 max-w-lg mx-auto">
        {isTeacher
          ? 'Take a moment to log observations and prep the next session. The student has been routed to their dashboard.'
          : `Your progress has been saved. ${brand.characterName.split(' ')[0]} can\u2019t wait to learn with you again!`}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-7">
        {isTeacher ? (
          <>
            <Button onClick={() => navigate('/teacher')} className={`${brand.btn} text-white rounded-full px-6 h-11`}>
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Back to teacher dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/schedule')} className="rounded-full px-6 h-11">
              View schedule
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => navigate(dashboardPath)} className={`${brand.btn} text-white rounded-full px-6 h-11`}>
              Continue learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/student/vault')} className="rounded-full px-6 h-11">
              Open Vocabulary Vault
            </Button>
          </>
        )}
      </div>
    </Shell>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; accent: string; soft: string }> = ({
  icon,
  label,
  value,
  accent,
  soft,
}) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${soft} mb-2 ${accent}`}>
      {icon}
    </div>
    <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-slate-500">{label}</div>
    <div className={`text-2xl font-extrabold ${accent} mt-1`}>{value}</div>
  </div>
);

export default PostLessonSummary;
