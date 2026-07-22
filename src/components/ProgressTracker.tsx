
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressTrackerProps {
  vocabProgress: number;
  grammarProgress: number;
  listeningProgress: number;
  speakingProgress: number;
  readingProgress: number;
  className?: string;
}

export function ProgressTracker({
  vocabProgress = 0,
  grammarProgress = 0,
  listeningProgress = 0,
  speakingProgress = 0,
  readingProgress = 0,
  className = "",
}: ProgressTrackerProps) {
  const { languageText } = useLanguage();
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{languageText.learningProgress}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressItem 
          label={languageText.vocabulary} 
          value={vocabProgress} 
          color="bg-purple" 
        />
        <ProgressItem 
          label={languageText.grammar} 
          value={grammarProgress} 
          color="bg-teal" 
        />
        <ProgressItem 
          label={languageText.listening} 
          value={listeningProgress} 
          color="bg-orange" 
        />
        <ProgressItem 
          label={languageText.speakingSkill} 
          value={speakingProgress} 
          color="bg-yellow" 
        />
        <ProgressItem 
          label={languageText.reading} 
          value={readingProgress} 
          color="bg-blue-500" 
        />
      </CardContent>
    </Card>
  );
}

interface ProgressItemProps {
  label: string;
  value: number;
  color: string;
}

function ProgressItem({ label, value, color }: ProgressItemProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-2">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </Progress>
    </div>
  );
}
