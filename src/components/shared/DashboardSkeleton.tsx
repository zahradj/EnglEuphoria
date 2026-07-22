import React from 'react';

/** Generic animated skeleton block */
const Bone: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-muted/50 ${className}`} />
);

// ─── Playground (Kids) Skeleton ──────────────────────────────────────────────
export const PlaygroundSkeleton: React.FC = () => (
  <div className="min-h-dvh bg-gradient-to-b from-rose-50 to-pink-100 p-4 flex flex-col gap-4 h-dvh">
    {/* Top bar */}
    <Bone className="h-14 w-full rounded-3xl" />
    <div className="flex-1 flex gap-4 overflow-hidden">
      {/* Sidebar */}
      <Bone className="w-16 rounded-3xl" />
      {/* Map area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        <Bone className="flex-1 rounded-3xl" />
        {/* Right panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <Bone className="h-28 rounded-3xl" />
          <Bone className="h-12 rounded-3xl" />
          <Bone className="h-36 rounded-3xl" />
          <Bone className="h-24 rounded-3xl" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Academy (Teen) Skeleton ──────────────────────────────────────────────────
export const AcademySkeleton: React.FC = () => (
  <div className="min-h-dvh flex bg-[#0f0f1a]">
    {/* Sidebar */}
    <div className="w-20 md:w-64 bg-[#1a1a2e] flex flex-col gap-4 p-4">
      <Bone className="h-10 w-10 rounded-xl" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Bone key={i} className="h-10 rounded-lg" />
      ))}
    </div>
    {/* Main */}
    <main className="flex-1 p-4 md:p-6 space-y-4">
      <Bone className="h-20 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Bone className="h-40 rounded-xl" />
          <Bone className="h-32 rounded-xl" />
          <Bone className="h-48 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Bone className="h-12 rounded-xl" />
          <Bone className="h-64 rounded-xl" />
        </div>
      </div>
    </main>
  </div>
);

// ─── Hub (Adult) Skeleton ─────────────────────────────────────────────────────
export const HubSkeleton: React.FC = () => (
  <div className="min-h-dvh bg-white">
    {/* Header */}
    <div className="border-b h-16 flex items-center px-8 gap-4">
      <Bone className="h-8 w-8 rounded-lg" />
      <Bone className="h-5 w-24" />
      <div className="flex-1" />
      <Bone className="h-8 w-40 rounded-full" />
    </div>
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <Bone className="h-14 rounded-xl" />
      <Bone className="h-16 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Bone key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Bone className="h-56 rounded-xl" />
          <Bone className="h-40 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Bone className="h-32 rounded-xl" />
          <Bone className="h-48 rounded-xl" />
        </div>
      </div>
    </main>
  </div>
);

// ─── Teacher Dashboard Skeleton ───────────────────────────────────────────────
export const TeacherDashboardSkeleton: React.FC = () => (
  <div className="min-h-dvh bg-background p-6 space-y-4">
    <Bone className="h-14 rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <Bone key={i} className="h-28 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Bone className="h-48 rounded-xl" />
        <Bone className="h-36 rounded-xl" />
      </div>
      <div className="space-y-4">
        <Bone className="h-56 rounded-xl" />
        <Bone className="h-24 rounded-xl" />
      </div>
    </div>
  </div>
);
