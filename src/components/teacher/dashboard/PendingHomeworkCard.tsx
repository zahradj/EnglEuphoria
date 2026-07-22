
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertCircle } from "lucide-react";

interface HomeworkItem {
  student: string;
  assignment: string;
  submitted: string;
  urgent: boolean;
}

interface PendingHomeworkCardProps {
  homework: HomeworkItem[];
}

export const PendingHomeworkCard = ({ homework }: PendingHomeworkCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          Homework to Grade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {homework.map((hw, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-800">{hw.student}</h4>
                <p className="text-sm text-gray-600">{hw.assignment}</p>
                <p className="text-sm text-indigo-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Submitted {hw.submitted}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hw.urgent && (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
                <Button size="sm" variant="outline">
                  Grade
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
