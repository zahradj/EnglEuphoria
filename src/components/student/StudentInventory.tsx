import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Sparkles, Lock, Check, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface InventoryItem {
  id: string;
  accessory_id: string;
  is_equipped: boolean;
  unlocked_at: string;
  accessory: {
    id: string;
    name: string;
    type: string;
    description: string | null;
    image_url: string | null;
    hub_requirement: string;
    level_id: string;
  };
}

interface LockedAccessory {
  id: string;
  name: string;
  type: string;
  description: string | null;
  image_url: string | null;
  hub_requirement: string;
  level_name: string;
}

interface StudentInventoryProps {
  studentId: string;
  hub: 'playground' | 'academy' | 'professional';
  onClose: () => void;
}

const HUB_STYLES = {
  playground: {
    bg: 'from-amber-500/20 via-orange-500/10 to-yellow-500/20',
    accent: 'text-amber-500',
    ring: 'ring-amber-400/40',
    glow: 'shadow-amber-500/20',
    label: 'The Playground',
    avatar: '🐧',
  },
  academy: {
    bg: 'from-violet-500/20 via-cyan-500/10 to-fuchsia-500/20',
    accent: 'text-cyan-400',
    ring: 'ring-cyan-400/40',
    glow: 'shadow-cyan-500/20',
    label: 'The Academy',
    avatar: '🤖',
  },
  professional: {
    bg: 'from-slate-500/20 via-emerald-500/10 to-amber-500/20',
    accent: 'text-emerald-400',
    ring: 'ring-emerald-400/40',
    glow: 'shadow-emerald-500/20',
    label: 'The Hub',
    avatar: '👤',
  },
};

const SparkleEffect = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [1, 0.8, 0],
            x: Math.cos((i / 6) * Math.PI * 2) * 30,
            y: Math.sin((i / 6) * Math.PI * 2) * 30,
          }}
          transition={{ duration: 0.8, delay: i * 0.08 }}
          className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full z-20"
          style={{ top: '50%', left: '50%' }}
        />
      ))}
    </>
  );
};

export const StudentInventory: React.FC<StudentInventoryProps> = ({
  studentId,
  hub,
  onClose,
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lockedItems, setLockedItems] = useState<LockedAccessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sparklingId, setSparklingId] = useState<string | null>(null);
  const style = HUB_STYLES[hub];

  useEffect(() => {
    fetchInventory();
  }, [studentId, hub]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Fetch owned items
      const { data: owned } = await supabase
        .from('student_inventory')
        .select('*, accessory:accessories(*)')
        .eq('student_id', studentId);

      // Fetch all accessories for this hub
      const { data: allAccessories } = await supabase
        .from('accessories')
        .select('*, level:curriculum_levels(name)')
        .eq('hub_requirement', hub);

      const ownedIds = new Set((owned || []).map((o: any) => o.accessory_id));
      
      const locked = (allAccessories || [])
        .filter((a: any) => !ownedIds.has(a.id))
        .map((a: any) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          description: a.description,
          image_url: a.image_url,
          hub_requirement: a.hub_requirement,
          level_name: a.level?.name || 'Unknown Level',
        }));

      setInventory((owned || []) as InventoryItem[]);
      setLockedItems(locked);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (inventoryId: string, accessoryId: string) => {
    // Unequip all first
    await supabase
      .from('student_inventory')
      .update({ is_equipped: false } as any)
      .eq('student_id', studentId);

    // Equip selected
    await supabase
      .from('student_inventory')
      .update({ is_equipped: true } as any)
      .eq('id', inventoryId);

    setSparklingId(accessoryId);
    setTimeout(() => setSparklingId(null), 1000);

    toast.success('Item equipped!', { icon: '✨' });
    fetchInventory();
  };

  const handleUnequip = async (inventoryId: string) => {
    await supabase
      .from('student_inventory')
      .update({ is_equipped: false } as any)
      .eq('id', inventoryId);

    toast.success('Item unequipped');
    fetchInventory();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className={cn(
          'relative w-full max-w-2xl max-h-[85vh] rounded-3xl border border-border overflow-hidden',
          'bg-background/95 backdrop-blur-xl shadow-2xl',
          style.glow
        )}
      >
        {/* Gradient header */}
        <div className={cn('bg-gradient-to-r p-6 pb-4', style.bg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl',
                'bg-background/30 backdrop-blur-sm ring-2',
                style.ring
              )}>
                {style.avatar}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">My Collection</h2>
                <p className={cn('text-sm font-medium', style.accent)}>{style.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] h-5">
                    <Trophy className="h-3 w-3 mr-1" />
                    {inventory.length} Unlocked
                  </Badge>
                  <Badge variant="outline" className="text-[10px] h-5">
                    <Lock className="h-3 w-3 mr-1" />
                    {lockedItems.length} Locked
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Inventory Grid */}
        <ScrollArea className="h-[calc(85vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Unlocked Items */}
            {inventory.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className={cn('h-4 w-4', style.accent)} />
                  Unlocked Items
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {inventory.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'relative rounded-xl border p-3 text-center cursor-pointer transition-all group',
                        item.is_equipped
                          ? `ring-2 ${style.ring} border-primary bg-primary/5`
                          : 'border-border hover:border-primary/40 hover:bg-muted/30'
                      )}
                      onClick={() =>
                        item.is_equipped
                          ? handleUnequip(item.id)
                          : handleEquip(item.id, item.accessory_id)
                      }
                    >
                      <SparkleEffect active={sparklingId === item.accessory_id} />
                      
                      <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden">
                        {item.accessory?.image_url ? (
                          <img
                            src={item.accessory.image_url}
                            alt={item.accessory?.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Trophy className={cn('h-6 w-6', style.accent)} />
                        )}
                      </div>

                      <p className="text-[11px] font-semibold text-foreground truncate">
                        {item.accessory?.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground capitalize">
                        {item.accessory?.type}
                      </p>

                      {item.is_equipped && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm"
                        >
                          <Check className="h-3 w-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Items */}
            {lockedItems.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Locked Items
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {lockedItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: i * 0.03 }}
                      className="relative rounded-xl border border-dashed border-border p-3 text-center"
                    >
                      <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-muted/30 flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-contain grayscale opacity-30"
                          />
                        ) : (
                          <Lock className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-muted-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-[8px] text-muted-foreground/60 mt-0.5">
                        Unlock at {item.level_name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {!loading && inventory.length === 0 && lockedItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No accessories available yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};
