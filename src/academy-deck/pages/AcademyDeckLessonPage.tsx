import { Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAcademyDeckLesson } from '../lessonRegistry';
import { useAuth } from '@/contexts/AuthContext';

const SignMeUpLesson = lazy(() => import('@/academy-games/signMeUp/SignMeUpLesson'));
const SignMeUpHomework = lazy(() => import('@/academy-games/signMeUp/SignMeUpHomework'));
const FakeOrRealLesson = lazy(() => import('./FakeOrRealLesson'));

/** Full-screen player for one Academy deck lesson (or its homework quest). Students come from My Lessons, creators from the Academy Library. */
export default function AcademyDeckLessonPage({ homework = false }: { homework?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const lesson = getAcademyDeckLesson(id);
  const role = (user as { role?: string } | null)?.role;
  const isCreator = role === 'content_creator' || role === 'admin';
  const back = () => navigate(isCreator ? '/academy-library' : '/dashboard/academy?tab=lessons');
  const Player = id === 'sign-me-up' ? (homework ? SignMeUpHomework : SignMeUpLesson) : id === 'fake-or-real' && !homework ? FakeOrRealLesson : null;

  return (
    <div className="relative min-h-screen bg-[#f5f3ff]">
      <button
        type="button"
        onClick={back}
        className="absolute start-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-violet-800 shadow ring-1 ring-violet-200 hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('al.back', 'Back to lessons')}
      </button>
      {!lesson || !Player ? (
        <p className="p-10 text-center font-bold">{t('al.missing', 'This lesson isn’t available.')}</p>
      ) : (
        <Suspense fallback={<div className="flex items-center justify-center p-16 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
          <Player onBack={back} />
        </Suspense>
      )}
    </div>
  );
}
