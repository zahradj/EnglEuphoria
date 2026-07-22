
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Lock, CheckCircle } from 'lucide-react';
import { useClassroomAccess } from '@/hooks/useClassroomAccess';

interface ClassroomAccessGuardProps {
  roomId: string;
  userId: string;
  userRole: 'teacher' | 'student';
  children: React.ReactNode;
  onAccessDenied?: () => void;
}

export function ClassroomAccessGuard({
  roomId,
  userId,
  userRole,
  children,
  onAccessDenied
}: ClassroomAccessGuardProps) {
  const {
    validation,
    isValidating,
    isAccessValid,
    lesson,
    validateAccess
  } = useClassroomAccess({
    roomId,
    userId,
    userRole,
    autoValidate: true
  });

  useEffect(() => {
    if (validation && !validation.isValid && onAccessDenied) {
      onAccessDenied();
    }
  }, [validation, onAccessDenied]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Validating Access</h3>
            <p className="text-gray-600">Checking your permissions for this classroom...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAccessValid) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {validation?.message?.includes('time window') ? (
                <Clock className="h-12 w-12 text-orange-500" />
              ) : (
                <Lock className="h-12 w-12 text-red-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Access Restricted
            </h3>
            <p className="text-gray-600 mb-6">
              {validation?.message || 'You do not have permission to access this classroom.'}
            </p>
            
            {validation?.message?.includes('time window') && (
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Classroom access opens 10 minutes before lesson time
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button onClick={validateAccess} className="w-full">
                Retry Access Check
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access is valid, show lesson info and render children
  return (
    <div className="min-h-dvh bg-gray-50">
      {lesson && (
        <div className="bg-white border-b p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="font-semibold text-gray-900">{lesson.title}</h2>
                <p className="text-sm text-gray-600">
                  {new Date(lesson.scheduled_at).toLocaleString()} • {lesson.duration} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600 font-medium">● LIVE</span>
              <span className="text-sm text-gray-500">Room: {roomId}</span>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
