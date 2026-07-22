import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  ChevronDown,
  ChevronRight,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Layers,
  Accessibility
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useLessonQualityCheck, QualityIssue, QualityReport } from '@/hooks/useLessonQualityCheck';

interface LessonSlide {
  id?: string;
  type?: string;
  screenType?: string;
  title?: string;
  content?: any;
  phase?: string;
  teacherNotes?: string;
}

interface LessonQualityCheckerProps {
  lessonTitle: string;
  slides: LessonSlide[];
  onSlideClick?: (slideIndex: number) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  content: <BookOpen className="h-4 w-4" />,
  ipa: <MessageSquare className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
  structure: <Layers className="h-4 w-4" />,
  accessibility: <Accessibility className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  content: 'Content',
  ipa: 'IPA/Pronunciation',
  quiz: 'Quiz/Assessment',
  structure: 'Structure',
  accessibility: 'Accessibility',
};

const severityConfig = {
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Info',
  },
};

function GradeDisplay({ grade, score }: { grade: string; score: number }) {
  const gradeColors: Record<string, string> = {
    'A': 'text-green-600 bg-green-500/10 border-green-500/30',
    'B': 'text-blue-600 bg-blue-500/10 border-blue-500/30',
    'C': 'text-amber-600 bg-amber-500/10 border-amber-500/30',
    'D': 'text-orange-600 bg-orange-500/10 border-orange-500/30',
    'F': 'text-red-600 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className={cn(
      "w-16 h-16 rounded-xl border-2 flex items-center justify-center",
      gradeColors[grade]
    )}>
      <span className="text-3xl font-bold">{grade}</span>
    </div>
  );
}

function IssueItem({ 
  issue, 
  onSlideClick 
}: { 
  issue: QualityIssue; 
  onSlideClick?: (index: number) => void;
}) {
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
        config.bg,
        config.border
      )}
      onClick={() => issue.slideIndex >= 0 && onSlideClick?.(issue.slideIndex)}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {issue.slideIndex >= 0 && (
            <Badge variant="outline" className="text-xs">
              Slide {issue.slideIndex + 1}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {issue.slideType}
          </Badge>
        </div>
        <p className="text-sm text-foreground">{issue.message}</p>
        {issue.field && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {issue.field}
          </p>
        )}
      </div>
    </div>
  );
}

function CategorySection({ 
  category, 
  issues,
  onSlideClick 
}: { 
  category: string;
  issues: QualityIssue[];
  onSlideClick?: (index: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(issues.some(i => i.severity === 'error'));

  if (issues.length === 0) return null;

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between h-auto py-3 px-4 hover:bg-muted"
        >
          <div className="flex items-center gap-3">
            {categoryIcons[category]}
            <span className="font-medium">{categoryLabels[category]}</span>
          </div>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} errors
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                {warningCount} warnings
              </Badge>
            )}
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-2">
          {issues.map((issue, idx) => (
            <IssueItem key={idx} issue={issue} onSlideClick={onSlideClick} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function LessonQualityChecker({ 
  lessonTitle, 
  slides,
  onSlideClick 
}: LessonQualityCheckerProps) {
  const report = useLessonQualityCheck(slides);

  const issuesByCategory = {
    content: report.issues.filter(i => i.category === 'content'),
    ipa: report.issues.filter(i => i.category === 'ipa'),
    quiz: report.issues.filter(i => i.category === 'quiz'),
    structure: report.issues.filter(i => i.category === 'structure'),
    accessibility: report.issues.filter(i => i.category === 'accessibility'),
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Quality Report
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{lessonTitle}</p>
          </div>
          <GradeDisplay grade={report.grade} score={report.score} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quality Score</span>
            <span className="font-medium">{report.score}/100</span>
          </div>
          <Progress value={report.score} className="h-2" />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{report.summary.totalSlides}</p>
            <p className="text-xs text-muted-foreground">Slides</p>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{report.summary.errorCount}</p>
            <p className="text-xs text-red-600">Errors</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{report.summary.warningCount}</p>
            <p className="text-xs text-amber-600">Warnings</p>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{report.summary.infoCount}</p>
            <p className="text-xs text-blue-600">Info</p>
          </div>
        </div>

        {report.issues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-foreground">Perfect Score!</p>
            <p className="text-sm text-muted-foreground">
              No issues found. This lesson is ready for publishing.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {Object.entries(issuesByCategory).map(([category, issues]) => (
                <CategorySection 
                  key={category}
                  category={category}
                  issues={issues}
                  onSlideClick={onSlideClick}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
