import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hourglass } from 'lucide-react';

export const AssessmentWidget = () => {
  return (
    <Card className="border border-gray-200 shadow-sm bg-gray-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">
          Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 text-center">
        <Hourglass className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700 mb-1">Under development</p>
        <p className="text-xs text-gray-500">
          Results will be available after 365 days
        </p>
      </CardContent>
    </Card>
  );
};
