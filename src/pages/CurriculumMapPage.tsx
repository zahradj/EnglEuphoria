import { ImprovedProtectedRoute } from '@/components/auth/ImprovedProtectedRoute';
import {
  CurriculumMap,
  CurriculumMapHeader,
} from '@/components/student/curriculum-map/CurriculumMap';

function Inner() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-background to-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <CurriculumMapHeader />
        <CurriculumMap />
      </div>
    </div>
  );
}

export default function CurriculumMapPage() {
  return (
    <ImprovedProtectedRoute requiredRole="student">
      <Inner />
    </ImprovedProtectedRoute>
  );
}
