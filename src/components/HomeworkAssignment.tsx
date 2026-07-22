
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Check, File } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  completed: boolean;
}

interface HomeworkAssignmentProps {
  assignment: Assignment;
  onComplete: (id: string, submission: string) => void;
  className?: string;
}

export function HomeworkAssignment({ 
  assignment, 
  onComplete,
  className = "" 
}: HomeworkAssignmentProps) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const { languageText } = useLanguage();
  const { toast } = useToast();

  const handleFileChange = () => {
    setFileAttached(true);
    toast({
      title: languageText.fileAttached,
      description: languageText.fileAttachedDesc,
    });
  };
  
  const handleSubmit = () => {
    if (!answer && !fileAttached) {
      toast({
        title: languageText.submissionRequired,
        description: languageText.provideAnswer,
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onComplete(assignment.id, answer);
      setSubmitting(false);
      
      toast({
        title: languageText.homeworkSubmitted,
        description: languageText.earnedPoints.replace("{}", assignment.points.toString()),
      });
    }, 1000);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{assignment.title}</CardTitle>
          <div className="flex items-center gap-1 text-sm font-medium text-yellow-dark">
            <span>{assignment.points}</span>
            <span className="text-xs">{languageText.points}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {languageText.dueDate}: {assignment.dueDate}
        </p>
      </CardHeader>
      
      <CardContent>
        <p className="mb-4">{assignment.description}</p>
        
        {assignment.completed ? (
          <div className="flex items-center gap-2 py-2 px-4 bg-green-100 text-green-800 rounded-lg">
            <Check size={18} />
            <span>{languageText.completed}</span>
          </div>
        ) : (
          <>
            <Textarea
              placeholder={languageText.typeAnswer}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="mb-4"
            />
            
            <div className="flex items-center gap-2 mb-2">
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleFileChange}
              >
                <Upload size={16} />
                {languageText.attachFile}
              </Button>
              
              {fileAttached && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <File size={14} />
                  <span>homework-file.pdf</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      
      {!assignment.completed && (
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            disabled={submitting || (answer.trim() === "" && !fileAttached)}
            className="w-full"
          >
            {submitting ? languageText.submitting : languageText.submitHomework}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
