
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap } from "lucide-react";
import { ContentTypeSelector } from "./ContentTypeSelector";

interface GenerationFormProps {
  topic: string;
  setTopic: (value: string) => void;
  level: 'beginner' | 'intermediate' | 'advanced';
  setLevel: (value: 'beginner' | 'intermediate' | 'advanced') => void;
  contentType: 'worksheet' | 'activity' | 'lesson_plan' | 'quiz' | 'flashcards';
  setContentType: (value: 'worksheet' | 'activity' | 'lesson_plan' | 'quiz' | 'flashcards') => void;
  duration: string;
  setDuration: (value: string) => void;
  specificRequirements: string;
  setSpecificRequirements: (value: string) => void;
  learningObjectives: string[];
  setLearningObjectives: (objectives: string[]) => void;
  newObjective: string;
  setNewObjective: (value: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function GenerationForm({
  topic,
  setTopic,
  level,
  setLevel,
  contentType,
  setContentType,
  duration,
  setDuration,
  specificRequirements,
  setSpecificRequirements,
  learningObjectives,
  setLearningObjectives,
  newObjective,
  setNewObjective,
  isGenerating,
  onGenerate
}: GenerationFormProps) {
  const levels = [
    { value: 'beginner', label: 'Beginner (A1-A2)' },
    { value: 'intermediate', label: 'Intermediate (B1-B2)' },
    { value: 'advanced', label: 'Advanced (C1-C2)' }
  ];

  const contentTypes = [
    { value: 'flashcards', label: 'Flashcards', time: '3s' },
    { value: 'quiz', label: 'Quiz', time: '5s' },
    { value: 'worksheet', label: 'Worksheet', time: '8s' },
    { value: 'activity', label: 'Activity', time: '12s' },
    { value: 'lesson_plan', label: 'Lesson Plan', time: '15s' }
  ];

  const selectedContentType = contentTypes.find(type => type.value === contentType);

  const addLearningObjective = () => {
    if (newObjective.trim() && !learningObjectives.includes(newObjective.trim())) {
      setLearningObjectives([...learningObjectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const removeLearningObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 space-y-4">
      <ContentTypeSelector 
        contentType={contentType}
        onContentTypeChange={setContentType}
      />

      {/* Topic and Level */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="topic">Topic *</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Animals, Food, Travel"
          />
        </div>
        <div>
          <Label htmlFor="level">Level *</Label>
          <Select value={level} onValueChange={(value) => setLevel(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levels.map((levelOption) => (
                <SelectItem key={levelOption.value} value={levelOption.value}>
                  {levelOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration */}
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="10"
          max="120"
        />
      </div>

      {/* Learning Objectives */}
      <div>
        <Label>Learning Objectives (Optional)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder="Add learning objective..."
            onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
          />
          <Button size="sm" onClick={addLearningObjective}>Add</Button>
        </div>
        {learningObjectives.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {learningObjectives.map((objective, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeLearningObjective(index)}
              >
                {objective} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Specific Requirements */}
      <div>
        <Label htmlFor="requirements">Specific Requirements (Optional)</Label>
        <Textarea
          id="requirements"
          value={specificRequirements}
          onChange={(e) => setSpecificRequirements(e.target.value)}
          placeholder="Any specific requirements or focus areas..."
          rows={2}
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={isGenerating || !topic.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap size={16} className="mr-2" />
            Generate {selectedContentType?.label} (~{selectedContentType?.time})
          </>
        )}
      </Button>
    </div>
  );
}
