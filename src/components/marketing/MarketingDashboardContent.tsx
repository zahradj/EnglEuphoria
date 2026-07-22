import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Tag, Megaphone, Share2 } from 'lucide-react';
import { MarketingOverviewTab } from '@/components/marketing/MarketingOverviewTab';
import { CampaignsTab } from '@/components/marketing/CampaignsTab';
import { BroadcastsTab } from '@/components/marketing/BroadcastsTab';
import { SocialMediaTab } from '@/components/marketing/SocialMediaTab';

/** The marketing dashboard's tab body, shared between the standalone /marketing
 *  route (MarketingDashboard.tsx) and the embedded "Marketing" tab inside
 *  AdminDashboard.tsx, so there's one source of truth for the tab content. */
export const MarketingDashboardContent = () => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full max-w-2xl">
        <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
        <TabsTrigger value="campaigns" className="gap-2"><Tag className="h-4 w-4" /> Campaigns</TabsTrigger>
        <TabsTrigger value="broadcasts" className="gap-2"><Megaphone className="h-4 w-4" /> Broadcasts</TabsTrigger>
        <TabsTrigger value="social" className="gap-2"><Share2 className="h-4 w-4" /> Social</TabsTrigger>
      </TabsList>

      <TabsContent value="overview"><MarketingOverviewTab /></TabsContent>
      <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
      <TabsContent value="broadcasts"><BroadcastsTab /></TabsContent>
      <TabsContent value="social"><SocialMediaTab /></TabsContent>
    </Tabs>
  );
};
