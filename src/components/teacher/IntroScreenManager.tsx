import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Sparkles, Loader2, FileImage } from 'lucide-react';
import { uploadIntroScreen, generateIntroScreenWithAI } from '@/utils/lessonImageUpload';
import { useToast } from '@/hooks/use-toast';

interface IntroScreenManagerProps {
  topic: string;
  ageGroup: string;
  cefrLevel: string;
  lessonId: string;
  onScreenReady: (data: { source: 'upload' | 'ai-generated' | 'default'; url?: string; prompt?: string }) => void;
  currentScreen?: { source: string; url?: string };
}

export function IntroScreenManager({
  topic,
  ageGroup,
  cefrLevel,
  lessonId,
  onScreenReady,
  currentScreen
}: IntroScreenManagerProps) {
  const [source, setSource] = useState<'upload' | 'ai-generated' | 'default'>(
    (currentScreen?.source as any) || 'ai-generated'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentScreen?.url);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadIntroScreen(lessonId, file);
    setIsUploading(false);

    if (result.success && result.url) {
      setPreviewUrl(result.url);
      onScreenReady({ source: 'upload', url: result.url });
      toast({
        title: "Intro screen uploaded",
        description: "Your custom intro screen has been uploaded successfully."
      });
    } else {
      toast({
        title: "Upload failed",
        description: result.error || "Failed to upload intro screen",
        variant: "destructive"
      });
    }
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    const result = await generateIntroScreenWithAI(
      customPrompt || topic,
      ageGroup,
      cefrLevel
    );
    setIsGenerating(false);

    if (result.success && result.url) {
      setPreviewUrl(result.url);
      onScreenReady({ 
        source: 'ai-generated', 
        url: result.url,
        prompt: customPrompt || undefined
      });
      toast({
        title: "Intro screen generated",
        description: "AI has generated your intro screen successfully."
      });
    } else {
      toast({
        title: "Generation failed",
        description: result.error || "Failed to generate intro screen",
        variant: "destructive"
      });
    }
  };

  const handleSourceChange = (value: string) => {
    const newSource = value as 'upload' | 'ai-generated' | 'default';
    setSource(newSource);
    
    if (newSource === 'default') {
      setPreviewUrl(undefined);
      onScreenReady({ source: 'default' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg">Lesson Intro Screen</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how you want to create the lesson intro screen
        </p>
      </div>

      <RadioGroup value={source} onValueChange={handleSourceChange}>
        <div className="space-y-3">
          {/* AI Generate Option */}
          <Card className={source === 'ai-generated' ? 'ring-2 ring-primary' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <RadioGroupItem value="ai-generated" id="ai-generated" />
                <div className="flex-1 space-y-3">
                  <Label htmlFor="ai-generated" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium">AI Generate (Recommended)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Let AI create a beautiful intro screen based on your topic
                    </p>
                  </Label>

                  {source === 'ai-generated' && (
                    <div className="space-y-3 pt-2">
                      {showCustomPrompt && (
                        <Input
                          placeholder="Custom prompt (optional)"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                        />
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAIGenerate}
                          disabled={isGenerating}
                          className="flex-1"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          {previewUrl ? 'Regenerate' : 'Generate'}
                        </Button>
                        
                        {!showCustomPrompt && (
                          <Button
                            variant="outline"
                            onClick={() => setShowCustomPrompt(true)}
                          >
                            Custom Prompt
                          </Button>
                        )}
                      </div>

                      {previewUrl && (
                        <div className="relative aspect-video rounded-md overflow-hidden border">
                          <img
                            src={previewUrl}
                            alt="Intro screen preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Option */}
          <Card className={source === 'upload' ? 'ring-2 ring-primary' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <RadioGroupItem value="upload" id="upload" />
                <div className="flex-1 space-y-3">
                  <Label htmlFor="upload" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">Upload Custom Slide</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your own intro screen image (recommended: 1920x1080 or 16:9)
                    </p>
                  </Label>

                  {source === 'upload' && (
                    <div className="space-y-3 pt-2">
                      <Button
                        variant="outline"
                        disabled={isUploading}
                        className="w-full"
                        asChild
                      >
                        <label className="cursor-pointer">
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Choose File
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </Button>

                      {previewUrl && (
                        <div className="relative aspect-video rounded-md overflow-hidden border">
                          <img
                            src={previewUrl}
                            alt="Intro screen preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Template Option */}
          <Card className={source === 'default' ? 'ring-2 ring-primary' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <RadioGroupItem value="default" id="default" />
                <div className="flex-1">
                  <Label htmlFor="default" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      <span className="font-medium">Use Default Template</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Simple text-based intro with mascot (automatically styled for age group)
                    </p>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RadioGroup>
    </div>
  );
}
