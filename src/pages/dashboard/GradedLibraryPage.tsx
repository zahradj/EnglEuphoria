import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-states';

const GradedLibraryRoom = lazy(() => import('@/components/dashboard/rooms/GradedLibraryRoom'));

export default function GradedLibraryPage() {
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center"><LoadingSpinner /></div>}>
      <GradedLibraryRoom />
    </Suspense>
  );
}
