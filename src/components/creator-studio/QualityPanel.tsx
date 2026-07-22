// Combined publish-gate panel: banner + radar chart + critic history.
// Drop-in replacement for <PublishGateBanner /> in hub creators.

import type { CreatorPublishVerdict } from '@/services/contentCreator/publishGateHelper';
import { PublishGateBanner } from './PublishGateBanner';
import { QualityRadarChart } from './QualityRadarChart';
import { QualityHistoryDrawer } from './QualityHistoryDrawer';

interface Props {
  verdict: CreatorPublishVerdict | null;
  lessonId?: string | null;
  contentHashes?: string[];
  busy?: boolean;
  onPublish?: () => void;
  onRepair?: () => void;
  onSaveDraft?: () => void;
}

export function QualityPanel({
  verdict,
  lessonId,
  contentHashes,
  busy,
  onPublish,
  onRepair,
  onSaveDraft,
}: Props) {
  if (!verdict) return null;
  const hashes = contentHashes ?? (lessonId ? [lessonId] : []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
      <PublishGateBanner
        verdict={verdict}
        busy={busy}
        onPublish={onPublish}
        onRepair={onRepair}
        onSaveDraft={onSaveDraft}
      />
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card/60 p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Quality scorecard
          </div>
          <QualityRadarChart scorecard={verdict.scorecard} />
        </div>
        <QualityHistoryDrawer contentHashes={hashes} />
      </div>
    </div>
  );
}

export default QualityPanel;
