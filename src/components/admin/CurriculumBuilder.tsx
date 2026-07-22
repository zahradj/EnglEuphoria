import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BookOpen, ChevronRight, ChevronDown, Plus, Edit, Trash2, Eye, Loader2, Baby, GraduationCap, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Lesson {
  id: string;
  title: string;
  difficulty_level: string;
  is_published: boolean;
}

interface Level {
  id: string;
  name: string;
  cefr_level: string;
  lessons: Lesson[];
}

interface Track {
  id: string;
  name: string;
  target_system: string;
  levels: Level[];
}

export const CurriculumBuilder = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      // Fetch tracks
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .order('name');

      if (tracksError) throw tracksError;

      // Fetch levels
      const { data: levelsData, error: levelsError } = await supabase
        .from('curriculum_levels')
        .select('*')
        .order('level_order');

      if (levelsError) throw levelsError;

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('curriculum_lessons')
        .select('*')
        .order('sequence_order');

      if (lessonsError) throw lessonsError;

      // Organize data into tree structure
      const organizedTracks: Track[] = (tracksData || []).map(track => {
        const trackLevels = (levelsData || [])
          .filter(level => level.track_id === track.id)
          .map(level => ({
            id: level.id,
            name: level.name,
            cefr_level: level.cefr_level,
            lessons: (lessonsData || [])
              .filter(lesson => lesson.level_id === level.id)
              .map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                difficulty_level: lesson.difficulty_level,
                is_published: lesson.is_published,
              })),
          }));

        return {
          id: track.id,
          name: track.name,
          target_system: track.target_system,
          levels: trackLevels,
        };
      });

      setTracks(organizedTracks);
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrack = (trackId: string) => {
    setExpandedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const toggleLevel = (levelId: string) => {
    setExpandedLevels(prev => {
      const next = new Set(prev);
      if (next.has(levelId)) {
        next.delete(levelId);
      } else {
        next.add(levelId);
      }
      return next;
    });
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'kids':
        return <Baby className="h-5 w-5 text-orange-500" />;
      case 'teen':
        return <GraduationCap className="h-5 w-5 text-purple-500" />;
      case 'adult':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'kids': return 'border-orange-200 bg-orange-50';
      case 'teen': return 'border-purple-200 bg-purple-50';
      case 'adult': return 'border-blue-200 bg-blue-50';
      default: return 'border-border bg-muted/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Curriculum Builder
          </h1>
          <p className="text-muted-foreground">
            Manage lessons across all learning systems
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Track
        </Button>
      </div>

      {tracks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No curriculum tracks found</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create First Track
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tracks.map(track => (
            <Card key={track.id} className={getSystemColor(track.target_system)}>
              <Collapsible
                open={expandedTracks.has(track.id)}
                onOpenChange={() => toggleTrack(track.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedTracks.has(track.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        {getSystemIcon(track.target_system)}
                        <div>
                          <CardTitle className="text-lg">{track.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {track.levels.length} levels • {track.levels.reduce((sum, l) => sum + l.lessons.length, 0)} lessons
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pl-12 space-y-3">
                    {track.levels.map(level => (
                      <Collapsible
                        key={level.id}
                        open={expandedLevels.has(level.id)}
                        onOpenChange={() => toggleLevel(level.id)}
                      >
                        <div className="border rounded-lg bg-background">
                          <CollapsibleTrigger asChild>
                            <div className="p-3 cursor-pointer hover:bg-muted/30 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {expandedLevels.has(level.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="font-medium">{level.name}</span>
                                <Badge variant="outline">{level.cefr_level}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  ({level.lessons.length} lessons)
                                </span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Lesson
                              </Button>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t p-3 space-y-2">
                              {level.lessons.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                  No lessons yet
                                </p>
                              ) : (
                                level.lessons.map(lesson => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                                      <span>{lesson.title}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {lesson.difficulty_level}
                                      </Badge>
                                      {lesson.is_published ? (
                                        <Badge className="bg-green-100 text-green-700 text-xs">
                                          Published
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs">
                                          Draft
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
