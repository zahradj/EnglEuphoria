import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-states';

const SpeakingStudio = lazy(() => import('@/components/dashboard/rooms/SpeakingStudio'));

export default function SpeakingStudioPage() {
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center"><LoadingSpinner /></div>}>
      <SpeakingStudio />
    </Suspense>
  );
}
