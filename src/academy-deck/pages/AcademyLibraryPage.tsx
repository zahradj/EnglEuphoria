import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Play, Swords } from 'lucide-react';
import { ACADEMY_DECK_LESSONS } from '../lessonRegistry';
import { AcademyLevelLibrary } from '../library/AcademyLevelLibrary';

/** Content creator's Academy Library: every Academy deck lesson (and its homework quest) with a preview. Creator-facing, English. */
export default function AcademyLibraryPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-950 via-violet-900 to-indigo-950 text-white">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <button type="button" onClick={() => navigate('/content-creator/library')} className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-200 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Creator Studio
        </button>
        <header className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Academy Hub · ages 13–18 · A1 → C1</p>
          <h1 className="flex items-center gap-2 text-3xl font-black"><BookOpen className="h-7 w-7" /> Academy Library</h1>
          <p className="text-sm text-violet-200">Lessons built for the Academy. They appear in the student’s <b>My Lessons</b> tab. Open one to preview it exactly as a student sees it.</p>
        </header>
        <AcademyLevelLibrary
          lessons={ACADEMY_DECK_LESSONS}
          gridClassName="grid gap-4 md:grid-cols-2"
          showSteps
          renderLesson={(l) => (
            <article className="overflow-hidden rounded-3xl border border-violet-400/30 bg-violet-950/60 shadow-xl">
              <div className="relative aspect-video" style={{ background: l.gradient }}>
                <img src={l.cover} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                <span className="absolute start-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold">Season {l.season} · Lesson {l.lesson} · {l.level}</span>
              </div>
              <div className="space-y-3 p-4">
                <h2 className="text-xl font-extrabold">{l.title}</h2>
                <p className="text-sm text-violet-100">{l.blurb}</p>
                <p className="flex items-center gap-3 text-xs text-violet-300"><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {l.minutes} min</span><span>{l.parts} parts</span><span className="rounded-full bg-amber-400/20 px-2 py-0.5 font-bold text-amber-200">In review</span></p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => navigate(`/academy-lesson/${l.id}`)} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-violet-800 shadow active:scale-95"><Play className="h-4 w-4" /> Preview lesson</button>
                  {l.homework && <button type="button" onClick={() => navigate(`/academy-lesson/${l.id}/homework`)} className="inline-flex items-center gap-1.5 rounded-full bg-violet-700 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-violet-300/40 active:scale-95"><Swords className="h-4 w-4" /> Preview homework quest</button>}
                </div>
              </div>
            </article>
          )}
        />
      </div>
    </div>
  );
}
