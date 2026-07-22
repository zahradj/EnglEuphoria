import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EquippedItem {
  id: string;
  inventoryId: string;
  name: string;
  type: string;
  imageUrl: string | null;
  hubRequirement: string;
  offsetX: string;
  offsetY: string;
}

export interface InventoryItem {
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

// Position offsets for accessory types on the avatar
const TYPE_OFFSETS: Record<string, { x: string; y: string }> = {
  hat: { x: '25%', y: '-10%' },
  cape: { x: '10%', y: '30%' },
  badge: { x: '60%', y: '50%' },
  aura: { x: '0%', y: '0%' },
  wings: { x: '5%', y: '15%' },
  glasses: { x: '20%', y: '25%' },
  necklace: { x: '25%', y: '55%' },
  pen: { x: '65%', y: '60%' },
};

export function useStudentInventory(studentId: string | undefined) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('student_inventory')
        .select('*, accessory:accessories(*)')
        .eq('student_id', studentId);

      const items = (data || []) as InventoryItem[];
      setInventory(items);

      const equipped = items
        .filter((item) => item.is_equipped)
        .map((item) => {
          const offsets = TYPE_OFFSETS[item.accessory?.type?.toLowerCase()] || { x: '0%', y: '0%' };
          return {
            id: item.accessory_id,
            inventoryId: item.id,
            name: item.accessory?.name || '',
            type: item.accessory?.type || '',
            imageUrl: item.accessory?.image_url || null,
            hubRequirement: item.accessory?.hub_requirement || '',
            offsetX: offsets.x,
            offsetY: offsets.y,
          };
        });

      setEquippedItems(equipped);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const equipItem = useCallback(
    async (inventoryId: string, accessoryType: string) => {
      if (!studentId) return;

      // Unequip items of the same type first
      const sameTypeIds = inventory
        .filter((i) => i.accessory?.type === accessoryType && i.is_equipped)
        .map((i) => i.id);

      for (const id of sameTypeIds) {
        await supabase
          .from('student_inventory')
          .update({ is_equipped: false } as any)
          .eq('id', id);
      }

      await supabase
        .from('student_inventory')
        .update({ is_equipped: true } as any)
        .eq('id', inventoryId);

      await fetchInventory();
    },
    [studentId, inventory, fetchInventory],
  );

  const unequipItem = useCallback(
    async (inventoryId: string) => {
      await supabase
        .from('student_inventory')
        .update({ is_equipped: false } as any)
        .eq('id', inventoryId);

      await fetchInventory();
    },
    [fetchInventory],
  );

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    equippedItems,
    loading,
    equipItem,
    unequipItem,
    refetch: fetchInventory,
  };
}
