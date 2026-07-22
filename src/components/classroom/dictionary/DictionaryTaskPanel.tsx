
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SoundButton } from "@/components/ui/sound-button";
import { Search, Volume2, CheckCircle, Plus, Send } from "lucide-react";
import { useDictionaryService } from "@/components/classroom/oneonone/dictionary/useDictionaryService";
import { audioService } from "@/services/audioService";

interface DictionaryTask {
  id: string;
  word: string;
  definition: string;
  studentAnswer?: string;
  isCompleted: boolean;
  createdAt: Date;
}

interface DictionaryTaskPanelProps {
  isTeacher: boolean;
  onTaskComplete?: (task: DictionaryTask) => void;
}

export function DictionaryTaskPanel({ isTeacher, onTaskComplete }: DictionaryTaskPanelProps) {
  const [currentWord, setCurrentWord] = useState("");
  const [tasks, setTasks] = useState<DictionaryTask[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  
  const { 
    definition, 
    isLoading, 
    searchWord, 
    playPronunciation 
  } = useDictionaryService();

  const createTask = async () => {
    if (!currentWord.trim()) return;
    
    await searchWord(currentWord.trim(), 'en');
    
    if (definition) {
      const newTask: DictionaryTask = {
        id: Date.now().toString(),
        word: definition.word,
        definition: definition.definition,
        isCompleted: false,
        createdAt: new Date()
      };
      
      setTasks(prev => [newTask, ...prev]);
      setCurrentWord("");
      audioService.playSuccessSound();
    }
  };

  const handleStudentAnswer = (taskId: string, answer: string) => {
    setStudentAnswers(prev => ({ ...prev, [taskId]: answer }));
  };

  const submitAnswer = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const answer = studentAnswers[taskId];
    
    if (task && answer) {
      const updatedTask = { ...task, studentAnswer: answer, isCompleted: true };
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      onTaskComplete?.(updatedTask);
      audioService.playSuccessSound();
    }
  };

  const handlePronunciation = (word: string) => {
    audioService.playPronunciation(word);
  };

  return (
    <Card className="p-4 h-full flex flex-col">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Search size={16} />
        Dictionary Tasks
      </h3>

      {/* Teacher: Create Task Interface */}
      {isTeacher && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Create New Task</h4>
          <div className="flex gap-2 mb-2">
            <Input
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              placeholder="Enter word to define..."
              onKeyDown={(e) => e.key === 'Enter' && createTask()}
            />
            <SoundButton 
              onClick={createTask} 
              disabled={isLoading}
              soundType="success"
            >
              <Plus size={16} />
            </SoundButton>
          </div>
          
          {/* Show current definition preview */}
          {definition && (
            <div className="text-sm bg-white p-2 rounded border">
              <div className="flex items-center gap-2 mb-1">
                <strong>{definition.word}</strong>
                <SoundButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePronunciation(definition.word)}
                  className="h-6 w-6 p-0"
                >
                  <Volume2 size={12} />
                </SoundButton>
              </div>
              <p className="text-gray-600">{definition.definition}</p>
            </div>
          )}
        </div>
      )}

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Search size={32} className="mx-auto mb-2 opacity-50" />
            <p>No dictionary tasks yet</p>
            {isTeacher && <p className="text-sm">Create your first task above</p>}
          </div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-lg">{task.word}</h4>
                    <SoundButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePronunciation(task.word)}
                      className="h-6 w-6 p-0"
                    >
                      <Volume2 size={12} />
                    </SoundButton>
                    {task.isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.definition}</p>
                  
                  {/* Student Answer Section */}
                  {!isTeacher && !task.isCompleted && (
                    <div className="mt-3">
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Your definition:
                      </label>
                      <div className="flex gap-2">
                        <Textarea
                          value={studentAnswers[task.id] || ''}
                          onChange={(e) => handleStudentAnswer(task.id, e.target.value)}
                          placeholder="Write what you think this word means..."
                          className="text-sm resize-none h-20"
                        />
                        <SoundButton
                          onClick={() => submitAnswer(task.id)}
                          disabled={!studentAnswers[task.id]?.trim()}
                          size="sm"
                          soundType="success"
                        >
                          <Send size={14} />
                        </SoundButton>
                      </div>
                    </div>
                  )}
                  
                  {/* Show student answer to teacher */}
                  {isTeacher && task.studentAnswer && (
                    <div className="mt-2 p-2 bg-green-50 rounded">
                      <label className="text-xs font-medium text-green-700 block mb-1">
                        Student Answer:
                      </label>
                      <p className="text-sm text-green-800">{task.studentAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
