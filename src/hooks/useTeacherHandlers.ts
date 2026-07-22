import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useTeacherHandlers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    // Clear cached UI state
    localStorage.removeItem("teacherName");
    localStorage.removeItem("studentName");
    localStorage.removeItem("userType");
    localStorage.removeItem("points");
    // Properly terminate the Supabase session — signOut performs a full
    // window.location.replace('/') so no extra navigate() is needed and
    // the dashboard cannot re-render against a stale session.
    await signOut();
  };

  const handleCreateLessonPlan = () => {
    navigate("/lesson-plan-creator");
  };

  const handleManageStudents = () => {
    navigate("/student-management");
  };

  const handleStartClass = () => {
    navigate("/teacher");
  };

  const handleScheduleClass = () => {
    navigate("/lesson-scheduler");
  };

  const handleViewProgress = () => {
    navigate("/student-management");
  };

  const handleUploadMaterial = () => {
    toast({
      title: "Upload Material",
      description: "File upload functionality will be available soon!",
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filter Students",
      description: "Filter functionality will be available soon!",
    });
  };

  const handleAddStudent = () => {
    toast({
      title: "Add Student",
      description: "Add student functionality will be available soon!",
    });
  };

  const handleViewLessonPlan = (planId: string) => {
    toast({
      title: "View Lesson Plan",
      description: `Viewing lesson plan: ${planId}`,
    });
  };

  const handleUseMaterial = (materialName: string) => {
    toast({
      title: "Use Material",
      description: `Using material: ${materialName}`,
    });
  };

  const handleViewStudentDetails = (studentName: string) => {
    toast({
      title: "View Student Details",
      description: `Viewing details for: ${studentName}`,
    });
  };

  const handleStartScheduledClass = (className: string) => {
    toast({
      title: "Starting Class",
      description: `Starting ${className}...`,
    });
    navigate("/teacher");
  };

  const handleViewClassDetails = (className: string) => {
    toast({
      title: "Class Details",
      description: `Viewing details for: ${className}`,
    });
  };

  const handleJoinClass = () => {
    navigate("/teacher");
  };

  const handleCreateAssignment = () => {
    toast({
      title: "Create Assignment",
      description: "Assignment creation will be available soon!",
    });
  };

  const handleSendMessage = () => {
    toast({
      title: "Send Message",
      description: "Message functionality will be available soon!",
    });
  };

  // New handlers for backend and AI integration
  const handleBackendSetup = () => {
    toast({
      title: "Backend Setup",
      description: "Opening backend integration panel...",
    });
  };

  const handleAIAssistant = () => {
    toast({
      title: "AI Assistant",
      description: "Opening enhanced AI assistant...",
    });
  };

  const handleDatabaseConfig = () => {
    toast({
      title: "Database Configuration",
      description: "Configure your database connection and schema.",
    });
  };

  const handleAPIIntegration = () => {
    toast({
      title: "API Integration",
      description: "Manage your third-party API connections.",
    });
  };

  return {
    handleLogout,
    handleCreateLessonPlan,
    handleManageStudents,
    handleStartClass,
    handleScheduleClass,
    handleViewProgress,
    handleUploadMaterial,
    handleFilter,
    handleAddStudent,
    handleViewLessonPlan,
    handleUseMaterial,
    handleViewStudentDetails,
    handleStartScheduledClass,
    handleViewClassDetails,
    handleJoinClass,
    handleCreateAssignment,
    handleSendMessage,
    // New handlers
    handleBackendSetup,
    handleAIAssistant,
    handleDatabaseConfig,
    handleAPIIntegration,
  };
};
