
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

interface NavigationButtonsProps {
  mediaError: string | null;
  testCompleted: boolean;
  goBack: () => void;
  retryMediaAccess: () => void;
  joinClassroom: () => void;
}

export const NavigationButtons = ({
  mediaError,
  testCompleted,
  goBack,
  retryMediaAccess,
  joinClassroom
}: NavigationButtonsProps) => {
  return (
    <div className="flex gap-4">
      <Button variant="outline" onClick={goBack} className="flex-1">
        Go Back
      </Button>
      
      {mediaError ? (
        <Button onClick={retryMediaAccess} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      ) : testCompleted ? (
        <Button onClick={joinClassroom} className="flex-1">
          <ArrowRight className="h-4 w-4 mr-2" />
          Join Classroom
        </Button>
      ) : (
        <Button disabled className="flex-1">
          Complete Test First
        </Button>
      )}
    </div>
  );
};
