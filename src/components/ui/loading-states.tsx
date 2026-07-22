
import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {message && (
        <p className="text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
}

export function ErrorState({ 
  title = "Error", 
  message, 
  onRetry, 
  retryLabel = "Try Again",
  showIcon = true 
}: ErrorStateProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 text-center space-y-4">
        {showIcon && (
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        )}
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
