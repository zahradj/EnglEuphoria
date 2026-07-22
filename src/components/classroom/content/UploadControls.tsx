
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Image, Video, Gamepad2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MaterialType } from "./types";

interface UploadControlsProps {
  isTeacher: boolean;
  onUpload: (type: MaterialType) => void;
  onEmbedVideo: () => void;
  onAddGame: () => void;
}

export function UploadControls({ 
  isTeacher, 
  onUpload, 
  onEmbedVideo, 
  onAddGame 
}: UploadControlsProps) {
  return (
    <Card className="p-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => onUpload('pdf')}>
          <FileText size={16} className="mr-1" />
          Upload PDF
        </Button>
        <Button size="sm" variant="outline" onClick={() => onUpload('image')}>
          <Image size={16} className="mr-1" />
          Upload Image
        </Button>
        <Button size="sm" variant="outline" onClick={onEmbedVideo}>
          <Video size={16} className="mr-1" />
          Embed Video
        </Button>
        <Button size="sm" variant="outline" onClick={onAddGame}>
          <Gamepad2 size={16} className="mr-1" />
          Add Game
        </Button>
        {isTeacher && (
          <Button size="sm" variant="outline" onClick={() => onUpload('interactive')}>
            <Upload size={16} className="mr-1" />
            Upload File
          </Button>
        )}
      </div>
    </Card>
  );
}
