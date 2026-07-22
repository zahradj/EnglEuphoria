
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle } from "lucide-react";

interface UploadedFile {
  id: number;
  name: string;
  type: string;
  uploadedAt: string;
}

interface FileUploadSectionProps {
  uploadedFiles: UploadedFile[];
  onFileUpload: () => void;
}

export function FileUploadSection({ uploadedFiles, onFileUpload }: FileUploadSectionProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Upload Files:</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <Upload size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">Drop files here or click to upload</p>
        <Button size="sm" variant="outline" onClick={onFileUpload}>
          Choose Files
        </Button>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <FileText size={16} className="text-blue-600" />
              <span className="text-sm">{file.name}</span>
              <CheckCircle size={16} className="text-green-600 ml-auto" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
