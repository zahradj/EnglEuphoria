
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface TestStatusCardProps {
  cameraStatus: 'unknown' | 'working' | 'error';
  microphoneStatus: 'unknown' | 'working' | 'error';
  isVideoPlaying: boolean;
  videoLoadTimeout: boolean;
  canCompleteTest: boolean;
  testCompleted: boolean;
  isLoading: boolean;
  needsUserInteraction: boolean;
  completeTest: () => void;
}

export const TestStatusCard = ({
  cameraStatus,
  microphoneStatus,
  isVideoPlaying,
  videoLoadTimeout,
  canCompleteTest,
  testCompleted,
  isLoading,
  needsUserInteraction,
  completeTest
}: TestStatusCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Camera Status</span>
            <div className="flex items-center gap-2">
              {cameraStatus === 'working' && isVideoPlaying ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Working</span>
                </>
              ) : cameraStatus === 'error' ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">Error</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-blue-600">Testing</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Microphone Status</span>
            <div className="flex items-center gap-2">
              {microphoneStatus === 'working' ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Working</span>
                </>
              ) : microphoneStatus === 'error' ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">Error</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-blue-600">Testing</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Video Stream</span>
            <div className="flex items-center gap-2">
              {isVideoPlaying ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Live</span>
                </>
              ) : videoLoadTimeout ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">Failed</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />
                  <span className="text-orange-600">Loading</span>
                </>
              )}
            </div>
          </div>

          {canCompleteTest && !testCompleted && (
            <Button onClick={completeTest} className="w-full mt-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Complete - Ready to Join
            </Button>
          )}
          
          {!canCompleteTest && !isLoading && (
            <div className="text-center mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                {needsUserInteraction 
                  ? "Click the 'Start Video' button to complete the camera test"
                  : "Please ensure both camera and microphone are working properly before proceeding"
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
