
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wand2, Grid3x3, RotateCcw, Shuffle, CheckCircle, Play } from "lucide-react";

interface CreateGameAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAssignment: (assignment: any) => void;
}

export function CreateGameAssignmentDialog({ isOpen, onClose, onCreateAssignment }: CreateGameAssignmentDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedGameType, setSelectedGameType] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [gameContent, setGameContent] = useState("");

  const gameTypes = [
    {
      id: "flashcards",
      title: "Vocabulary Flashcards",
      description: "Practice new words with interactive cards",
      icon: RotateCcw,
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: "word-match",
      title: "Word Matching",
      description: "Match words with their meanings",
      icon: CheckCircle,
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: "sentence-builder",
      title: "Sentence Builder",
      description: "Drag words to create proper sentences",
      icon: Shuffle,
      color: "bg-green-100 text-green-700"
    },
    {
      id: "quiz-spinner",
      title: "Quiz Spinner",
      description: "Spin the wheel for random questions",
      icon: Play,
      color: "bg-orange-100 text-orange-700"
    },
    {
      id: "enhanced-drag-drop",
      title: "Drag & Drop",
      description: "Interactive drag and drop activities",
      icon: Grid3x3,
      color: "bg-emerald-100 text-emerald-700"
    }
  ];

  const students = [
    "Alex Johnson",
    "Maria Garcia", 
    "Emma Johnson",
    "Carlos Martinez",
    "Sophia Ahmed",
    "Li Wei"
  ];

  const handleStudentToggle = (studentName: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentName) 
        ? prev.filter(s => s !== studentName)
        : [...prev, studentName]
    );
  };

  const handleCreateAssignment = () => {
    const assignment = {
      title,
      gameType: selectedGameType,
      instructions,
      difficulty,
      assignedTo: selectedStudents,
      gameContent
    };
    
    onCreateAssignment(assignment);
    
    // Reset form
    setStep(1);
    setSelectedGameType("");
    setTitle("");
    setInstructions("");
    setDifficulty("");
    setSelectedStudents([]);
    setGameContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Game Assignment - Step {step} of 3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Choose Game Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {gameTypes.map((game) => (
                <Card 
                  key={game.id}
                  className={`cursor-pointer transition-all ${
                    selectedGameType === game.id ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedGameType(game.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${game.color} flex items-center justify-center`}>
                        <game.icon size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{game.title}</CardTitle>
                        <p className="text-sm text-gray-600">{game.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={!selectedGameType}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Assignment Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Vocabulary Practice - Animals"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions for Students</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Provide clear instructions for this assignment..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Game Content (Questions, Words, etc.)</Label>
              <Textarea
                id="content"
                value={gameContent}
                onChange={(e) => setGameContent(e.target.value)}
                placeholder="Enter content for the game (one item per line)..."
                rows={6}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!title || !difficulty || !gameContent}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Assign to Students</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {students.map((student) => (
                <div key={student} className="flex items-center space-x-2">
                  <Checkbox
                    id={student}
                    checked={selectedStudents.includes(student)}
                    onCheckedChange={() => handleStudentToggle(student)}
                  />
                  <Label htmlFor={student} className="text-sm font-medium">
                    {student}
                  </Label>
                </div>
              ))}
            </div>

            {selectedStudents.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Students:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((student) => (
                    <Badge key={student} variant="secondary">
                      {student}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={handleCreateAssignment}
                disabled={selectedStudents.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Assignment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
