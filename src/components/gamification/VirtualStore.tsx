import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useGamification } from "@/hooks/useGamification";
import { VirtualReward, StudentRewardPurchase } from "@/types/gamification";
import { 
  ShoppingCart, 
  Coins, 
  Palette, 
  Zap, 
  Gift, 
  Crown,
  Star,
  Sparkles,
  CheckCircle
} from "lucide-react";

interface VirtualStoreProps {
  studentId: string;
  onPurchaseReward: (rewardId: string) => Promise<any>;
}

export function VirtualStore({ studentId, onPurchaseReward }: VirtualStoreProps) {
  const [rewards, setRewards] = useState<VirtualReward[]>([]);
  const [purchases, setPurchases] = useState<StudentRewardPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { currency } = useGamification(studentId);

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('virtual_rewards')
      .select('*')
      .eq('is_available', true)
      .order('cost_coins', { ascending: true });

    if (error) {
      console.error('Error fetching rewards:', error);
      return;
    }

    setRewards(data || []);
  };

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from('student_reward_purchases')
      .select(`
        *,
        reward:virtual_rewards(*)
      `)
      .eq('student_id', studentId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching purchases:', error);
      return;
    }

    setPurchases(data || []);
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([fetchRewards(), fetchPurchases()]);
      setLoading(false);
    };

    initialize();
  }, [studentId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'avatar': return <Palette className="h-4 w-4" />;
      case 'theme': return <Sparkles className="h-4 w-4" />;
      case 'feature_unlock': return <Zap className="h-4 w-4" />;
      case 'boost': return <Star className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'common': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-400/20';
      case 'epic': return 'border-purple-400 shadow-purple-400/20';
      case 'rare': return 'border-blue-400 shadow-blue-400/20';
      case 'common': return 'border-gray-200';
      default: return 'border-gray-200';
    }
  };

  const isPurchased = (rewardId: string) => {
    return purchases.some(p => p.reward_id === rewardId);
  };

  const canAfford = (cost: number) => {
    return (currency?.total_coins || 0) >= cost;
  };

  const isSoldOut = (reward: VirtualReward) => {
    return reward.limited_quantity && reward.purchased_count >= reward.limited_quantity;
  };

  const filteredRewards = activeTab === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === activeTab);

  const handlePurchase = async (rewardId: string) => {
    const result = await onPurchaseReward(rewardId);
    if (result?.success) {
      await fetchPurchases();
      await fetchRewards();
    }
  };

  const renderRewardCard = (reward: VirtualReward) => {
    const purchased = isPurchased(reward.id);
    const affordable = canAfford(reward.cost_coins);
    const soldOut = isSoldOut(reward);

    return (
      <Card 
        key={reward.id} 
        className={`relative overflow-hidden hover:shadow-lg transition-all ${getRarityBorder(reward.rarity)} shadow-lg`}
      >
        {/* Rarity indicator */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(reward.rarity)}`}>
          {reward.rarity}
        </div>

        {/* Sold out indicator */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <Badge variant="destructive">SOLD OUT</Badge>
          </div>
        )}

        {/* Purchased indicator */}
        {purchased && (
          <div className="absolute top-2 left-2 z-10">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getCategoryIcon(reward.category)}
            </div>
            <div>
              <CardTitle className="text-lg">{reward.name}</CardTitle>
              <Badge variant="outline">{reward.category}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{reward.description}</p>

          {/* Limited quantity indicator */}
          {reward.limited_quantity && (
            <div className="text-xs text-orange-600">
              Limited: {reward.limited_quantity - reward.purchased_count} remaining
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-bold text-lg">{reward.cost_coins}</span>
            </div>

            {purchased ? (
              <Button disabled className="bg-green-100 text-green-700">
                Owned ✓
              </Button>
            ) : soldOut ? (
              <Button disabled variant="destructive">
                Sold Out
              </Button>
            ) : !affordable ? (
              <Button disabled variant="outline">
                Not Enough Coins
              </Button>
            ) : (
              <Button 
                onClick={() => handlePurchase(reward.id)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Buy
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Virtual Store
          </h2>
          <p className="text-muted-foreground">
            Spend your coins on amazing rewards and customizations
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Your Balance</p>
          <div className="flex items-center gap-1">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold">{currency?.total_coins || 0}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="theme">Themes</TabsTrigger>
          <TabsTrigger value="feature_unlock">Features</TabsTrigger>
          <TabsTrigger value="boost">Boosts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map(renderRewardCard)}
            {filteredRewards.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No rewards available in this category</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Purchase History */}
      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Your Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchases.slice(0, 6).map((purchase) => (
                <div 
                  key={purchase.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getCategoryIcon(purchase.reward?.category || 'boost')}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{purchase.reward?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Purchased for {purchase.coins_spent} coins
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}