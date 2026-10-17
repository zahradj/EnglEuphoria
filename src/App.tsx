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
import { FamilySwitchButton } from "@/components/family/FamilySwitchButton";
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
const TeacherScorecards = lazy(() => import("@/pages/admin/TeacherScorecards"));
const TeacherKpiSelfView = lazy(() => import("@/pages/teacher/TeacherKpiSelfView"));
const HowWeMeasure = lazy(() => import("@/pages/teacher/HowWeMeasure"));
const KpiCardGallery = lazy(() => import("@/pages/teacher/KpiCardGallery"));
const TeacherAuraDetail = lazy(() => import("@/pages/teacher/TeacherAuraDetail"));
const BonusApprovalQueue = lazy(() => import("@/pages/admin/BonusApprovalQueue"));
const PublishQueue = lazy(() => import("@/pages/admin/PublishQueue"));
const PlaygroundLessonBuilder = lazy(() => import("@/pages/admin/PlaygroundLessonBuilder"));
const VideoBriefs = lazy(() => import("@/pages/admin/VideoBriefs"));
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
import UnknownRouteReload from "./components/routing/UnknownRouteReload";


// All other pages are lazy-loaded for bundle optimization
const AboutPage = lazy(() => import("./pages/AboutPage"));
const MethodologyPage = lazy(() => import("./pages/Methodology"));
const ActivityCatalogPage = lazy(() => import("./pages/ActivityCatalogPage"));
const GamesPreview = lazy(() => import("./pages/GamesPreview"));
const PlaygroundGamePage = lazy(() => import("./pages/playground-library/PlaygroundGamePage"));
const StudentGamesPage = lazy(() => import("./pages/student/StudentGamesPage"));
const CastChatQuest = lazy(() => import("./pages/CastChatQuest"));
const ForTeachersPage = lazy(() => import("./pages/ForTeachersPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
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
const ParentSignUp = lazy(() => import("./pages/ParentSignUp"));
const ParentLessons = lazy(() => import("./pages/ParentLessons"));
const WhoIsLearning = lazy(() => import("./pages/WhoIsLearning"));
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
const KidsPlacementPreview = lazy(() => import("./pages/preview/KidsPlacementPreview"));
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
const JoinClassroomPage = lazy(() => import("./pages/JoinClassroomPage"));
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
const SuccessDemo = lazy(() => import("./pages/SuccessLessonRedirect"));
const PlayScenesLessonPage = lazy(() => import("./pages/playground-scene/PlayScenesLessonPage"));
const PlayLesson1 = lazy(() => import("./pages/playground-scene/PlayLesson1"));
const PlayLesson2 = lazy(() => import("./pages/playground-scene/PlayLesson2"));
const PlayLesson3 = lazy(() => import("./pages/playground-scene/PlayLesson3"));
const PlayLesson4 = lazy(() => import("./pages/playground-scene/PlayLesson4"));
const PlayLesson5 = lazy(() => import("./pages/playground-scene/PlayLesson5"));
const PlayLesson6 = lazy(() => import("./pages/playground-scene/PlayLesson6"));
const PlayUnit2Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit2Lesson1"));
const PlayUnit2Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit2Lesson2"));
const PlayUnit2Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit2Lesson3"));
const PlayUnit2Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit2Lesson4"));
const PlayUnit2Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit2Lesson5"));
const PlayUnit2Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit2Lesson6"));
const PlayUnit3Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit3Lesson1"));
const PlayUnit3Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit3Lesson2"));
const PlayUnit3Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit3Lesson3"));
const PlayUnit3Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit3Lesson4"));
const PlayUnit3Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit3Lesson5"));
const PlayUnit3Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit3Lesson6"));
const PlayUnit4Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit4Lesson1"));
const PlayUnit4Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit4Lesson2"));
const PlayUnit4Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit4Lesson3"));
const PlayUnit4Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit4Lesson4"));
const PlayUnit4Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit4Lesson5"));
const PlayUnit4Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit4Lesson6"));
const PlayUnit5Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit5Lesson1"));
const PlayUnit5Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit5Lesson2"));
const PlayUnit5Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit5Lesson3"));
const PlayUnit5Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit5Lesson4"));
const PlayUnit5Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit5Lesson5"));
const PlayUnit5Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit5Lesson6"));
const PlayUnit6Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit6Lesson1"));
const PlayUnit6Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit6Lesson2"));
const PlayUnit6Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit6Lesson3"));
const PlayUnit6Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit6Lesson4"));
const PlayUnit6Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit6Lesson5"));
const PlayUnit6Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit6Lesson6"));
const PlayUnit7Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit7Lesson1"));
const PlayUnit7Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit7Lesson2"));
const PlayUnit7Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit7Lesson3"));
const PlayUnit7Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit7Lesson4"));
const PlayUnit7Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit7Lesson5"));
const PlayUnit7Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit7Lesson6"));
const PlayUnit8Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit8Lesson1"));
const PlayUnit8Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit8Lesson2"));
const PlayUnit8Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit8Lesson3"));
const PlayUnit8Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit8Lesson4"));
const PlayUnit8Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit8Lesson5"));
const PlayUnit8Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit8Lesson6"));
const PlayUnit9Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit9Lesson1"));
const PlayUnit9Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit9Lesson2"));
const PlayUnit9Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit9Lesson3"));
const PlayUnit9Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit9Lesson4"));
const PlayUnit9Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit9Lesson5"));
const PlayUnit9Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit9Lesson6"));
const PlayUnit10Lesson1 = lazy(() => import("./pages/playground-scene/PlayUnit10Lesson1"));
const PlayUnit10Lesson2 = lazy(() => import("./pages/playground-scene/PlayUnit10Lesson2"));
const PlayUnit10Lesson3 = lazy(() => import("./pages/playground-scene/PlayUnit10Lesson3"));
const PlayUnit10Lesson4 = lazy(() => import("./pages/playground-scene/PlayUnit10Lesson4"));
const PlayUnit10Lesson5 = lazy(() => import("./pages/playground-scene/PlayUnit10Lesson5"));
const PlayUnit10Lesson6 = lazy(() => import("./pages/playground-scene/PlayUnit10Lesson6"));
const PlayUnit10Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit10Lesson7"));
const PlayUnit10Lesson8 = lazy(() => import("./pages/playground-scene/PlayUnit10Lesson8"));
const PlayUnit5Lesson8 = lazy(() => import("./pages/playground-scene/PlayUnit5Lesson8"));
const PlayUnit1Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit1Lesson7"));
const PlayUnit2Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit2Lesson7"));
const PlayUnit3Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit3Lesson7"));
const PlayUnit4Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit4Lesson7"));
const PlayUnit5Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit5Lesson7"));
const PlayUnit6Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit6Lesson7"));
const PlayUnit7Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit7Lesson7"));
const PlayUnit8Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit8Lesson7"));
const PlayUnit9Lesson7 = lazy(() => import("./pages/playground-scene/PlayUnit9Lesson7"));
const PlayWelcomeTown1 = lazy(() => import("./pages/playground-scene/PlayWelcomeTown1"));
const PlayWelcomeTown2 = lazy(() => import("./pages/playground-scene/PlayWelcomeTown2"));
const PlayWelcomeTown3 = lazy(() => import("./pages/playground-scene/PlayWelcomeTown3"));
const PlayWelcomeTown4 = lazy(() => import("./pages/playground-scene/PlayWelcomeTown4"));
const PlayWelcomeTown5 = lazy(() => import("./pages/playground-scene/PlayWelcomeTown5"));
const PlayWelcomeTown6 = lazy(() => import("./pages/playground-scene/PlayWelcomeTown6"));
const PlayWelcomeTown7 = lazy(() => import("./pages/playground-scene/PlayWelcomeTown7"));
const PlayJungleLesson1 = lazy(() => import("./pages/playground-scene/PlayJungleLesson1"));
const PlayJungleLesson2 = lazy(() => import("./pages/playground-scene/PlayJungleLesson2"));
const PlayJungleLesson3 = lazy(() => import("./pages/playground-scene/PlayJungleLesson3"));
const PlayJungleLesson4 = lazy(() => import("./pages/playground-scene/PlayJungleLesson4"));
const PlayJungleLesson5 = lazy(() => import("./pages/playground-scene/PlayJungleLesson5"));
const PlayJungleLesson6 = lazy(() => import("./pages/playground-scene/PlayJungleLesson6"));
const PlayJungleLesson7 = lazy(() => import("./pages/playground-scene/PlayJungleLesson7"));
const PlaySpaceLesson1 = lazy(() => import("./pages/playground-scene/PlaySpaceLesson1"));
const PlaySpaceLesson2 = lazy(() => import("./pages/playground-scene/PlaySpaceLesson2"));
const PlaySpaceLesson3 = lazy(() => import("./pages/playground-scene/PlaySpaceLesson3"));
const PlaySpaceLesson4 = lazy(() => import("./pages/playground-scene/PlaySpaceLesson4"));
const PlaySpaceLesson5 = lazy(() => import("./pages/playground-scene/PlaySpaceLesson5"));
const PlaySpaceLesson6 = lazy(() => import("./pages/playground-scene/PlaySpaceLesson6"));
const PlaySpaceLesson7 = lazy(() => import("./pages/playground-scene/PlaySpaceLesson7"));
const PlayFoodLesson1 = lazy(() => import("./pages/playground-scene/PlayFoodLesson1"));
const PlayFoodLesson2 = lazy(() => import("./pages/playground-scene/PlayFoodLesson2"));
const PlayFoodLesson3 = lazy(() => import("./pages/playground-scene/PlayFoodLesson3"));
const PlayFoodLesson4 = lazy(() => import("./pages/playground-scene/PlayFoodLesson4"));
const PlayFoodLesson5 = lazy(() => import("./pages/playground-scene/PlayFoodLesson5"));
const PlayFoodLesson6 = lazy(() => import("./pages/playground-scene/PlayFoodLesson6"));
const PlayFoodLesson7 = lazy(() => import("./pages/playground-scene/PlayFoodLesson7"));
const PlayMonsterLesson1 = lazy(() => import("./pages/playground-scene/PlayMonsterLesson1"));
const PlayOceanLesson1 = lazy(() => import("./pages/playground-scene/PlayOceanLesson1"));
const PlayHeroLesson1 = lazy(() => import("./pages/playground-scene/PlayHeroLesson1"));
const PlayHeroLesson2 = lazy(() => import("./pages/playground-scene/PlayHeroLesson2"));
const PlayHeroLesson3 = lazy(() => import("./pages/playground-scene/PlayHeroLesson3"));
const PlayOceanLesson2 = lazy(() => import("./pages/playground-scene/PlayOceanLesson2"));
const PlayOceanLesson3 = lazy(() => import("./pages/playground-scene/PlayOceanLesson3"));
const PlayOceanLesson4 = lazy(() => import("./pages/playground-scene/PlayOceanLesson4"));
const PlayOceanLesson5 = lazy(() => import("./pages/playground-scene/PlayOceanLesson5"));
const PlayOceanLesson6 = lazy(() => import("./pages/playground-scene/PlayOceanLesson6"));
const PlayOceanLesson7 = lazy(() => import("./pages/playground-scene/PlayOceanLesson7"));
const PlayMonsterLesson2 = lazy(() => import("./pages/playground-scene/PlayMonsterLesson2"));
const PlayMonsterLesson3 = lazy(() => import("./pages/playground-scene/PlayMonsterLesson3"));
const PlayMonsterLesson4 = lazy(() => import("./pages/playground-scene/PlayMonsterLesson4"));
const PlayMonsterLesson5 = lazy(() => import("./pages/playground-scene/PlayMonsterLesson5"));
const PlayMonsterLesson6 = lazy(() => import("./pages/playground-scene/PlayMonsterLesson6"));
const PlayMonsterLesson7 = lazy(() => import("./pages/playground-scene/PlayMonsterLesson7"));
const PlayMonsterLesson8 = lazy(() => import("./pages/playground-scene/PlayMonsterLesson8"));
const PlayMagicCastleLesson1 = lazy(() => import("./pages/playground-scene/PlayMagicCastleLesson1"));
const PlayMagicCastleLesson2 = lazy(() => import("./pages/playground-scene/PlayMagicCastleLesson2"));
const PlayMagicCastleLesson3 = lazy(() => import("./pages/playground-scene/PlayMagicCastleLesson3"));
const PlayMagicCastleLesson4 = lazy(() => import("./pages/playground-scene/PlayMagicCastleLesson4"));
const HomeworkQuestPage = lazy(() => import("./pages/HomeworkQuestPage"));
const PlayA2Unit1Lesson1 = lazy(() => import("./pages/playground-scene/PlayA2Unit1Lesson1"));
const PlayA2Unit1Lesson2 = lazy(() => import("./pages/playground-scene/PlayA2Unit1Lesson2"));
const PlayA2Unit1Lesson3 = lazy(() => import("./pages/playground-scene/PlayA2Unit1Lesson3"));
const AcademyLibraryPage = lazy(() => import("./academy-deck/pages/AcademyLibraryPage"));
const AcademyDeckLessonPage = lazy(() => import("./academy-deck/pages/AcademyDeckLessonPage"));
const AcademyDailyTenPage = lazy(() => import("./academy-deck/pages/AcademyDailyTenPage"));
const AcademyPracticeReportsPage = lazy(() => import("./academy-deck/pages/AcademyPracticeReportsPage"));
const PlaygroundLibraryPage = lazy(() => import("./pages/playground-library/PlaygroundLibraryPage"));
const PlaygroundLibraryPublic = lazy(() => import("./pages/playground-library/PlaygroundLibraryPublic"));
const PlaygroundGameRunner = lazy(() => import("./pages/PlaygroundGameRunner"));
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
                    <FamilySwitchButton />
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
                     <Route path="/games-preview" element={<Suspense fallback={<LoadingFallback />}><GamesPreview /></Suspense>} />
                     <Route path="/activity-catalog" element={<Suspense fallback={<LoadingFallback />}><ActivityCatalogPage /></Suspense>} />
                     <Route path="/games/cast-chat-quest" element={<Suspense fallback={<LoadingFallback />}><CastChatQuest /></Suspense>} />

                      <Route path="/playground-demo" element={<Suspense fallback={<LoadingFallback />}><PlaygroundDemo /></Suspense>} />
                     <Route path="/success-demo" element={<Suspense fallback={<LoadingFallback />}><SuccessDemo /></Suspense>} />
                      {/* The old Playground Creator was retired (owner, 2026-10-12): Playground lessons live in the Playground Library. */}
                      <Route path="/playground-creator" element={<Navigate to="/playground-library" replace />} />
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
                      <Route path="/playground-scene/lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayLesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayLesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayLesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayLesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayLesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-2-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit2Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-2-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit2Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-2-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit2Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-2-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit2Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-2-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit2Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-2-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit2Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-3-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit3Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-3-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit3Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-3-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit3Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-3-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit3Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-3-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit3Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-3-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit3Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-4-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit4Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-4-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit4Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-4-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit4Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-4-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit4Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-4-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit4Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-4-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit4Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-5-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit5Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-5-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit5Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-5-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit5Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-5-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit5Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-5-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit5Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-5-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit5Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-6-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit6Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-6-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit6Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-6-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit6Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-6-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit6Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-6-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit6Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-6-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit6Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-7-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit7Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-7-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit7Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-7-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit7Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-7-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit7Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-7-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit7Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-7-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit7Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-8-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit8Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-8-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit8Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-8-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit8Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-8-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit8Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-8-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit8Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-8-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit8Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-9-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit9Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-9-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit9Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-9-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit9Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-9-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit9Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-9-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit9Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-9-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit9Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-10-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit10Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-10-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit10Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-10-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit10Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-10-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit10Lesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-10-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit10Lesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-10-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit10Lesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-10-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit10Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-10-lesson-8" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit10Lesson8 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-5-lesson-8" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit5Lesson8 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-1-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit1Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-2-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit2Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-3-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit3Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-4-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit4Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-5-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit5Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-6-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit6Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-7-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit7Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-8-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit8Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/playground-scene/unit-9-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayUnit9Lesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Welcome Town, Unit 1 Lesson 1 ("Hello, Class!"). */}
                      <Route path="/playground-scene/welcome-town-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayWelcomeTown1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Welcome Town, Unit 1 Lesson 2 ("How Are You?"). */}
                      <Route path="/playground-scene/welcome-town-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayWelcomeTown2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Welcome Town, Unit 1 Lesson 3 ("Listen & Greet!"). */}
                      <Route path="/playground-scene/welcome-town-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayWelcomeTown3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Welcome Town, Unit 1 Lesson 4 ("Speak & Meet!"). */}
                      <Route path="/playground-scene/welcome-town-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayWelcomeTown4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Welcome Town, Unit 1 Lesson 5 ("Storybook: The Playground Friends"). */}
                      <Route path="/playground-scene/welcome-town-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayWelcomeTown5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Welcome Town, Unit 1 Lesson 6 ("Extra Practice: Greeting Game!"). */}
                      <Route path="/playground-scene/welcome-town-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayWelcomeTown6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Welcome Town, Unit 1 Lesson 7 ("Unit Review & Boss Test: Say Hello!"). */}
                      <Route path="/playground-scene/welcome-town-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayWelcomeTown7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Jungle Adventure, Unit 2 Lesson 1 ("Jungle Animals: Lion, Monkey, Bird"). */}
                      <Route path="/playground-scene/jungle-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayJungleLesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Jungle Adventure, Unit 2 Lesson 2 ("What Can Animals Do?"). */}
                      <Route path="/playground-scene/jungle-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayJungleLesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Jungle Adventure, Unit 2 Lesson 3. */}
                      <Route path="/playground-scene/jungle-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayJungleLesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Jungle Adventure, Unit 2 Lesson 4. */}
                      <Route path="/playground-scene/jungle-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayJungleLesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Jungle Adventure, Unit 2 Lesson 5. */}
                      <Route path="/playground-scene/jungle-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayJungleLesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Jungle Adventure, Unit 2 Lesson 6. */}
                      <Route path="/playground-scene/jungle-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayJungleLesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Jungle Adventure, Unit 2 Lesson 7. */}
                      <Route path="/playground-scene/jungle-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayJungleLesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />

                      {/* A1 tier — Space Mission, Unit 3 Lesson 1. */}
                      <Route path="/playground-scene/space-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlaySpaceLesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Space Mission, Unit 3 Lesson 2. */}
                      <Route path="/playground-scene/space-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlaySpaceLesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Space Mission, Unit 3 Lesson 3. */}
                      <Route path="/playground-scene/space-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlaySpaceLesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Space Mission, Unit 3 Lesson 4. */}
                      <Route path="/playground-scene/space-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlaySpaceLesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Space Mission, Unit 3 Lesson 5. */}
                      <Route path="/playground-scene/space-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlaySpaceLesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Space Mission, Unit 3 Lesson 6. */}
                      <Route path="/playground-scene/space-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlaySpaceLesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Space Mission, Unit 3 Lesson 7. */}
                      <Route path="/playground-scene/space-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlaySpaceLesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } /> 
                      {/* A1 tier — Ocean Explorers, Unit 6 Lesson 7 (Boss Test). */}
                      <Route path="/playground-scene/ocean-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayOceanLesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Ocean Explorers, Unit 6 Lesson 6. */}
                      <Route path="/playground-scene/ocean-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayOceanLesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Ocean Explorers, Unit 6 Lesson 5. */}
                      <Route path="/playground-scene/ocean-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayOceanLesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Ocean Explorers, Unit 6 Lesson 4. */}
                      <Route path="/playground-scene/ocean-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayOceanLesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Ocean Explorers, Unit 6 Lesson 3. */}
                      <Route path="/playground-scene/ocean-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayOceanLesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Ocean Explorers, Unit 6 Lesson 2. */}
                      <Route path="/playground-scene/ocean-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayOceanLesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Hero City, Unit 7 Lesson 3. */}
                      <Route path="/playground-scene/hero-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayHeroLesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Hero City, Unit 7 Lesson 2. */}
                      <Route path="/playground-scene/hero-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayHeroLesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Hero City, Unit 7 Lesson 1. */}
                      <Route path="/playground-scene/hero-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayHeroLesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Ocean Explorers, Unit 6 Lesson 1. */}
                      <Route path="/playground-scene/ocean-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayOceanLesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Monster Town, Unit 5 Lesson 1. */}
                      <Route path="/playground-scene/monster-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMonsterLesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Monster Town, Unit 5 Lesson 2. */}
                      <Route path="/playground-scene/monster-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMonsterLesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Monster Town, Unit 5 Lesson 3. */}
                      <Route path="/playground-scene/monster-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMonsterLesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Monster Town, Unit 5 Lesson 4. */}
                      <Route path="/playground-scene/monster-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMonsterLesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Monster Town, Unit 5 Lesson 5. */}
                      <Route path="/playground-scene/monster-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMonsterLesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Monster Town, Unit 5 Lesson 6. */}
                      <Route path="/playground-scene/monster-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMonsterLesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Monster Town, Unit 5 Lesson 7 (Boss Test). */}
                      <Route path="/playground-scene/monster-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMonsterLesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — A1 Halfway Check after Unit 5 (U5 · L8). */}
                      <Route path="/playground-scene/monster-lesson-8" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMonsterLesson8 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Food Festival, Unit 4 Lesson 1. */}
                      <Route path="/playground-scene/food-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayFoodLesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Food Festival, Unit 4 Lesson 2. */}
                      <Route path="/playground-scene/food-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayFoodLesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Food Festival, Unit 4 Lesson 3. */}
                      <Route path="/playground-scene/food-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayFoodLesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Food Festival, Unit 4 Lesson 4. */}
                      <Route path="/playground-scene/food-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayFoodLesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Food Festival, Unit 4 Lesson 5. */}
                      <Route path="/playground-scene/food-lesson-5" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayFoodLesson5 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Food Festival, Unit 4 Lesson 6. */}
                      <Route path="/playground-scene/food-lesson-6" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayFoodLesson6 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Food Festival, Unit 4 Lesson 7. */}
                      <Route path="/playground-scene/food-lesson-7" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayFoodLesson7 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />                     {/* A1 tier — Magic Castle, Unit 9 Lesson 1 ("Rooms in the Castle: Kitchen, Bedroom"). */}
                      <Route path="/playground-scene/castle-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMagicCastleLesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Magic Castle, Unit 9 Lesson 2 ("Castle Furniture"). */}
                      <Route path="/playground-scene/castle-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMagicCastleLesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Magic Castle, Unit 9 Lesson 3 ("Listen: Where Is the Magic Lamp?"). */}
                      <Route path="/playground-scene/castle-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMagicCastleLesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A1 tier — Magic Castle, Unit 9 Lesson 4 ("There Is / There Are in My Room!"). */}
                      <Route path="/playground-scene/castle-lesson-4" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayMagicCastleLesson4 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A2 tier — Welcome Town, Unit 1 Lesson 1 ("My Day"). */}
                      <Route path="/playground-scene/a2-unit-1-lesson-1" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayA2Unit1Lesson1 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A2 tier — Welcome Town, Unit 1 Lesson 2 ("My Week"). */}
                      <Route path="/playground-scene/a2-unit-1-lesson-2" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayA2Unit1Lesson2 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* A2 tier — Welcome Town, Unit 1 Lesson 3 ("Yesterday"). */}
                      <Route path="/playground-scene/a2-unit-1-lesson-3" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><PlayA2Unit1Lesson3 /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* Academy Library (content creator) + the Academy deck lesson player (students from My Lessons, creators from the library). */}
                      <Route path="/academy-library" element={
                        <ImprovedProtectedRoute requiredRole={["content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><AcademyLibraryPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/academy-lesson/:id" element={
                        <ImprovedProtectedRoute requiredRole={["student", "teacher", "content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><AcademyDeckLessonPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/academy-practice-reports" element={
                        <ImprovedProtectedRoute requiredRole={["teacher", "content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><AcademyPracticeReportsPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/academy-daily-10" element={
                        <ImprovedProtectedRoute requiredRole={["student", "teacher", "content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><AcademyDailyTenPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/academy-lesson/:id/homework" element={
                        <ImprovedProtectedRoute requiredRole={["student", "teacher", "content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><AcademyDeckLessonPage homework /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* Standalone Playground Library — deliberately outside the Creator Studio
                          shell, with its own Playground-branded layout. */}
                      <Route path="/playground-library" element={
                        <ImprovedProtectedRoute requiredRole={["content_creator", "admin"]}>
                          <Suspense fallback={<LoadingFallback />}><PlaygroundLibraryPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      {/* Public, read-only mirror of the library above — anyone with the
                          link can browse published lessons, no account required. */}
                      {/* One Playground game, playable without an account. */}
                      <Route path="/library/playground/games/:gameId" element={
                        <Suspense fallback={<LoadingFallback />}><PlaygroundGamePage /></Suspense>
                      } />
                      <Route path="/library/playground" element={
                        <Suspense fallback={<LoadingFallback />}><PlaygroundLibraryPublic /></Suspense>
                      } />
                      <Route path="/play/:lessonId" element={<Suspense fallback={<LoadingFallback />}><PlaygroundGameRunner /></Suspense>} />
                      <Route path="/play" element={<Suspense fallback={<LoadingFallback />}><PlaygroundGameRunner /></Suspense>} />
                      {/* Retired per direct user request — Academy content is now
                          authored the same way its library lessons already work,
                          not through this standalone tool. AcademyCreator.tsx and
                          every navigate('/academy-creator...') call elsewhere in the
                          app (AcademyLibraryPage, CurriculumMap, TrialCreator,
                          LibraryManager, useLessonTemplates, ImportFromTextDialog)
                          are deliberately left untouched — this single route-level
                          redirect intercepts all of them, so the tool can be
                          reinstated later (e.g. for a different program) just by
                          restoring the route below. */}
                      <Route path="/academy-creator" element={<Navigate to="/dashboard" replace />} />
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
                      <Route path="/pricing" element={<Suspense fallback={<LoadingFallback />}><PricingPage /></Suspense>} />
                      <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
                      <Route path="/signup" element={<Navigate to={`/student-signup${window.location.search}`} replace />} />
                      <Route path="/teacher-signup" element={<Navigate to="/for-teachers" replace />} />
                      <Route path="/student-signup" element={<Suspense fallback={<LoadingFallback />}><StudentSignUp /></Suspense>} />
                      <Route path="/parent-signup" element={<Suspense fallback={<LoadingFallback />}><ParentSignUp /></Suspense>} />
                      <Route path="/who-is-learning" element={
                        <ImprovedProtectedRoute requiredRole={['parent', 'student']}>
                          <Suspense fallback={<LoadingFallback />}><WhoIsLearning /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/teacher-application" element={<Navigate to="/for-teachers" replace />} />
                      <Route path="/student-application" element={<Suspense fallback={<LoadingFallback />}><StudentApplication /></Suspense>} />
                      <Route path="/email-verification" element={<Suspense fallback={<LoadingFallback />}><EmailVerification /></Suspense>} />
                      <Route path="/reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
                      <Route path="/set-password" element={<Suspense fallback={<LoadingFallback />}><SetPassword /></Suspense>} />
                      <Route path="/unsubscribe" element={<Suspense fallback={<LoadingFallback />}><UnsubscribePage /></Suspense>} />

                      {/* Legal Pages */}
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
                      <Route path="/admin/teacher-scorecards" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><TeacherScorecards /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/teacher/kpi" element={
                        <ImprovedProtectedRoute requiredRole="teacher">
                          <Suspense fallback={<LoadingFallback />}><TeacherKpiSelfView /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/teacher/how-we-measure" element={
                        <ImprovedProtectedRoute requiredRole="teacher">
                          <Suspense fallback={<LoadingFallback />}><HowWeMeasure /></Suspense>
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
                      <Route path="/admin/video-briefs" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><VideoBriefs /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
                      <Route path="/admin/playground-lesson-builder" element={
                        <ImprovedProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}><PlaygroundLessonBuilder /></Suspense>
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
                      {/* Gamified Homework Quests (one per Playground lesson). */}
                      <Route path="/homework-quest/:questId" element={
                        <ImprovedProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}><HomeworkQuestPage /></Suspense>
                        </ImprovedProtectedRoute>
                      } />
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
                      {/* Deep link to one built-in Playground game. The list itself is the Game
                          Library tab above (GamesHubPage -> GamesTab). */}
                      <Route path="/dashboard/games/:gameId" element={
                        <ImprovedProtectedRoute requiredRole="student">
                          <Suspense fallback={<LoadingFallback />}><StudentGamesPage /></Suspense>
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

                      {/* Classroom invite magic-link entry — public (no password screen).
                          Teacher-invited student: signs in as their real account, then
                          hands off into the existing /classroom/:id route unmodified. */}
                      <Route path="/join-classroom/:token" element={
                        <Suspense fallback={<LoadingFallback />}>
                          <JoinClassroomPage />
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

                      {/* Family dashboard › Lessons (buy packs) - its own page */}
                      <Route path="/parent/lessons" element={
                        <ImprovedProtectedRoute requiredRole="parent">
                          <Suspense fallback={<LoadingFallback />}>
                            <ParentLessons />
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


                      <Route path="/preview/placement-kids" element={<Suspense fallback={<LoadingFallback />}><KidsPlacementPreview /></Suspense>} />

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
                      <Route path="*" element={<UnknownRouteReload />} />
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
