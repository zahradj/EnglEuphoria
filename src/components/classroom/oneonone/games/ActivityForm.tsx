
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatedActivity {
  id: string;
  title: string;
  type: string;
  description: string;
  content: any;
  createdAt: Date;
  isAIGenerated?: boolean;
}

interface ActivityFormProps {
  onActivityCreated: (activity: CreatedActivity) => void;
  onCancel: () => void;
}

export function ActivityForm({ onActivityCreated, onCancel }: ActivityFormProps) {
  const [activityTitle, setActivityTitle] = useState("");
  const [activityType, setActivityType] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [words, setWords] = useState<string[]>([""]);
  const { toast } = useToast();

  const activityTypes = [
    { value: "quiz", label: "Quiz Questions" },
    { value: "word-match", label: "Word Matching" },
    { value: "fill-blank", label: "Fill in the Blanks" },
    { value: "story", label: "Story Builder" },
    { value: "conversation", label: "Conversation Practice" }
  ];

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addWord = () => {
    setWords([...words, ""]);
  };

  const updateWord = (index: number, value: string) => {
    const updated = [...words];
    updated[index] = value;
    setWords(updated);
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const createActivity = () => {
    if (!activityTitle || !activityType || !activityDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newActivity: CreatedActivity = {
      id: Date.now().toString(),
      title: activityTitle,
      type: activityType,
      description: activityDescription,
      content: {
        questions: activityType === "quiz" || activityType === "fill-blank" ? questions.filter(q => q.trim()) : [],
        words: activityType === "word-match" ? words.filter(w => w.trim()) : []
      },
      createdAt: new Date(),
      isAIGenerated: false
    };

    onActivityCreated(newActivity);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Create New Activity</h3>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Activity Title *</Label>
          <Input
            id="title"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            placeholder="e.g., Animal Vocabulary Quiz"
          />
        </div>

        <div>
          <Label htmlFor="type">Activity Type *</Label>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={activityDescription}
          onChange={(e) => setActivityDescription(e.target.value)}
          placeholder="Describe what this activity teaches..."
          rows={2}
        />
      </div>

      {(activityType === "quiz" || activityType === "fill-blank") && (
        <div>
          <Label>Questions</Label>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  disabled={questions.length === 1}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Plus size={14} className="mr-1" />
              Add Question
            </Button>
          </div>
        </div>
      )}

      {activityType === "word-match" && (
        <div>
          <Label>Words/Vocabulary</Label>
          <div className="space-y-2">
            {words.map((word, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={word}
                  onChange={(e) => updateWord(index, e.target.value)}
                  placeholder={`Word ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeWord(index)}
                  disabled={words.length === 1}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addWord}>
              <Plus size={14} className="mr-1" />
              Add Word
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={createActivity} className="bg-green-500 hover:bg-green-600">
          <Save size={16} className="mr-2" />
          Create Activity
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
