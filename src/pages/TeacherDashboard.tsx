import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherDashboardShell } from "@/components/teacher/dashboard/TeacherDashboardShell";
import { useForceEnglishLocale } from "@/hooks/useForceEnglishLocale";

const LoadingScreen = ({ label }: { label: string }) => (
  <div className="min-h-dvh flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  </div>
);

const TeacherDashboard = () => {
  useForceEnglishLocale();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const teacherName = user?.user_metadata?.full_name || user?.email || "Teacher";
  const teacherId = user?.id || "";

  useEffect(() => {
    // Wait until auth has finished loading before redirecting
    if (loading) return;

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (user.role !== "teacher") {
      if (user.role === "student") {
        navigate("/dashboard", { replace: true });
      } else if (user.role === "admin") {
        navigate("/super-admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Block render until auth is ready — prevents the dashboard from
  // briefly mounting (and showing an outdated UI) before the redirect runs.
  if (loading || !user) {
    return <LoadingScreen label="Loading..." />;
  }

  // If the role isn't teacher, the effect above is redirecting — show
  // a loader instead of mounting the dashboard for a frame.
  if (user.role !== "teacher") {
    return <LoadingScreen label="Redirecting..." />;
  }

  // Unified dashboard: ALL teachers (Playground, Academy, Success, Combined)
  // now use the Playground-style TeacherDashboardShell design.
  return <TeacherDashboardShell teacherName={teacherName} teacherId={teacherId} />;
};

export default TeacherDashboard;
