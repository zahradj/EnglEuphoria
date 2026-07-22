// Beta Testing & Analytics — Admin Dashboard.
// Admin-only. Tier-6 / longitudinal view.

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import HealthTab from '@/components/admin/analytics/HealthTab';
import HotspotsTab from '@/components/admin/analytics/HotspotsTab';
import CohortCompareTab from '@/components/admin/analytics/CohortCompareTab';
import SignalInboxTab from '@/components/admin/analytics/SignalInboxTab';
import TuningLogTab from '@/components/admin/analytics/TuningLogTab';
import RepairEfficacyTab from '@/components/admin/analytics/RepairEfficacyTab';
import RepairEventsTab from '@/components/admin/analytics/RepairEventsTab';
import VocabArcLiftTab from '@/components/admin/analytics/VocabArcLiftTab';
import LanguageEnginesTab from '@/components/admin/analytics/LanguageEnginesTab';
import ScenarioCacheTab from '@/components/admin/analytics/ScenarioCacheTab';
import EngineFunnelTab from '@/components/admin/analytics/EngineFunnelTab';
import EngineHealthTab from '@/components/admin/analytics/EngineHealthTab';

export default function BetaAnalytics() {
  const [counts, setCounts] = useState({ signals: 0, insights: 0, tunings: 0 });

  useEffect(() => {
    (async () => {
      const [s, i, t] = await Promise.all([
        supabase.from('learner_signals').select('id', { count: 'exact', head: true }),
        supabase.from('beta_insights').select('id', { count: 'exact', head: true }),
        supabase.from('analytics_tuning_log').select('id', { count: 'exact', head: true }),
      ]);
      setCounts({ signals: s.count ?? 0, insights: i.count ?? 0, tunings: t.count ?? 0 });
    })();
  }, []);

  return (
    <div className="min-h-dvh bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Beta Analytics</h1>
          <p className="text-muted-foreground">
            Real-learner telemetry, frustration/engagement detectors, and the self-improvement loop.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active learner signals" value={counts.signals} />
          <StatCard label="Cohort insights" value={counts.insights} />
          <StatCard label="Adaptive tunings applied" value={counts.tunings} />
        </div>

        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid grid-cols-12 w-full">
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="hotspots">Lesson Hotspots</TabsTrigger>
            <TabsTrigger value="cohort">Cohort Compare</TabsTrigger>
            <TabsTrigger value="signals">Signal Inbox</TabsTrigger>
            <TabsTrigger value="tuning">Tuning Log</TabsTrigger>
            <TabsTrigger value="repair">Repair Efficacy</TabsTrigger>
            <TabsTrigger value="repair-events">Repair Events</TabsTrigger>
            <TabsTrigger value="vocab-arc">Vocab Arc Lift</TabsTrigger>
            <TabsTrigger value="engines">Language Engines</TabsTrigger>
            <TabsTrigger value="engine-funnel">Engine Funnel</TabsTrigger>
            <TabsTrigger value="cache">Scenario Cache</TabsTrigger>
            <TabsTrigger value="engine-health">Engine Health</TabsTrigger>
          </TabsList>
          <TabsContent value="health"><HealthTab /></TabsContent>
          <TabsContent value="hotspots"><HotspotsTab /></TabsContent>
          <TabsContent value="cohort"><CohortCompareTab /></TabsContent>
          <TabsContent value="signals"><SignalInboxTab /></TabsContent>
          <TabsContent value="tuning"><TuningLogTab /></TabsContent>
          <TabsContent value="repair"><RepairEfficacyTab /></TabsContent>
          <TabsContent value="repair-events"><RepairEventsTab /></TabsContent>
          <TabsContent value="vocab-arc"><VocabArcLiftTab /></TabsContent>
          <TabsContent value="engines"><LanguageEnginesTab /></TabsContent>
          <TabsContent value="engine-funnel"><EngineFunnelTab /></TabsContent>
          <TabsContent value="cache"><ScenarioCacheTab /></TabsContent>
          <TabsContent value="engine-health"><EngineHealthTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-3xl font-bold text-foreground">{value}</div></CardContent>
    </Card>
  );
}
