
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  FileText, 
  Play, 
  Clock,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStudentHandlers } from "@/hooks/useStudentHandlers";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HomeworkSubmissionModal } from "./HomeworkSubmissionModal";
import { TeacherMessageModal } from "./TeacherMessageModal";
import { StudentLessonTracker } from "@/components/dashboard/student/StudentLessonTracker";
import { StudentWelcomeSection } from "./dashboard/StudentWelcomeSection";
import { StudentStatsOverview } from "./dashboard/StudentStatsOverview";
import { StudentPackagesSection } from "./dashboard/StudentPackagesSection";
import { StudentActivityFeed } from "./dashboard/StudentActivityFeed";
import { StudentQuickActions } from "./dashboard/StudentQuickActions";
import { StudentLearningGoals } from "./dashboard/StudentLearningGoals";
import { CreditDisplay } from "@/components/student/CreditDisplay";
import { usePackageValidation } from "@/hooks/usePackageValidation";
import { LessonHistory } from "./dashboard/LessonHistory";
import { PendingAssignments } from "./PendingAssignments";

interface DashboardTabProps {
  studentName: string;
  studentId: string;
  hasProfile: boolean;
  studentProfile: any;
}

export const DashboardTab = ({ studentName, studentId, hasProfile, studentProfile }: DashboardTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasActivePackages, totalCredits, loading: packageLoading } = usePackageValidation(user?.id || null);
  const {
    handleJoinClass,
    handleSubmitHomework,
    handleMessageTeacher,
    handleViewMaterials,
    handleBookClass,
    handlePracticeVocabulary,
    handleViewProgress
  } = useStudentHandlers();

  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  const handleJoinClassroom = async () => {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
      const { data: nextBooking } = await supabase
        .from('class_bookings')
        .select('id')
        .eq('student_id', studentId)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_at', fiveMinAgo)
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextBooking?.id) {
        navigate(`/classroom/${nextBooking.id}`);
      } else {
        navigate('/discover-teachers');
      }
    } catch {
      navigate('/discover-teachers');
    }
  };

  const handleHomeworkSubmit = (submission: { text: string; files: File[] }) => {
    if (selectedAssignment) {
      handleSubmitHomework(selectedAssignment, submission);
    }
    setShowHomeworkModal(false);
    setSelectedAssignment(null);
  };

  const openHomeworkSubmission = (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    setShowHomeworkModal(true);
  };

  // Import the enhanced upcoming classes component
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch upcoming classes on component mount
  React.useEffect(() => {
    const fetchUpcomingClasses = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // Use the existing lesson service to fetch student lessons
        const { lessonService } = await import('@/services/lessonService');
        const lessons = await lessonService.getStudentUpcomingLessons(user.id);
        setUpcomingClasses(lessons.slice(0, 3)); // Show only first 3 on dashboard
      } catch (error) {
        console.error('Error fetching upcoming classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingClasses();
  }, [user?.id]);

  const recentHomework: any[] = [];

  const achievements: any[] = [];

  return (
    <div className="space-y-8">
      {/* Pending Assignments — top priority */}
      <PendingAssignments />

      {/* Enhanced Welcome Section */}
      <StudentWelcomeSection
        studentName={studentName}
        studentId={studentId}
        hasProfile={hasProfile}
        studentProfile={studentProfile}
        onJoinClassroom={handleJoinClassroom}
      />

      {/* Credit Display - Prominent at top */}
      <CreditDisplay 
        totalCredits={totalCredits}
        loading={packageLoading}
        showPurchaseButton={true}
        size="lg"
      />

      {/* Lesson Tracker Section */}
      <StudentLessonTracker />

      {/* Enhanced Stats Overview */}
      <StudentStatsOverview hasProfile={hasProfile} studentProfile={studentProfile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Upcoming Classes */}
        <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg border-b border-border/30">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-foreground font-semibold">Upcoming Classes</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/discover-teachers')} className="hover:bg-primary/10">
                <Plus className="h-4 w-4 text-primary" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-text-muted">Loading your lessons...</p>
              </div>
            ) : upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No classes scheduled</h3>
                <p className="text-text-muted mb-4">Book your first lesson to get started!</p>
                <Button onClick={() => navigate('/find-teacher')} className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Book a Lesson
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingClasses.map((lesson) => (
                  <div key={lesson.id} className="p-4 border border-border/30 rounded-lg hover:shadow-md transition-all duration-200 bg-surface hover:bg-surface-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{lesson.title}</h4>
                        <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4" />
                          {new Date(lesson.scheduled_at).toLocaleDateString()} at {new Date(lesson.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-primary font-medium mt-1">
                          Lesson with Teacher {lesson.teacher_name || 'TBA'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={lesson.duration === 25 ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-purple-500/10 text-purple-600 border-purple-500/20"}
                          >
                            {lesson.duration} min
                          </Badge>
                          {lesson.student_id && (
                            <Badge variant="outline" className="text-xs">
                              #{lesson.student_id.slice(-6).toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                          onClick={() => {
                            // Always use booking id as universal room key
                            navigate(`/classroom/${lesson.id}`);
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Join Class
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/student/schedule')}
                          className="border-border/50 hover:bg-surface-2"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          View All
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Recent Homework */}
        <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-t-lg border-b border-border/30">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <span className="text-foreground font-semibold">Recent Homework</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => openHomeworkSubmission("new")} className="hover:bg-accent/10">
                <Plus className="h-4 w-4 text-accent" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentHomework.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No assignments yet</h3>
                <p className="text-text-muted mb-4">Your homework will appear here once assigned.</p>
                <Button variant="outline" onClick={() => openHomeworkSubmission("new")} className="border-border/50 hover:bg-surface-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Work
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentHomework.map((hw) => (
                  <div key={hw.id} className="p-4 border border-border/30 rounded-lg hover:shadow-md transition-all duration-200 bg-surface hover:bg-surface-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{hw.title}</h4>
                        <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4" />
                          Due {hw.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={hw.status === 'submitted' ? 'default' : 'secondary'}>
                          {hw.status}
                        </Badge>
                        {hw.status === 'pending' && (
                          <Button size="sm" onClick={() => openHomeworkSubmission(hw.id)} className="bg-gradient-to-r from-accent to-primary text-white hover:opacity-90">
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Packages Section */}
      {user?.id && <StudentPackagesSection studentId={user.id} />}

      {/* Learning Goals and Daily Progress */}
      <StudentLearningGoals hasProfile={hasProfile} />

      {/* Activity Feed and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StudentActivityFeed hasProfile={hasProfile} />
        <div>
          <StudentQuickActions
            onJoinClassroom={handleJoinClassroom}
            onOpenHomeworkModal={() => openHomeworkSubmission("new")}
            onOpenMessageModal={() => setShowMessageModal(true)}
          />
        </div>
      </div>

      {/* All Lessons Section */}
      <div className="mt-8">
        <LessonHistory />
      </div>

      {/* Modals */}
      <HomeworkSubmissionModal
        isOpen={showHomeworkModal}
        onClose={() => {
          setShowHomeworkModal(false);
          setSelectedAssignment(null);
        }}
        assignmentTitle={selectedAssignment && selectedAssignment !== "new" ? recentHomework.find(hw => hw.id === selectedAssignment)?.title || "New Assignment" : "New Assignment"}
        onSubmit={handleHomeworkSubmit}
      />

      <TeacherMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={handleMessageTeacher}
      />
    </div>
  );
};
