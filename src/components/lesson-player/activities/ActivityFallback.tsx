import React from 'react';

interface Props {
  title?: string;
  description?: string;
  activityLabel?: string;
}

export default function ActivityFallback({ title, description, activityLabel = 'Activity' }: Props) {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-4 text-foreground">{title || activityLabel}</h2>
      {description && <p className="text-muted-foreground text-lg max-w-xl">{description}</p>}
      <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
    </div>
  );
}
