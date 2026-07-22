import React from 'react';
import { Lightbulb } from 'lucide-react';

interface EditorialHeroMediaProps {
  slide: any;
}

export default function EditorialHeroMedia({ slide }: EditorialHeroMediaProps) {
  const mediaUrl = slide?.imageUrl || slide?.image_url || slide?.generated_image_url || slide?.custom_image_url || slide?.media_url;
  const youtubeQuery = slide?.youtube_query || slide?.interactive_data?.youtube_query;
  const description = slide?.description || slide?.content || slide?.interactive_data?.description || '';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
      {/* Hero Media Block */}
      {mediaUrl && (
        <div className="w-full max-w-3xl mx-auto aspect-video rounded-2xl shadow-md overflow-hidden bg-muted">
          <img
            src={mediaUrl}
            alt={slide.title || 'Lesson visual'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      {youtubeQuery && !mediaUrl && (
        <div className="w-full max-w-3xl mx-auto aspect-video rounded-2xl shadow-md overflow-hidden bg-muted flex items-center justify-center">
          <p className="text-muted-foreground text-sm">🎬 Video: {youtubeQuery}</p>
        </div>
      )}

      {/* Title */}
      <div className="flex items-start gap-3">
        <Lightbulb className="w-8 h-8 text-amber-500 mt-1 flex-shrink-0" />
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
          {slide.title}
        </h1>
      </div>

      {/* Body */}
      {description && (
        <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line">
          {typeof description === 'string' ? description : ''}
        </p>
      )}
    </div>
  );
}
