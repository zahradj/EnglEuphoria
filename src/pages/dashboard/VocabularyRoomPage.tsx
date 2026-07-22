import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-states';

const VocabularyRoom = lazy(() => import('@/components/dashboard/rooms/VocabularyRoom'));

export default function VocabularyRoomPage() {
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center"><LoadingSpinner /></div>}>
      <VocabularyRoom />
    </Suspense>
  );
}
