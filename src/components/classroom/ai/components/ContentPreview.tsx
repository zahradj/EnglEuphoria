import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Activity, BookOpen, Image } from 'lucide-react';

interface ContentPreviewProps {
  content: any;
}

export function ContentPreview({ content }: ContentPreviewProps) {
  if (!content) return null;

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Generated Content Preview</h3>
      
      {/* Worksheet Section */}
      {content.worksheet && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText size={16} />
              Worksheet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{content.worksheet.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {content.worksheet.content?.substring(0, 150)}...
            </p>
            <Badge variant="outline">Printable</Badge>
          </CardContent>
        </Card>
      )}

      {/* Interactive Activities Section */}
      {content.activities && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity size={16} />
              Interactive Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {content.activities.matchPairs && (
                <Badge variant="secondary">Match Pairs ({content.activities.matchPairs.length})</Badge>
              )}
              {content.activities.dragDropItems && (
                <Badge variant="secondary">Drag & Drop ({content.activities.dragDropItems.length})</Badge>
              )}
              {content.activities.clozeGaps && (
                <Badge variant="secondary">Cloze Exercise ({content.activities.clozeGaps.length} gaps)</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Section */}
      {content.vocabulary && content.vocabulary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen size={16} />
              Vocabulary ({content.vocabulary.length} words)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {content.vocabulary.slice(0, 6).map((word: any, index: number) => (
                <div key={index} className="p-2 bg-muted rounded text-sm">
                  <div className="font-medium">{word.word}</div>
                  <div className="text-xs text-muted-foreground">{word.partOfSpeech}</div>
                </div>
              ))}
              {content.vocabulary.length > 6 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  +{content.vocabulary.length - 6} more words
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images Section */}
      {content.vocabulary?.some((word: any) => word.imagePrompt) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Image size={16} />
              AI Image Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {content.vocabulary.filter((word: any) => word.imagePrompt).length} image prompts ready for AI generation
            </p>
            <Badge variant="outline">Auto-Generate Images</Badge>
          </CardContent>
        </Card>
      )}

      {/* Lesson Slides Section */}
      {content.slides && content.slides.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText size={16} />
              Lesson Slides ({content.slides.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {content.slides.map((slide: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {slide.type.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}