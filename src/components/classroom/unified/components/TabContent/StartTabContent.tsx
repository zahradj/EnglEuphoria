import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StartTabContentProps {
  onStartLesson: () => void;
  isTeacher: boolean;
  sessionStatus?: 'waiting' | 'started' | 'ended';
  roomId: string;
}

export function StartTabContent({ 
  onStartLesson, 
  isTeacher, 
  sessionStatus = 'waiting',
  roomId 
}: StartTabContentProps) {
  const [isStarting, setIsStarting] = useState(false);
  const { toast } = useToast();

  const handleStartLesson = async () => {
    if (!isTeacher) return;
    
    setIsStarting(true);
    try {
      await onStartLesson();
      toast({
        title: "Lesson Started",
        description: "The lesson has been successfully started. Students can now join.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start the lesson. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  if (sessionStatus === 'started') {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Lesson in Progress</h3>
                <p className="text-sm text-green-600 mt-2">
                  The lesson is currently active. Use the other tabs to manage content and activities.
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  Live
                </div>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionStatus === 'ended') {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Lesson Completed</h3>
                <p className="text-sm text-gray-600 mt-2">
                  This lesson has been completed. Check the Finish tab for feedback and summary.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lesson Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium">Duration</h4>
                <p className="text-sm text-gray-600">60 minutes</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium">Format</h4>
                <p className="text-sm text-gray-600">1-on-1 Online</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium">Focus</h4>
                <p className="text-sm text-gray-600">Conversation Practice</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isTeacher ? (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Start?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Click the button below to start the lesson. This will notify the student and begin the session.
              </p>
              <Button 
                onClick={handleStartLesson}
                disabled={isStarting}
                size="lg"
                className="w-full"
              >
                {isStarting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Lesson...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Lesson
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Waiting for Teacher</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Please wait while your teacher prepares and starts the lesson.
                  </p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Waiting to Start
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lesson Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Practice conversational English with real-time feedback
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Improve pronunciation and fluency
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Build confidence in speaking
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Learn new vocabulary and expressions
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}