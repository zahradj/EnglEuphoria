
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";

interface EmbeddedGameErrorProps {
  isBlocked: boolean;
  loadTimeout: boolean;
  onRetry: () => void;
  onOpenInNewTab: () => void;
}

export function EmbeddedGameError({
  isBlocked,
  loadTimeout,
  onRetry,
  onOpenInNewTab
}: EmbeddedGameErrorProps) {
  const getErrorMessage = () => {
    if (isBlocked) return "Content blocked by security policy.";
    if (loadTimeout) return "Content is taking too long to load.";
    return "Failed to load content.";
  };

  return (
    <div className="w-full h-[calc(100%-2.5rem)] flex flex-col items-center justify-center bg-gray-100 text-gray-600 p-4">
      <AlertTriangle size={32} className="mb-2 text-orange-500" />
      <p className="text-sm text-center mb-3">
        {getErrorMessage()}
      </p>
      <p className="text-xs text-center text-gray-500 mb-3">
        Some educational games may have embedding restrictions. Try opening in a new tab or refreshing.
      </p>
      <div className="flex gap-2">
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <RefreshCw size={14} className="mr-1" />
          Retry
        </Button>
        <Button
          onClick={onOpenInNewTab}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <ExternalLink size={14} className="mr-1" />
          Open in New Tab
        </Button>
      </div>
    </div>
  );
}
