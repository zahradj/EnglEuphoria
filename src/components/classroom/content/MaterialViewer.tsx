
import React, { useState, useEffect } from "react";
import { TeachingMaterial } from "@/components/classroom/TeachingMaterial";
import { ContentItem } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

interface MaterialViewerProps {
  selectedContent: ContentItem | null;
}

export function MaterialViewer({ selectedContent }: MaterialViewerProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedContent) {
      setIsLoading(true);
      // Simulate loading time - in real app this would be when content is actually loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [selectedContent]);

  if (!selectedContent) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="text-xl mb-2">📚</div>
          <div className="text-lg font-medium mb-1">No content selected</div>
          <div className="text-sm">Upload or select content from the library to view it here</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full p-4">
        <div className="mb-4">
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="h-[calc(100%-3rem)] border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex items-center justify-center h-[calc(100%-4rem)]">
            <div className="space-y-4 w-full max-w-md">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map content types to material types for TeachingMaterial component
  const getMaterialType = (contentType: string): "pdf" | "image" | "video" | "interactive" => {
    switch (contentType) {
      case "game":
        return "interactive";
      default:
        return contentType as "pdf" | "image" | "video" | "interactive";
    }
  };

  // Validate and process source URL
  const validateSource = (source: string): string => {
    if (!source) return "";
    
    // If it's already a blob URL from File API
    if (source.startsWith("blob:")) {
      return source;
    }
    
    // Check if it's already a valid URL
    try {
      new URL(source);
      return source;
    } catch (e) {
      // For embedded content that might be just domain paths
      if (source.includes('youtube.com') || source.includes('youtu.be')) {
        return source.startsWith('http') ? source : `https://${source}`;
      }
      
      // For local files, make sure the path is correct
      return source.startsWith('/') ? source : `/${source}`;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3 px-2">
        <div className="text-sm font-medium text-gray-900">{selectedContent.title}</div>
        <div className="text-xs text-gray-500">Uploaded by {selectedContent.uploadedBy}</div>
      </div>
      <div className="flex-1 min-h-0">
        <TeachingMaterial
          materialType={getMaterialType(selectedContent.type)}
          source={validateSource(selectedContent.source)}
          currentPage={1}
          totalPages={1}
          allowAnnotation={true}
        />
      </div>
    </div>
  );
}
