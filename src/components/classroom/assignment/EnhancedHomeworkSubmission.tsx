
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, FileText, Clock, CheckCircle, AlertCircle, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Assignment, assignmentService } from "@/services/assignmentService";

interface EnhancedHomeworkSubmissionProps {
  assignment: Assignment;
  onSubmissionComplete: () => void;
  onBack: () => void;
}

export function EnhancedHomeworkSubmission({
  assignment,
  onSubmissionComplete,
  onBack
}: EnhancedHomeworkSubmissionProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDraft, setIsDraft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const { toast } = useToast();

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const timeRemaining = dueDate.getTime() - now.getTime();
  const isOverdue = timeRemaining < 0;
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  React.useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB limit.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!content.trim() && files.length === 0) {
      toast({
        title: "Nothing to Save",
        description: "Please add some content or attach files before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save as draft (in real implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Draft Saved",
        description: "Your work has been saved as a draft.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast({
        title: "No Content to Submit",
        description: "Please add written content or attach files before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await assignmentService.submitAssignment(
        assignment.id,
        'current-student-id', // Would get from auth context
        content,
        files
      );

      toast({
        title: "Assignment Submitted!",
        description: `Your submission for "${assignment.title}" has been received.`,
      });

      onSubmissionComplete();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressColor = () => {
    if (isOverdue) return "bg-red-500";
    if (hoursRemaining < 24) return "bg-orange-500";
    return "bg-green-500";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onBack} className="p-0 h-auto">
              ← Back
            </Button>
          </div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-gray-600">{assignment.description}</p>
        </div>
        
        <div className="text-right space-y-2">
          <div className="flex items-center gap-2">
            {isOverdue ? (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {hoursRemaining}h remaining
              </Badge>
            )}
            <Badge variant="secondary">{assignment.points} points</Badge>
          </div>
          <div className="text-sm text-gray-600">
            Due: {dueDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Time Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Time Remaining</span>
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {isOverdue ? "Overdue" : `${hoursRemaining} hours left`}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ 
              width: isOverdue ? '100%' : `${Math.max(0, Math.min(100, 100 - (hoursRemaining / 168) * 100))}%` 
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{assignment.instructions}</p>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Tabs defaultValue="write" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Written Response</TabsTrigger>
          <TabsTrigger value="files">File Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Response</CardTitle>
                <div className="text-sm text-gray-600">
                  {wordCount} words
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your response here..."
                rows={12}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="block mb-2">Upload Files</Label>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, Word documents, images, text files, ZIP archives (max 10MB each)
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Attached Files ({files.length})</Label>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              disabled={isSubmitting || (!content.trim() && files.length === 0)}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit Assignment
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Assignment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit this assignment? You won't be able to make changes after submission.
                {isOverdue && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    This assignment is overdue. Late submissions may receive reduced points.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
