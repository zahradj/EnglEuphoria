
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertCircle } from "lucide-react";

interface VideoErrorDisplayProps {
  error: string | null;
}

export function VideoErrorDisplay({ error }: VideoErrorDisplayProps) {
  if (!error) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 mb-1">
            Connection Issue
          </h4>
          <p className="text-sm text-red-700 mb-3">
            {error.includes('session') || error.includes('Session') 
              ? "There was a problem connecting to the classroom session. This might be due to network issues or server maintenance."
              : error
            }
          </p>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}
