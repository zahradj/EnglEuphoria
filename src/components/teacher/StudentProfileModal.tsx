import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Heart,
  BookOpen,
  Award
} from "lucide-react";
import { ScheduledLesson } from "@/services/lessonService";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: ScheduledLesson;
}

export const StudentProfileModal = ({ isOpen, onClose, lesson }: StudentProfileModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Student Profile: {lesson.student_name}
          </DialogTitle>
          <DialogDescription>
            Complete profile information for lesson preparation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-mono font-medium">
                    #{lesson.student_id?.slice(-6).toUpperCase() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CEFR Level</p>
                  <Badge variant="outline" className="mt-1">
                    {lesson.student_cefr_level || 'Not assessed'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lesson Duration</p>
                  <Badge 
                    variant="secondary" 
                    className={lesson.duration === 25 ? "mt-1 bg-blue-500/10 text-blue-600 border-blue-500/20" : "mt-1 bg-purple-500/10 text-purple-600 border-purple-500/20"}
                  >
                    {lesson.duration} minutes
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Learning Style</p>
                  <p className="font-medium capitalize">
                    {lesson.student_learning_style || 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Learning Goal */}
          {lesson.student_long_term_goal && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Learning Goal</h4>
                    <p className="text-sm text-muted-foreground">
                      {lesson.student_long_term_goal}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {lesson.student_interests && lesson.student_interests.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {lesson.student_interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {lesson.student_strengths && lesson.student_strengths.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2 text-success">Strengths</h4>
                    <div className="flex flex-wrap gap-2">
                      {lesson.student_strengths.map((strength, index) => (
                        <Badge key={index} variant="outline" className="border-success/50 text-success">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Areas to Improve (Gaps) */}
          {lesson.student_gaps && lesson.student_gaps.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2 text-warning">Areas to Focus On</h4>
                    <div className="flex flex-wrap gap-2">
                      {lesson.student_gaps.map((gap, index) => (
                        <Badge key={index} variant="outline" className="border-warning/50 text-warning">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teaching Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Teaching Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    {lesson.student_learning_style && (
                      <li>Student prefers {lesson.student_learning_style} learning methods</li>
                    )}
                    {lesson.student_interests && lesson.student_interests.length > 0 && (
                      <li>Incorporate topics related to: {lesson.student_interests.slice(0, 2).join(', ')}</li>
                    )}
                    {lesson.student_gaps && lesson.student_gaps.length > 0 && (
                      <li>Focus practice on: {lesson.student_gaps[0]}</li>
                    )}
                    <li>Current level: {lesson.student_cefr_level || 'Assessment pending'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
