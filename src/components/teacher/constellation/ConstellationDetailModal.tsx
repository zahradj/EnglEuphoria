import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConstellationHistoryTab } from './ConstellationHistoryTab';
import { ConstellationTimelineTab } from './ConstellationTimelineTab';
import { ConstellationBadgesTab } from './ConstellationBadgesTab';
import { ConstellationStar } from '@/types/constellation';

interface ConstellationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stars: ConstellationStar[];
  overallHealth: number;
  tierName: string;
}

export const ConstellationDetailModal = ({
  open,
  onOpenChange,
  stars,
  overallHealth,
  tierName,
}: ConstellationDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Performance Constellation Details</DialogTitle>
          <DialogDescription>
            {tierName} • {overallHealth}% Overall Health
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Historical Events</TabsTrigger>
            <TabsTrigger value="timeline">Regeneration Timeline</TabsTrigger>
            <TabsTrigger value="badges">Achievement Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4 mt-4">
            <ConstellationHistoryTab stars={stars} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-4">
            <ConstellationTimelineTab stars={stars} />
          </TabsContent>

          <TabsContent value="badges" className="space-y-4 mt-4">
            <ConstellationBadgesTab overallHealth={overallHealth} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
