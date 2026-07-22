import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyRouteProps {
  children: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ children }) => {
  return (
    <Suspense fallback={<LazyRouteFallback />}>
      {children}
    </Suspense>
  );
};

const LazyRouteFallback: React.FC = () => (
  <div className="min-h-dvh p-6 space-y-6">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[90%]" />
      <Skeleton className="h-4 w-[80%]" />
    </div>
  </div>
);