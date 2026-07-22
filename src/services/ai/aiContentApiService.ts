
import { supabase } from '@/integrations/supabase/client';
const isSupabaseConfigured = () => true; // Always configured in Engleuphoria deployments
import { AIContentRequest, AIGeneratedContent } from './types';

export class AIContentApiService {
  async generateContent(request: AIContentRequest): Promise<AIGeneratedContent> {
    console.log('AIContentApiService: Starting content generation', {
      type: request.type,
      topic: request.topic,
      level: request.level,
      isSupabaseConfigured: isSupabaseConfigured()
    });

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase configuration is required for content generation');
    }

    const startTime = Date.now();

    try {
      
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: request
      });

      if (error) {
        console.error('AIContentApiService: Supabase function error:', error);
        throw new Error(`Failed to generate content: ${error.message}`);
      }

      if (!data || !data.content) {
        console.error('AIContentApiService: Invalid response structure:', data);
        throw new Error('Invalid response from content generation service');
      }

      const generatedContent = data.content;
      generatedContent.metadata = {
        ...generatedContent.metadata,
        generationTime: Date.now() - startTime
      };
      return generatedContent;
    } catch (error) {
      console.error('AIContentApiService: Content generation failed:', error);
      throw error;
    }
  }
}

export const aiContentApiService = new AIContentApiService();
