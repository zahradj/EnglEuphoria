import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Save, Plus, Trash2, NotebookPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
}

export function StudentNotes({ isOpen, onClose }: StudentNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('student-notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('student-notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    setCurrentNote(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please add both a title and content for your note.",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();

    if (currentNote) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === currentNote.id 
          ? { ...note, title, content, timestamp: now }
          : note
      ));
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        timestamp: now
      };
      setNotes([newNote, ...notes]);
    }

    setIsEditing(false);
    setCurrentNote(null);
    setTitle('');
    setContent('');

    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully.",
    });
  };

  const editNote = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
      setIsEditing(false);
      setTitle('');
      setContent('');
    }
    
    toast({
      title: "Note Deleted",
      description: "Your note has been deleted.",
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentNote(null);
    setTitle('');
    setContent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5" />
            My Notes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[60vh]">
          {/* New Note Button */}
          {!isEditing && (
            <Button onClick={createNewNote} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Note
            </Button>
          )}

          {/* Note Editor */}
          {isEditing && (
            <Card>
              <CardHeader className="pb-3">
                <Input
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-medium"
                />
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={saveNote} className="flex items-center gap-1">
                    <Save className="h-4 w-4" />
                    Save Note
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes List */}
          {notes.length === 0 && !isEditing ? (
            <Card>
              <CardContent className="p-6 text-center">
                <NotebookPen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No notes yet. Create your first note to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{note.title}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editNote(note)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {note.timestamp.toLocaleDateString()} at {note.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-sm line-clamp-3">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}