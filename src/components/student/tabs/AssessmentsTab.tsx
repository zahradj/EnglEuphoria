import { AssessmentsList } from '@/components/assessments/AssessmentsList';

export function AssessmentsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Assessments</h2>
        <p className="text-muted-foreground">
          View and take your assigned assessments
        </p>
      </div>
      <AssessmentsList isTeacher={false} />
    </div>
  );
}