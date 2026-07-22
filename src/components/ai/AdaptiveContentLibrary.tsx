import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface AdaptiveContentLibraryProps {
  studentId: string;
  cefrLevel: string;
  content: any[];
  onContentInteraction?: () => void;
}

export const AdaptiveContentLibrary: React.FC<AdaptiveContentLibraryProps> = ({
  content
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Adaptive Content Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {content.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <Badge variant="outline">{item.cefr_level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {item.content_type} • Level {item.difficulty_level}/10
                </p>
                <div className="flex gap-2">
                  {item.tags?.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};