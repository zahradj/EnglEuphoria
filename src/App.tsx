import { Toaster } from "@/components/ui/toaster";
import { UnitProgressReportHost } from "@/components/student/UnitProgressReport";
import UnitProgressReportPublic from "@/pages/UnitProgressReportPublic";
import QuestLog from "@/pages/QuestLog";
import EngineLeaderboard from "@/pages/EngineLeaderboard";
import { ProfileDebugPanel } from "@/components/debug/ProfileDebugPanel";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Canonical } from "@/components/seo/Canonical";
import { AuthProvider } from "@/contexts/AuthContext";
import { LessonProvider } from "@/contexts/LessonContext";
import { ThemeModeProvider } from "@/hooks/useThemeMode";
import { ImprovedProtectedRoute } from "@/components/auth/ImprovedProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RoleThemeProvider } from "@/contexts/RoleThemeContext";
import { DictionaryProvider } from "@/components/lesson-player/DictionaryContext";
import { MarketRegionProvider } from "@/contexts/MarketRegionContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LocalePrefixSync } from "@/components/locale/LocalePrefixSync";
import { HreflangTags } from "@/components/locale/HreflangTags";
import { WrongMarketBanner } from "@/components/common/WrongMarketBanner";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
const BetaAnalytics = lazy(() => import("@/pages/admin/BetaAnalytics"));
const ScenarioOverrides = lazy(() => import("@/pages/teacher/ScenarioOverrides"));
const ScenarioMarketplace = lazy(() => import("@/pages/teacher/ScenarioMarketplace"));
const EngineCertificates = lazy(() => import("@/pages/EngineCertificates"));
const CertificatePublic = lazy(() => import("@/pages/CertificatePublic"));
const ParentQuestLog = lazy(() => import("@/pages/ParentQuestLog"));
const ParentNotifications = lazy(() => import("@/pages/parent/ParentNotifications"));
const SentinelDashboard = lazy(() => import("@/pages/admin/SentinelDashboard"));
const PlacementAudioWarmPage = lazy(() => import("@/pages/admin/PlacementAudioWarmPage"));
const SentinelIncidentReport = lazy(() => import("@/pages/admin/SentinelIncidentReport"));
const ClassroomAudits = lazy(() => import("@/pages/admin/ClassroomAudits"));
const LessonSwitchAudit = lazy(() => import("@/pages/admin/LessonSwitchAudit"));
const TrialPacingAudit = lazy(() => import("@/pages/admin/TrialPacingAudit"));
const ReviewModeration = lazy(() => import("@/pages/admin/ReviewModeration"));
const TeacherKpiDashboard = lazy(() => import("@/pages/admin/TeacherKpiDashboard"));
const TeacherKpiSelfView = lazy(() => import("@/pages/teacher/TeacherKpiSelfView"));
const KpiCardGallery = lazy(() => import("@/pages/teacher/KpiCardGallery"));
const TeacherAuraDetail = lazy(() => import("@/pages/teacher/TeacherAuraDetail"));
const BonusApprovalQueue = lazy(() => import("@/pages/admin/BonusApprovalQueue"));
const PublishQueue = lazy(() => import("@/pages/admin/PublishQueue"));
const ArcadeHome = lazy(() => import("@/pages/student/arcade/ArcadeHome"));
const AlphabetArcadeStandalone = lazy(() => import("@/pages/student/arcade/AlphabetArcadeStandalone"));
const AdventureMapPage = lazy(() => import("@/playground/pages/AdventureMapPage"));
const PlaygroundProduceHub = lazy(() => import("@/pages/PlaygroundProduceHub"));
const ProduceL1 = lazy(() => import("@/routes/playground.produce-l1"));
const ProduceL2 = lazy(() => import("@/routes/playground.produce-l2"));
const ProduceL3 = lazy(() => import("@/routes/playground.produce-l3"));
const ProduceL4 = lazy(() => import("@/routes/playground.produce-l4"));
const ProduceL5 = lazy(() => import("@/routes/playground.produce-l5"));
const ProduceQuiz = lazy(() => import("@/routes/playground.produce-quiz"));
const ProducePractice = lazy(() => import("@/routes/playground.produce-practice"));
const PolymorphicLesson = lazy(() => import("@/pages/PlaygroundPolymorphicLesson"));
const PolymorphicReview = lazy(() => import("@/pages/PlaygroundPolymorphicReview"));
const PolymorphicQuiz = lazy(() => import("@/pages/PlaygroundPolymorphicQuiz"));
const PolymorphicPractice = lazy(() => import("@/pages/PlaygroundPolymorphicPractice"));
const PlaygroundOcean = lazy(() => import("@/routes/playground.ocean"));
import { SentinelErrorBoundary } from "@/components/reliability/SentinelErrorBoundary";
import ScrollToTop from "@/components/common/ScrollToTop";

// Only the landing page is eagerly loaded (entry point)
import LandingPage from "./pages/LandingPage";
import { HomeGate } from "./components/auth/HomeGate";


// All other pages are lazy-loaded for bundle optimization
const AboutPage = lazy(() => import("./pages/AboutPage"));
const MethodologyPage = lazy(() => import("./pages/Methodology"));
const ActivityCatalogPage = lazy(() => import("./pages/ActivityCatalogPage"));
const CastChatQuest = lazy(() => import("./pages/CastChatQuest"));
const ForTeachersPage = lazy(() => import("./pages/ForTeachersPage"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MarketingDashboard = lazy(() => import("./pages/MarketingDashboard"));
const MarketingAgentPage = lazy(() => import("./pages/marketing-agent/MarketingAgentPage"));
const MarketingAgentAutomationsPage = lazy(() => import("./pages/marketing-agent/AutomationsPage"));
const TemplateMarketplace = lazy(() => import("./pages/TemplateMarketplace"));
const StudentSignUp = lazy(() => import("./pages/StudentSignUp"));
const StudentApplication = lazy(() => import("./pages/StudentApplication"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StudentOnboardingFlow = lazy(() => import("./components/onboarding/StudentOnboardingFlow"));
const MyPathPage = lazy(() => import("./pages/MyPathPage"));
const CurriculumMapPage = lazy(() => import("./pages/CurriculumMapPage"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const TeacherClassroomPage = lazy(() => import("./pages/TeacherClassroomPage"));
const TeacherControlPanelPage = lazy(() => import("./pages/TeacherControlPanelPage"));
const AIPlacementTest = lazy(() => import("./components/placement/AIPlacementTest"));
const PlaygroundTest = lazy(() => import("./components/placement/PlaygroundTest"));
const AcademyTest = lazy(() => import("./components/placement/AcademyTest"));
const SuccessTest = lazy(() => import("./components/placement/SuccessTest"));
const PracticeRoom = lazy(() => import("./pages/PracticeRoom"));
const StudentClassroomPage = lazy(() => import("./pages/StudentClassroomPage"));
const UnifiedClassroomPage = lazy(() => import("./pages/UnifiedClassroomPage"));
const VocabularyRoomPage = lazy(() => import("./pages/dashboard/VocabularyRoomPage"));
const SpeakingStudioPage = lazy(() => import("./pages/dashboard/SpeakingStudioPage"));
const GradedLibraryPage = lazy(() => import("./pages/dashboard/GradedLibraryPage"));
const GamesHubPage = lazy(() => import("./pages/dashboard/GamesHubPage"));
const DailyPlayPage = lazy(() => import("./pages/dashboard/DailyPlayPage"));
const PostLessonSummary = lazy(() => import("./pages/PostLessonSummary"));
const AssessmentTaker = lazy(() => import("./components/assessment/AssessmentTaker"));
const AssessmentResults = lazy(() => import("./components/assessment/AssessmentResults"));
const CreatorStudioShell = lazy(() => import("./components/creator-studio/CreatorStudioShell"));
const LessonReaderPage = lazy(() => import("./pages/student/LessonReaderPage"));
const LessonLibraryPage = lazy(() => import("./pages/student/LessonLibraryPage"));
const StudentLibrary = lazy(() => import("./pages/StudentLibrary"));
const StorybookReader = lazy(() => import("./pages/StorybookReader"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const FindTeacher = lazy(() => import("./pages/student/FindTeacher"));
const InterviewMagicEntry = lazy(() => import("./pages/InterviewMagicEntry"));
const GrammarTest = lazy(() => import("./pages/teacher/GrammarTest"));
const GrammarTestResult = lazy(() => import("./pages/teacher/GrammarTestResult"));
const InterviewScheduler = lazy(() => import("./pages/teacher/InterviewScheduler"));
const SetPassword = lazy(() => import("./pages/SetPassword"));
const TermsOfServicePage = lazy(() => import("./pages/legal/TermsOfServicePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/legal/PrivacyPolicyPage"));
const RefundPolicyPage = lazy(() => import("./pages/legal/RefundPolicyPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const HubConfirmation = lazy(() => import("./pages/HubConfirmation"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const StudentCertificatePage = lazy(() => import("./pages/StudentCertificatePage"));
const HomeworkPage = lazy(() => import("./pages/student/HomeworkPage"));
const PlaygroundDemo = lazy(() => import("./pages/PlaygroundLessonRedirect"));
const PlaygroundLessonShare = lazy(() => import("./pages/PlaygroundLessonShare"));
const AcademyDemo = lazy(() => import("./pages/AcademyLessonRedirect"));
const SuccessDemo = lazy(() => import("./pages/SuccessLessonRedirect"));
const PlaygroundCreator = lazy(() => import("./pages/PlaygroundCreator"));
const PlayScenesLessonPage = lazy(() => import("./pages/playground-scene/PlayScenesLessonPage"));
const PlayLesson1 = lazy(() => import("./pages/playground-scene/PlayLesson1"));
const PlaygroundGameRunner = lazy(() => import("./pages/PlaygroundGameRunner"));
const AcademyClassroom = lazy(() => import("./pages/AcademyClassroom"));
const AcademyCreator = lazy(() => import("./pages/AcademyCreator"));
const SuccessCreator = lazy(() => import("./pages/SuccessCreator"));
const DevConsole = lazy(() => import("./pages/DevConsole"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-dvh flex items-center justify-center p-4">
    <div className="text-center space-y-4">
      <Skeleton className="h-12 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="h-32 w-full max-w-md mx-auto" />
    </div>
  </div>
);

// Academy hub gets a sleek, mascot-free branded loader.
const AcademyLoader = lazy(() => import('@/components/academy/AcademyLoader'));
const AcademyLoadingFallback = () => (
  <Suspense fallback={null}>
    <AcademyLoader />
  </Suspense>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
      <ThemeModeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MarketRegionProvider>
          <LessonProvider>
            <RoleThemeProvider>
              <DictionaryProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <UnitProgressReportHost />
                <BrowserRouter>
                  <ScrollToTop />
                  <LocaleProvider>
                  <CurrencyProvider>
                  <AppErrorBoundary>
                    <SentinelErrorBoundary>
                    <Canonical />
                    <HreflangTags />
                    <Routes>
                      {/* Regional URL prefixes — persist choice then strip */}
                      <Route path="/tr/*" element={<LocalePrefixSync region="TR" />} />
                      <Route path="/es/*" element={<LocalePrefixSync region="ES" />} />
                      <Route path="/fr/*" element={<LocalePrefixSync region="FR" />} />
                      <Route path="/ar/*" element={<LocalePrefixSync region="AR" />} />
                      <Route path="/dz/*" element={<LocalePrefixSync region="DZ" />} />


                      {/* Public Entry Point - Landing Page */}
                      <Route path="/" element={<HomeGateWrapper />} />
                      <Route path="/about" element={<Suspense fallback={<LoadingFallback />}><AboutPage /></Suspense>} />
                     <Route path="/methodology" element={<Suspense fallback={<LoadingFallback />}><MethodologyPage /></Suspense>} />
                     <Route path="/activity-catalog" element={<Suspense fallback={<LoadingFallback />}><ActivityCatalogPage /></Suspense>} />
                     <Route path="/games/cast-chat-quest" element={<Suspense fallback={<LoadingFallback />}><CastChatQuest /></Suspense>} />

                      <Route path="/playground-demo" element={<Suspense fallback={<LoadingFallback />}><PlaygroundDemo /></Suspense>} />
                      <Route path="/lesson/:lessonId" element={<Suspense fallback={<LoadingFallback />}><PlaygroundLessonShare /></Suspense>} />
                     <Route path="/academy-demo" element={<Suspense fallback={<AcademyLoadingFallback />}><AcademyDemo /></Suspense>} />
                     <Route path="/success-demo" element={<Suspense fallback={<LoadingFallback />}><SuccessDemo /></Suspense>} />
                      <Route path="/playground-creator" element={
                        <ImprovedProtectedRoute requiredRole={["content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><PlaygroundCreator /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* Playground Library — scene-format lessons (Little Explorers Phonics style). */}
                      <Route path="/playground-scene/play/:lessonId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayScenesLessonPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayLesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/play/:lessonId" element={<Suspense fallback={<LoadingFallback />}><PlaygroundGameRunner /></Suspense>} />
                      <Route path="/play" element={<Suspense fallback={<LoadingFallback />}><PlaygroundGameRunner /></Suspense>} />
                      <Route path="/academy-classroom" element={<Suspense fallback={<AcademyLoadingFallback />}><AcademyClassroom /></Suspense>} />
                      <Route path="/academy-creator" element={
                        <ImprovedProtectedRoute requiredRole={["content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><AcademyCreator /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/success-creator" element={
                        <ImprovedProtectedRoute requiredRole={["content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><SuccessCreator /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/dashboard/success-creator" element={
                        <ImprovedProtectedRoute requiredRole={["content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><SuccessCreator /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/teach-with-us" element={<Navigate to="/for-teachers" replace />} />
                      <Route path="/teach-with-us/grammar-test" element={<Suspense fallback={<LoadingFallback />}><GrammarTest /></Suspense>} />
                      <Route path="/teach-with-us/grammar-test/result" element={<Suspense fallback={<LoadingFallback />}><GrammarTestResult /></Suspense>} />
                      <Route path="/teacher/interview/schedule/:token" element={<Suspense fallback={<LoadingFallback />}><InterviewScheduler /></Suspense>} />
                      <Route path="/teacher/scenario-overrides" element={
                        <ImprovedProtectedRoute requiredRole="teacher">
                          <Suspense fallback={<LoadingFallback />}><ScenarioOverrides /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/interview-classroom/:interviewId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><UnifiedClassroomPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/for-teachers" element={<Suspense fallback={<LoadingFallback />}><ForTeachersPage /></Suspense>} />
                      <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
                      <Route path="/signup" element={<Navigate to="/student-signup" replace />} />
                      <Route path="/teacher-signup" element={<Navigate to="/for-teachers" replace />} />
                      <Route path="/student-signup" element={<Suspense fallback={<LoadingFallback />}><StudentSignUp /></Suspense>} />
                      <Route path="/teacher-application" element={<Navigate to="/for-teachers" replace />} />
                      <Route path="/student-application" element={<Suspense fallback={<LoadingFallback />}><StudentApplication /></Suspense>} />
                      <Route path="/email-verification" element={<Suspense fallback={<LoadingFallback />}><EmailVerification /></Suspense>} />
                      <Route path="/reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
                      <Route path="/set-password" element={<Suspense fallback={<LoadingFallback />}><SetPassword /></Suspense>} />
                      <Route path="/unsubscribe" element={<Suspense fallback={<LoadingFallback />}><UnsubscribePage /></Suspense>} />

                      {/* Legal Pages — Required for Paddle Merchant of Record */}
                      <Route path="/terms-of-service" element={<Suspense fallback={<LoadingFallback />}><TermsOfServicePage /></Suspense>} />
                      <Route path="/privacy-policy" element={<Suspense fallback={<LoadingFallback />}><PrivacyPolicyPage /></Suspense>} />
                      <Route path="/refund-policy" element={<Suspense fallback={<LoadingFallback />}><RefundPolicyPage /></Suspense>} />

                      {/* PWA install instructions */}
                      <Route path="/install" element={<Suspense fallback={<LoadingFallback />}><InstallPage /></Suspense>} />

                      {/* Storybook Library + Reader */}
                      <Route path="/library" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><StudentLibrary /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/library/:bookId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><StorybookReader /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/storybook/viewer/:bookId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><StorybookReader /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Internal Dev Console — Admin only */}
                      <Route path="/dev-console" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><DevConsole /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Beta Testing & Analytics — Admin only */}
                      <Route path="/admin/beta-analytics" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><BetaAnalytics /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Sentinel-1 Reliability — Admin only */}
                      <Route path="/admin/sentinel" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><SentinelDashboard /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/system-health/report/:id" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><SentinelIncidentReport /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/classroom-audits" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><ClassroomAudits /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/audit/lesson-switches" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><LessonSwitchAudit /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/trial-pacing" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><TrialPacingAudit /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/review-moderation" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><ReviewModeration /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/teacher-kpi" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><TeacherKpiDashboard /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/teacher/kpi" element={
                        <ImprovedProtectedRoute requiredRole="teacher">
                          <Suspense fallback={<LoadingFallback />}><TeacherKpiSelfView /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/teacher/kpi-gallery" element={
                        <Suspense fallback={<LoadingFallback />}><KpiCardGallery /></Suspense>
                      } />
                      <Route path="/teacher/aura" element={
                        <ImprovedProtectedRoute requiredRole="teacher">
                          <Suspense fallback={<LoadingFallback />}><TeacherAuraDetail /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/bonus-queue" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><BonusApprovalQueue /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/publish-queue" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><PublishQueue /></Suspense>
                        </ImprovedProtectedRoute>
                      } />




                      {/* Certificate Viewer — Protected */}
                      <Route path="/certificate/:id" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><StudentCertificatePage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Assessment Routes */}
                      <Route path="/assessment/:assessmentId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><AssessmentTaker /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/assessment-results/:submissionId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><AssessmentResults /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Interactive Homework Player */}
                      <Route path="/homework/:assignmentId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><HomeworkPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground/map" element={
                        <Suspense fallback={<LoadingFallback />}><AdventureMapPage /></Suspense>
                      } />
                      <Route path="/playground/*" element={
                        <Navigate to="/dashboard/playground" replace />
                      } />
                      <Route path="/academy/*" element={
                        <Navigate to="/dashboard/academy" replace />
                      } />
                      <Route path="/hub/*" element={
                        <Navigate to="/dashboard/hub" replace />
                      } />
                      <Route path="/dashboard/playground/*" element={
                        <ImprovedProtectedRoute requiredRole="student" requiredStudentLevel="playground">
                          <Suspense fallback={<LoadingFallback />}><StudentDashboard /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/dashboard/academy/*" element={
                        <ImprovedProtectedRoute requiredRole="student" requiredStudentLevel="academy">
                          <Suspense fallback={<LoadingFallback />}><StudentDashboard /></Suspense>
                      </ImprovedProtectedRoute>
                      } />

                      {/* Cycle 2 — Adaptive Dashboard rooms */}
                      <Route path="/dashboard/vocabulary" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><VocabularyRoomPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/dashboard/speaking" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><SpeakingStudioPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/dashboard/library" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><GradedLibraryPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/dashboard/games" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><GamesHubPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/dashboard/play" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><DailyPlayPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/arcade/alphabet" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><AlphabetArcadeStandalone /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/arcade/*" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><ArcadeHome /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      <Route path="/dashboard/hub/*" element={
                        <ImprovedProtectedRoute requiredRole="student" requiredStudentLevel="professional">
                          <Suspense fallback={<LoadingFallback />}><StudentDashboard /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      
                      {/* Find Teacher - Student Protected */}
                      <Route path="/find-teacher" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><FindTeacher /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      
                      {/* Teacher Dashboard - Protected */}
                      <Route path="/teacher/*" element={
                        <ImprovedProtectedRoute requiredRole="teacher">
                          <AppErrorBoundary>
                            <Suspense fallback={<LoadingFallback />}><TeacherDashboard /></Suspense>
                          </AppErrorBoundary>
                        </ImprovedProtectedRoute>
                      } />
                      
                      {/* Unified Live Classroom - Any authenticated user, access validated inside */}
                      <Route path="/classroom/:id" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <UnifiedClassroomPage />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Teacher-only asymmetric control panel for a live session */}
                      <Route path="/classroom/:id/teacher-panel" element={
                        <ImprovedProtectedRoute requiredRole="teacher">
                          <Suspense fallback={<LoadingFallback />}>
                            <TeacherControlPanelPage />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />


                      {/* Post-Lesson Summary — shared landing for teacher + student after End Class */}
                      <Route path="/classroom/:id/summary" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <PostLessonSummary />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Real-Time Live Classroom routes now use the same production unified hub classroom. */}
                      <Route path="/live-classroom/:sessionId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <UnifiedClassroomPage />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* Alias for the realtime room (per Cycle 3 spec) */}
                      <Route path="/classroom/live/:roomId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <UnifiedClassroomPage />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* Legacy student-classroom route redirects to unified */}
                      <Route path="/student-classroom/:id" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <UnifiedClassroomPage />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Demo Classroom - No Auth Required */}
                      <Route path="/demo-classroom/:id" element={
                        <Suspense fallback={<LoadingFallback />}>
                          <TeacherClassroomPage />
                        </Suspense>
                      } />

                      {/* Interview magic-link entry — public (no password screen).
                          Bootstraps a guest session, then redirects to the unified classroom. */}
                      <Route path="/interview/:token" element={
                        <Suspense fallback={<LoadingFallback />}>
                          <InterviewMagicEntry />
                        </Suspense>
                      } />


                      {/* Interview Arena - same production unified hub classroom. */}
                      <Route path="/interview-arena/:interviewId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <UnifiedClassroomPage />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Super Admin Dashboard - Protected */}
                      <Route path="/super-admin/*" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Marketing Dashboard - Protected (marketing OR admin) */}
                      <Route path="/marketing/*" element={
                        <ImprovedProtectedRoute requiredRole={["marketing", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><MarketingDashboard /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Marketing AI Agent - chat + automations */}
                      <Route path="/marketing-agent/automations" element={
                        <ImprovedProtectedRoute requiredRole={["admin", "marketing", "content_creator"]}>
                          <Suspense fallback={<LoadingFallback />}><MarketingAgentAutomationsPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/marketing-agent/:threadId?" element={
                        <ImprovedProtectedRoute requiredRole={["admin", "marketing", "content_creator"]}>
                          <Suspense fallback={<LoadingFallback />}><MarketingAgentPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />


                      {/* Admin — Placement Audio Cache Warmer */}
                      <Route path="/admin/placement-audio" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><PlacementAudioWarmPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />


                      {/* Content Creator — Unified Studio Shell (full-screen workspace) */}
                      <Route path="/content-creator/*" element={
                        <ImprovedProtectedRoute requiredRole={["content_creator", "admin"]}>
                          <AppErrorBoundary>
                            <Suspense fallback={<LoadingFallback />}>
                              <CreatorStudioShell />
                            </Suspense>
                          </AppErrorBoundary>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Legacy admin route → moved into the Content Creator dashboard */}
                      <Route
                        path="/admin/placement-audio"
                        element={<Navigate to="/content-creator/placement-assets" replace />}
                      />

                      {/* Lesson Template Marketplace — any authenticated creator/teacher/admin */}
                      <Route path="/template-marketplace" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <TemplateMarketplace />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Parent Dashboard - Protected */}
                      <Route path="/parent/*" element={
                        <ImprovedProtectedRoute requiredRole="parent">
                          <Suspense fallback={<LoadingFallback />}>
                            <ParentDashboard />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Community Page - Any Authenticated User */}
                      <Route path="/community/*" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <CommunityPage />
                          </Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Smart Dashboard Router - redirects based on role */}
                      <Route path="/dashboard" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Legacy onboarding entry points — placement now happens inline via
                          PlacementGatekeeper (chat-style TestPhase) the moment a student hits
                          their hub dashboard, so these just forward to /dashboard. */}
                      <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/onboarding/start" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/onboarding/placement" element={<Navigate to="/dashboard" replace />} />
                      {/* Practice Room — FSRS warm-up surface, hub-aware */}
                      <Route path="/practice" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><PracticeRoom /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground/practice" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><PracticeRoom /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* Playground Produce Unit — public lesson routes */}
                      <Route path="/playground/produce" element={<Suspense fallback={<LoadingFallback />}><PlaygroundProduceHub /></Suspense>} />
                      <Route path="/playground/produce-l1" element={<Suspense fallback={<LoadingFallback />}><ProduceL1 /></Suspense>} />
                      <Route path="/playground/produce-l2" element={<Suspense fallback={<LoadingFallback />}><ProduceL2 /></Suspense>} />
                      <Route path="/playground/produce-l3" element={<Suspense fallback={<LoadingFallback />}><ProduceL3 /></Suspense>} />
                      <Route path="/playground/produce-l4" element={<Suspense fallback={<LoadingFallback />}><ProduceL4 /></Suspense>} />
                      <Route path="/playground/produce-l5" element={<Suspense fallback={<LoadingFallback />}><ProduceL5 /></Suspense>} />
                      <Route path="/playground/produce-quiz" element={<Suspense fallback={<LoadingFallback />}><ProduceQuiz /></Suspense>} />
                      <Route path="/playground/produce-practice" element={<Suspense fallback={<LoadingFallback />}><ProducePractice /></Suspense>} />
                      <Route path="/playground/ocean" element={<Suspense fallback={<LoadingFallback />}><PlaygroundOcean /></Suspense>} />
                      <Route path="/playground/:unitId/review" element={<Suspense fallback={<LoadingFallback />}><PolymorphicReview /></Suspense>} />
                      <Route path="/playground/:unitId/quiz" element={<Suspense fallback={<LoadingFallback />}><PolymorphicQuiz /></Suspense>} />
                      <Route path="/playground/:unitId/practice" element={<Suspense fallback={<LoadingFallback />}><PolymorphicPractice /></Suspense>} />
                      <Route path="/playground/:unitId/:lessonId" element={<Suspense fallback={<LoadingFallback />}><PolymorphicLesson /></Suspense>} />
                      <Route path="/academy/practice" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><PracticeRoom /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/hub/practice" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><PracticeRoom /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/onboarding-legacy" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><StudentOnboardingFlow /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* My Path — branded reveal page after placement test */}
                      <Route path="/dashboard/my-path" element={
                        <Suspense fallback={<LoadingFallback />}><MyPathPage /></Suspense>
                      } />

                      {/* Curriculum Map — linear unit/lesson nodes with dynamic Bonus Quest branches */}
                      <Route path="/dashboard/map" element={
                        <Suspense fallback={<LoadingFallback />}><CurriculumMapPage /></Suspense>
                      } />

                      {/* Settings shortcut — opens the dashboard with the profile tab focused */}
                      <Route path="/dashboard/settings" element={<Navigate to="/dashboard?tab=profile" replace />} />

                      {/* Hub Confirmation — post-signup step */}
                      <Route path="/hub-confirmation" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><HubConfirmation /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Legacy placement entry points — redirect to the dashboard, which
                          triggers PlacementGatekeeper inline if placement isn't complete. */}
                      <Route path="/ai-placement-test" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/placement-test" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/placement-test-2" element={<Navigate to="/dashboard" replace />} />


                      {/* Three Isolated Hub Funnels — strict age-bracket routing */}
                      <Route path="/placement/playground" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><PlaygroundTest /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/placement/academy" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><AcademyTest /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/placement/success" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><SuccessTest /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* Lesson Library */}
                      <Route path="/library" element={
                        <Suspense fallback={<LoadingFallback />}>
                          <LessonLibraryPage />
                        </Suspense>
                      } />

                      {/* Immersive Lesson Reader / App-Shell Player */}
                      <Route path="/lesson/:id" element={
                        <Suspense fallback={<LoadingFallback />}>
                          <LessonReaderPage />
                        </Suspense>
                      } />

                      {/* Auth callback for email confirmation */}
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/reports/:token" element={<UnitProgressReportPublic />} />
                      <Route path="/quest-log" element={<QuestLog />} />
                      <Route path="/engine-leaderboard" element={<EngineLeaderboard />} />
                      <Route path="/certificates" element={<Suspense fallback={<LoadingFallback />}><EngineCertificates /></Suspense>} />
                      <Route path="/engine-certificate/:token" element={<Suspense fallback={<LoadingFallback />}><CertificatePublic /></Suspense>} />
                      <Route path="/parent/quest-log/:studentId" element={<Suspense fallback={<LoadingFallback />}><ParentQuestLog /></Suspense>} />
                      <Route path="/parent/notifications" element={<Suspense fallback={<LoadingFallback />}><ParentNotifications /></Suspense>} />
                      <Route path="/teacher/scenario-marketplace" element={
                        <ImprovedProtectedRoute requiredRole="teacher">
                          <Suspense fallback={<LoadingFallback />}><ScenarioMarketplace /></Suspense>
                        </ImprovedProtectedRoute>
                      } />


                      {/* Legacy routes — route to /dashboard so the smart
                          router can resolve the user's true role. NEVER hard
                          redirect to /playground or /teacher from here. */}
                      <Route path="/student/*" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/admin/*" element={<Navigate to="/super-admin" replace />} />
                      <Route path="/admin-dashboard" element={<Navigate to="/super-admin" replace />} />

                      {/* 404 - Redirect to Login */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <ProfileDebugPanel />
                  </SentinelErrorBoundary>
                  </AppErrorBoundary>
                  </CurrencyProvider>
                  </LocaleProvider>
                </BrowserRouter>
              </TooltipProvider>
              </DictionaryProvider>
            </RoleThemeProvider>
          </LessonProvider>
          </MarketRegionProvider>
        </AuthProvider>
      </LanguageProvider>
      </ThemeModeProvider>
      </HelmetProvider>

    </QueryClientProvider>
  );
};

const HomeGateWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <HomeGate />
  </Suspense>
);

export default App;
