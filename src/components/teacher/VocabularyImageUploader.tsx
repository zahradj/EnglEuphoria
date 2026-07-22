import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Sparkles, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { uploadVocabularyImage, generateImageWithAI } from '@/utils/lessonImageUpload';
import { useToast } from '@/hooks/use-toast';
import { PLAYGROUND_CAST_PRESETS } from '@/constants/playgroundCastPresets';

const NO_CHARACTER = '__none__';


interface VocabularyImageUploaderProps {
  word: string;
  lessonId: string;
  ageGroup: string;
  cefrLevel: string;
  currentImageUrl?: string;
  onImageChange: (url: string | null) => void;
}

export function VocabularyImageUploader({
  word,
  lessonId,
  ageGroup,
  cefrLevel,
  currentImageUrl,
  onImageChange
}: VocabularyImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [characterName, setCharacterName] = useState<string>(NO_CHARACTER);
  const { toast } = useToast();


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadVocabularyImage(lessonId, word, file);
    setIsUploading(false);

    if (result.success && result.url) {
      onImageChange(result.url);
      toast({
        title: "Image uploaded",
        description: `Image for "${word}" uploaded successfully.`
      });
    } else {
      toast({
        title: "Upload failed",
        description: result.error || "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    const prompt = customPrompt || word;
    const character = PLAYGROUND_CAST_PRESETS.find((c) => c.name === characterName) ?? null;
    const result = await generateImageWithAI(prompt, ageGroup, cefrLevel, character);

    setIsGenerating(false);

    if (result.success && result.url) {
      onImageChange(result.url);
      toast({
        title: "Image generated",
        description: `AI image for "${word}" generated successfully.`
      });
      setShowCustomPrompt(false);
      setCustomPrompt('');
    } else {
      toast({
        title: "Generation failed",
        description: result.error || "Failed to generate image",
        variant: "destructive"
      });
    }
  };

  const handleRemove = () => {
    onImageChange(null);
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="font-medium">{word}</Label>
          {currentImageUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {currentImageUrl ? (
          <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
            <img
              src={currentImageUrl}
              alt={word}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="relative aspect-video rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Star a Playground cast member (optional)</Label>
              <Select value={characterName} onValueChange={setCharacterName} disabled={isGenerating}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="No character" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CHARACTER}>No character (concept only)</SelectItem>
                  {PLAYGROUND_CAST_PRESETS.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isUploading || isGenerating}
                asChild
              >
                <label className="cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading || isGenerating}
                  />
                </label>
              </Button>

              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleAIGenerate}
                disabled={isUploading || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Generate
              </Button>
            </div>

            {showCustomPrompt && (
              <Input
                placeholder="Custom prompt (optional)"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="text-sm"
              />
            )}

            {!showCustomPrompt && (
              <button
                onClick={() => setShowCustomPrompt(true)}
                className="text-xs text-muted-foreground hover:text-foreground text-center"
              >
                Use custom prompt
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
