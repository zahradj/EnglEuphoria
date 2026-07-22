import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { ARCADE_GAMES, ARCADE_HUB_PROFILES } from '@/arcade';
import type { Hub } from '@/governance/types';
import { Gamepad2, Mic, Brain, Users, Trophy, Sparkles } from 'lucide-react';

const HUB_THEME: Record<Hub, { bg: string; ring: string; chip: string; label: string }> = {
  playground: { bg: 'from-orange-50 to-yellow-50', ring: 'ring-orange-400/40', chip: 'bg-orange-500', label: 'Playground' },
  academy:    { bg: 'from-purple-50 to-indigo-50', ring: 'ring-purple-400/40', chip: 'bg-purple-600', label: 'Academy' },
  success:    { bg: 'from-emerald-50 to-teal-50', ring: 'ring-emerald-400/40', chip: 'bg-emerald-600', label: 'Success Hub' },
};

const SECTIONS = [
  { id: 'practice', title: 'Practice Games', icon: Gamepad2, desc: 'Strengthen skills with curriculum-aligned games.' },
  { id: 'missions', title: 'Mastery Missions', icon: Sparkles, desc: 'Quest chains tied to your weak units.' },
  { id: 'speaking', title: 'Speaking Challenges', icon: Mic, desc: 'Real-mic games that grow your fluency.' },
  { id: 'review', title: 'Review Quests', icon: Brain, desc: 'Recycle what you nearly forgot — the smart way.' },
  { id: 'tournaments', title: 'Tournaments', icon: Trophy, desc: 'Seasonal ranked events.' },
  { id: 'classroom', title: 'Classroom Battles', icon: Users, desc: 'Live multiplayer with your class.' },
];

export default function ArcadeHome() {
  const { user } = useAuth();
  const { studentLevel } = useStudentLevel();
  const navigate = useNavigate();
  const hub: Hub = studentLevel === 'playground' ? 'playground' : studentLevel === 'academy' ? 'academy' : 'success';
  const theme = HUB_THEME[hub];
  const profile = ARCADE_HUB_PROFILES[hub];

  const availableGames = useMemo(
    () => ARCADE_GAMES.filter((g) => g.hub_allow.includes(hub)),
    [hub],
  );

  const speakingGames = availableGames.filter((g) => g.supports_speaking).length;
  const multiplayerGames = availableGames.filter((g) => g.supports_multiplayer).length;

  return (
    <div className={`min-h-dvh bg-gradient-to-br ${theme.bg} p-4 sm:p-8`}>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Badge className={`${theme.chip} text-white mb-2`}>{theme.label} Arcade</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Gamer Arcade</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Curriculum-driven games. Every round reinforces what you're learning.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Games" value={availableGames.length} />
          <StatCard label="Speaking" value={speakingGames} />
          <StatCard label="Multiplayer" value={multiplayerGames} />
          <StatCard label="Max / lesson" value={`${profile.max_games_per_lesson} • ${profile.max_minutes_per_lesson}min`} />
        </div>

        {hub === 'playground' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Bonus practice</h2>
            <Card
              onClick={() => navigate('/arcade/alphabet')}
              className={`p-5 cursor-pointer transition hover:shadow-lg ring-1 ${theme.ring} bg-gradient-to-br from-orange-100 to-yellow-100`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${theme.chip} text-white flex items-center justify-center text-2xl font-black`}>
                  Aa
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">Alphabet Arcade</div>
                  <div className="text-sm text-muted-foreground">
                    Letters, sounds & phonics — 3 mini-games rotated every lesson.
                  </div>
                </div>
                <Badge className="bg-orange-500">New</Badge>
              </div>
            </Card>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-3">Choose a mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const disabled = (s.id === 'tournaments' || s.id === 'classroom') && !profile.allow_leaderboards && s.id === 'tournaments';
              return (
                <Card
                  key={s.id}
                  className={`p-5 cursor-pointer transition hover:shadow-lg ring-1 ${theme.ring} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => navigate(`/arcade/${s.id}`)}
                >
                  <div className={`w-10 h-10 rounded-xl ${theme.chip} text-white flex items-center justify-center mb-3`}>
                    <Icon size={20} />
                  </div>
                  <div className="font-semibold mb-1">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">All games for your hub</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableGames.map((g) => (
              <Card key={g.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold">{g.display_name}</div>
                  <Badge variant="secondary" className="text-[10px]">{g.category}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  CEFR {g.cefr_min}–{g.cefr_max} · ≤{Math.round(g.ceiling_seconds / 60)}min
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.skill_focus.map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                  ))}
                  {g.supports_speaking && <Badge className="text-[10px] bg-rose-500 hover:bg-rose-500">mic</Badge>}
                  {g.supports_multiplayer && <Badge className="text-[10px] bg-indigo-500 hover:bg-indigo-500">multi</Badge>}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <p className="text-xs text-center text-muted-foreground pt-4">
          Games reinforce your lessons — they never replace them. Your bravery counts more than your score.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </Card>
  );
}
