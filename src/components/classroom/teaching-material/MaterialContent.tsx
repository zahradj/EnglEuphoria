
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle, Play, FileText, Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MaterialContentProps {
  materialType: "pdf" | "image" | "video" | "interactive";
  source: string;
  currentPage: number;
}

export function MaterialContent({
  materialType,
  source,
  currentPage
}: MaterialContentProps) {
  const { languageText } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handlePdfError = () => {
    setPdfError(true);
  };

  // Process source URL to ensure it's valid
  const processedSource = () => {
    if (!source) return "";
    
    // For local files that were uploaded via File API
    if (source.startsWith("blob:")) {
      return source;
    }
    
    // Check if URL is already properly formed
    try {
      new URL(source);
      return source;
    } catch (e) {
      // If not a valid URL and doesn't have http/https, assume it's a relative path
      if (!source.startsWith('http://') && !source.startsWith('https://')) {
        return source.startsWith('/') ? source : `/${source}`;
      }
      return source;
    }
  };

  const finalSource = processedSource();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = finalSource;
    link.download = 'document';
    link.click();
  };

  const openInNewTab = () => {
    window.open(finalSource, '_blank');
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {materialType === "pdf" && (
        <div className="w-full h-full flex items-center justify-center">
          {pdfError ? (
            <div className="text-center max-w-md">
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This document cannot be previewed directly. You can download it or open it in a new tab.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <Button onClick={openInNewTab} variant="outline" size="sm">
                  <ExternalLink size={16} className="mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-white">
              {finalSource.startsWith('blob:') ? (
                <iframe
                  src={finalSource}
                  className="w-full h-full border-0"
                  title="PDF Document"
                  onError={handlePdfError}
                />
              ) : (
                <iframe
                  src={`${finalSource}#page=${currentPage}`}
                  className="w-full h-full border-0"
                  title="PDF Document"
                  onError={handlePdfError}
                />
              )}
            </div>
          )}
        </div>
      )}
      
      {materialType === "image" && (
        <div className="w-full h-full flex items-center justify-center">
          {imageError ? (
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load image. Please check the file path or upload a new image.
              </AlertDescription>
            </Alert>
          ) : (
            <img 
              src={finalSource} 
              alt="Teaching material" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              onError={handleImageError}
            />
          )}
        </div>
      )}
      
      {materialType === "video" && (
        <div className="w-full h-full flex items-center justify-center">
          {videoError ? (
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load video. Please check the URL or upload a new video file.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
              {finalSource.includes('youtube.com') || finalSource.includes('youtu.be') ? (
                <iframe
                  src={finalSource.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="w-full h-full border-0"
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={handleVideoError}
                />
              ) : (
                <video 
                  src={finalSource}
                  controls
                  className="w-full h-full"
                  onError={handleVideoError}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </div>
      )}
      
      {materialType === "interactive" && (
        <div className="w-full h-full flex items-center justify-center">
          {iframeError ? (
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load interactive content. Please check the URL or try a different source.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="w-full max-w-6xl aspect-video bg-white shadow-lg rounded-lg overflow-hidden border">
              <iframe 
                src={finalSource}
                className="w-full h-full border-0"
                title="Interactive content"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onError={handleIframeError}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
