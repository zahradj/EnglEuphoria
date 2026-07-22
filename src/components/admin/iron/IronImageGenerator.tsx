import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2, RefreshCw, X, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IronImageGeneratorProps {
  cohortGroup: 'A' | 'B' | 'C';
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  initialPrompt?: string;
  initialImageUrl?: string;
}

const COHORT_STYLE_MODIFIERS = {
  A: {
    label: 'Cartoon Style',
    modifier: 'in a friendly, vibrant animated cartoon style, flat design, suitable for children',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  B: {
    label: 'Realistic Style',
    modifier: 'realistic photograph, cinematic lighting, high detail, 4k',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
  C: {
    label: 'Realistic Style',
    modifier: 'realistic photograph, cinematic lighting, high detail, 4k',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  },
};

export const IronImageGenerator: React.FC<IronImageGeneratorProps> = ({
  cohortGroup,
  onImageGenerated,
  initialPrompt = '',
  initialImageUrl = '',
}) => {
  const [imagePrompt, setImagePrompt] = useState(initialPrompt);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(initialImageUrl);
  const [isGenerating, setIsGenerating] = useState(false);

  const styleConfig = COHORT_STYLE_MODIFIERS[cohortGroup];

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter an image idea first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Append cohort-specific style modifier
      const fullPrompt = `${imagePrompt.trim()}, ${styleConfig.modifier}`;
      
      
      const response = await supabase.functions.invoke('ai-image-generation', {
        body: {
          prompt: fullPrompt,
          style: cohortGroup === 'A' ? 'cartoon' : 'realistic',
          aspectRatio: '16:9'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate image');
      }

      if (!response.data?.imageUrl) {
        throw new Error('No image URL returned from API');
      }

      setGeneratedImageUrl(response.data.imageUrl);
      onImageGenerated(response.data.imageUrl, imagePrompt);
      toast.success('Visual generated successfully!');
    } catch (error) {
      console.error('Image generation failed:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearImage = () => {
    setGeneratedImageUrl('');
    onImageGenerated('', imagePrompt);
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <Label className="text-base font-semibold">AI Visual Aid</Label>
        </div>
        <Badge className={styleConfig.color}>
          {styleConfig.label}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Input
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Describe your image idea..."
          className="flex-1"
        />
        <Button
          onClick={handleGenerateImage}
          disabled={isGenerating || !imagePrompt.trim()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Visual
            </>
          )}
        </Button>
      </div>

      {generatedImageUrl && (
        <div className="relative">
          <img
            src={generatedImageUrl}
            alt="Generated visual aid"
            className="w-full h-48 object-cover rounded-lg border border-purple-200 dark:border-purple-700"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-gray-900/90"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={handleClearImage}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {cohortGroup === 'A' 
          ? 'Images will be generated in a friendly, child-appropriate cartoon style.'
          : 'Images will be generated as realistic, high-quality photographs.'}
      </p>
    </div>
  );
};
