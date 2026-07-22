import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentsList } from '@/components/assessments/AssessmentsList';
import { AssessmentGrading } from '@/components/assessment/AssessmentGrading';

export function AssessmentsManagementTab() {
  const [activeSubTab, setActiveSubTab] = useState('my-assessments');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Assessment Management</h2>
        <p className="text-muted-foreground">
          Create, manage, and grade student assessments
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="my-assessments">My Assessments</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
        </TabsList>

        <TabsContent value="my-assessments" className="mt-6">
          <AssessmentsList isTeacher={true} />
        </TabsContent>

        <TabsContent value="grading" className="mt-6">
          <AssessmentGrading />
        </TabsContent>
      </Tabs>
    </div>
  );
}