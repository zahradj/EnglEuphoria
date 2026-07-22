import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Award, Users, Eye, Edit, Trash2 } from "lucide-react";
import { CreateAssessmentDialog } from "./CreateAssessmentDialog";

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  cefr_level: string;
  duration_minutes: number;
  passing_score: number;
  total_points: number;
  is_published: boolean;
  created_at: string;
}

export function AssessmentsList({ isTeacher }: { isTeacher: boolean }) {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (isTeacher) {
        query = query.eq('teacher_id', user.id);
      } else {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Assessment ${!currentStatus ? 'published' : 'unpublished'}`,
      });

      fetchAssessments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAssessment = async (id: string) => {
    if (!confirm('Delete this assessment? This is only allowed if NO student has submitted answers yet.')) return;

    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assessment deleted",
      });

      fetchAssessments();
    } catch (error: any) {
      toast({
        title: "Cannot delete assessment",
        description: error.message || 'Historical assessments with submissions are immutable.',
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading assessments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isTeacher ? 'My Assessments' : 'Available Assessments'}
        </h2>
        {isTeacher && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        )}
      </div>

      {assessments.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No assessments yet</p>
          <p className="text-muted-foreground">
            {isTeacher 
              ? 'Create your first assessment to get started'
              : 'No assessments available at the moment'
            }
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{assessment.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {assessment.description}
                    </p>
                  </div>
                  <Badge variant={assessment.is_published ? "default" : "secondary"}>
                    {assessment.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {assessment.assessment_type}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {assessment.cefr_level}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {assessment.duration_minutes}min
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div>Total Points: {assessment.total_points}</div>
                  <div>Passing Score: {assessment.passing_score}%</div>
                </div>

                <div className="flex gap-2">
                  {isTeacher ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublish(assessment.id, assessment.is_published)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {assessment.is_published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAssessment(assessment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="w-full">
                      <Users className="w-4 h-4 mr-1" />
                      Take Assessment
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateAssessmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchAssessments}
      />
    </div>
  );
}