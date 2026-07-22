
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Clock, CheckCircle, Circle } from "lucide-react";

interface LessonPlanOverviewProps {
  currentUser?: {
    role: 'teacher' | 'student';
    name: string;
  };
}

export function LessonPlanOverview({ 
  currentUser = { role: 'teacher', name: 'Teacher' }
}: LessonPlanOverviewProps) {
  const currentLesson = {
    title: "Past Tense Mastery",
    objective: "Master regular and irregular past tense verbs through systematic building",
    duration: 45,
    timeElapsed: 18,
    phase: "Practice",
    activities: [
      { name: "Welcome Ritual", completed: true, duration: 3 },
      { name: "Warm-up Hook", completed: true, duration: 5 },
      { name: "Grammar Presentation", completed: true, duration: 10 },
      { name: "Guided Practice", completed: false, duration: 15, current: true },
      { name: "Independent Production", completed: false, duration: 10 },
      { name: "Review & Reflect", completed: false, duration: 2 }
    ],
    focus: ["Past Tense", "Irregular Verbs", "Storytelling"],
    nlpAnchor: "Feel confident telling stories about your past adventures",
    homework: "Write 5 sentences about your weekend using past tense"
  };

  const progressPercentage = (currentLesson.timeElapsed / currentLesson.duration) * 100;
  const completedActivities = currentLesson.activities.filter(a => a.completed).length;

  return (
    <div className="space-y-3">
      {/* Lesson Header */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-semibold text-sm">{currentLesson.title}</h4>
            <Badge variant="secondary" className="text-xs mt-1">
              {currentLesson.phase}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-blue-600">{currentLesson.timeElapsed}m</div>
            <div className="text-xs text-gray-500">of {currentLesson.duration}m</div>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </Card>

      {/* Lesson Objective */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target size={14} />
            Today's Objective
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-xs text-gray-700">{currentLesson.objective}</p>
        </CardContent>
      </Card>

      {/* Lesson Activities */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen size={14} />
            Lesson Structure
            <Badge variant="outline" className="text-xs ml-auto">
              {completedActivities}/{currentLesson.activities.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          {currentLesson.activities.map((activity, index) => (
            <div key={index} className={`flex items-center gap-2 p-2 rounded-lg ${
              activity.current ? 'bg-blue-50 border border-blue-200' : 
              activity.completed ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              {activity.completed ? (
                <CheckCircle size={12} className="text-green-600" />
              ) : activity.current ? (
                <Clock size={12} className="text-blue-600" />
              ) : (
                <Circle size={12} className="text-gray-400" />
              )}
              <div className="flex-1">
                <div className="text-xs font-medium">{activity.name}</div>
                {activity.current && (
                  <div className="text-xs text-blue-600">In Progress</div>
                )}
              </div>
              <div className="text-xs text-gray-500">{activity.duration}m</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target size={14} />
            Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-1">
            {currentLesson.focus.map((focus, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {focus}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* NLP Anchor */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm text-purple-700">
            Confidence Anchor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-xs italic text-purple-600">{currentLesson.nlpAnchor}</p>
        </CardContent>
      </Card>

      {/* Homework Preview */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen size={14} />
            Today's Homework
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-xs text-gray-700">{currentLesson.homework}</p>
        </CardContent>
      </Card>
    </div>
  );
}
