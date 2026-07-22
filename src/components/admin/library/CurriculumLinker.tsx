import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Link, Search, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TaggingData } from './TaggingMatrix';

interface CurriculumLinkerProps {
  fileData: {
    file: File;
    type: string;
  };
  taggingData: TaggingData;
  onComplete: (lessonId?: string) => void;
  onBack: () => void;
}

interface Lesson {
  id: string;
  title: string;
  difficulty_level: string;
  target_system: string;
}

export const CurriculumLinker = ({ fileData, taggingData, onComplete, onBack }: CurriculumLinkerProps) => {
  const [linkToCurriculum, setLinkToCurriculum] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (linkToCurriculum) {
      fetchLessons();
    }
  }, [linkToCurriculum, taggingData.targetSystems]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, difficulty_level, target_system')
        .in('target_system', taggingData.targetSystems)
        .order('title');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async () => {
    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = fileData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `curriculum-materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('curriculum')
        .upload(filePath, fileData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('curriculum')
        .getPublicUrl(filePath);

      // Insert into curriculum_materials
      const { error: insertError } = await supabase
        .from('curriculum_materials')
        .insert({
          title: fileData.file.name,
          type: fileData.type,
          file_name: fileData.file.name,
          file_url: urlData.publicUrl,
          file_size: fileData.file.size,
          file_type: fileData.file.type,
          cefr_level: taggingData.proficiencyLevel,
          skill_focus: taggingData.skillTypes,
          visibility: taggingData.visibility,
          business_mode: taggingData.businessMode,
          level_id: selectedLesson || null,
          is_public: taggingData.visibility !== 'teacher_only',
          tags: taggingData.targetSystems,
        });

      if (insertError) throw insertError;

      onComplete(selectedLesson || undefined);
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
    }
  };

  const getSystemBadge = (system: string) => {
    switch (system) {
      case 'kids':
        return <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">Playground</span>;
      case 'teen':
        return <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">Academy</span>;
      case 'adult':
        return <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Hub</span>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Step 3: Curriculum Link (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label className="font-medium">Link to a specific lesson?</Label>
            <p className="text-sm text-muted-foreground">
              Attach this asset directly to a curriculum lesson
            </p>
          </div>
          <Switch checked={linkToCurriculum} onCheckedChange={setLinkToCurriculum} />
        </div>

        {linkToCurriculum && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredLessons.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No lessons found for selected systems
                  </p>
                ) : (
                  filteredLessons.map(lesson => (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedLesson === lesson.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSystemBadge(lesson.target_system)}
                          <span className="text-xs text-muted-foreground">
                            {lesson.difficulty_level}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted/30 space-y-2">
          <p className="font-medium">Upload Summary:</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• File: {fileData.file.name}</p>
            <p>• Systems: {taggingData.targetSystems.join(', ')}</p>
            <p>• Level: {taggingData.proficiencyLevel}</p>
            <p>• Skills: {taggingData.skillTypes.join(', ')}</p>
            <p>• Visibility: {taggingData.visibility.replace('_', ' ')}</p>
            {selectedLesson && <p>• Linked to lesson</p>}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Asset'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
