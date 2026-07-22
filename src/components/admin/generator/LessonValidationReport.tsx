import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Info
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ValidationResult, ValidationError, ValidationWarning } from "@/lib/lessonValidator";

interface LessonValidationReportProps {
  result: ValidationResult;
  onDismiss?: () => void;
  compact?: boolean;
}

export const LessonValidationReport: React.FC<LessonValidationReportProps> = ({
  result,
  onDismiss,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(!compact);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIcon = () => {
    if (result.isValid && result.score >= 80) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (result.isValid) {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const criticalErrors = result.errors.filter(e => e.severity === 'critical');
  const regularErrors = result.errors.filter(e => e.severity === 'error');

  if (compact && result.isValid && result.warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-green-600 font-medium">{result.score}% Complete</span>
      </div>
    );
  }

  return (
    <Card className={`border-l-4 ${result.isValid ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <CardTitle className="text-base">
                Lesson Validation
              </CardTitle>
              <Badge 
                variant={result.isValid ? "default" : "destructive"}
                className={result.isValid ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
              >
                {result.isValid ? "Valid" : "Invalid"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </span>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2">
            <Progress 
              value={result.score} 
              className="h-2"
              style={{
                '--progress-background': getProgressColor(result.score)
              } as React.CSSProperties}
            />
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold">{result.slideCount}/{result.expectedSlideCount}</div>
                <div className="text-xs text-muted-foreground">Slides</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold text-red-600">{result.errors.length}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold text-yellow-600">{result.warnings.length}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
            </div>

            {/* Phase Coverage */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">PPP Phase Coverage</h4>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex-1 justify-center">
                  Presentation: {result.phaseCoverage.presentation}%
                </Badge>
                <Badge variant="outline" className="flex-1 justify-center">
                  Practice: {result.phaseCoverage.practice}%
                </Badge>
                <Badge variant="outline" className="flex-1 justify-center">
                  Production: {result.phaseCoverage.production}%
                </Badge>
              </div>
            </div>

            {/* Critical Errors */}
            {criticalErrors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Critical Errors ({criticalErrors.length})
                </h4>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {criticalErrors.map((error, i) => (
                      <ErrorItem key={i} error={error} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Regular Errors */}
            {regularErrors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Errors ({regularErrors.length})
                </h4>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {regularErrors.slice(0, 10).map((error, i) => (
                      <ErrorItem key={i} error={error} />
                    ))}
                    {regularErrors.length > 10 && (
                      <p className="text-xs text-muted-foreground pl-2">
                        ... and {regularErrors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-yellow-600">
                  <Info className="h-4 w-4" />
                  Warnings ({result.warnings.length})
                </h4>
                <ScrollArea className="max-h-24">
                  <div className="space-y-1">
                    {result.warnings.slice(0, 5).map((warning, i) => (
                      <WarningItem key={i} warning={warning} />
                    ))}
                    {result.warnings.length > 5 && (
                      <p className="text-xs text-muted-foreground pl-2">
                        ... and {result.warnings.length - 5} more warnings
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* No issues */}
            {result.errors.length === 0 && result.warnings.length === 0 && (
              <div className="text-center py-4 text-green-600">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">All validation checks passed!</p>
              </div>
            )}

            {/* Dismiss button */}
            {onDismiss && (
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={onDismiss}>
                  Dismiss
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const ErrorItem: React.FC<{ error: ValidationError }> = ({ error }) => (
  <div className="flex items-start gap-2 text-xs p-2 bg-red-50 dark:bg-red-950/20 rounded">
    <Badge 
      variant="destructive" 
      className="text-[10px] px-1 py-0 shrink-0"
    >
      {error.severity === 'critical' ? 'CRITICAL' : 'ERROR'}
    </Badge>
    <div className="flex-1 min-w-0">
      <p className="text-red-800 dark:text-red-200 break-words">{error.message}</p>
      <p className="text-red-600/70 dark:text-red-400/70 text-[10px] font-mono mt-0.5">
        {error.field}
      </p>
    </div>
  </div>
);

const WarningItem: React.FC<{ warning: ValidationWarning }> = ({ warning }) => (
  <div className="flex items-start gap-2 text-xs p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
    <Badge 
      variant="outline" 
      className="text-[10px] px-1 py-0 shrink-0 border-yellow-500 text-yellow-700"
    >
      WARN
    </Badge>
    <div className="flex-1 min-w-0">
      <p className="text-yellow-800 dark:text-yellow-200 break-words">{warning.message}</p>
      <p className="text-yellow-600/70 dark:text-yellow-400/70 text-[10px] font-mono mt-0.5">
        {warning.field}
      </p>
    </div>
  </div>
);

// Compact badge for showing in headers
export const ValidationScoreBadge: React.FC<{ score: number; isValid: boolean }> = ({ 
  score, 
  isValid 
}) => {
  const getVariant = () => {
    if (!isValid) return "destructive";
    if (score >= 80) return "default";
    return "secondary";
  };

  const getClassName = () => {
    if (!isValid) return "";
    if (score >= 80) return "bg-green-100 text-green-800 hover:bg-green-200";
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  };

  return (
    <Badge variant={getVariant()} className={getClassName()}>
      {score}% {isValid ? "✓" : "✗"}
    </Badge>
  );
};
