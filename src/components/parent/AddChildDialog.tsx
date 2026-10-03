import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  FamilyChildrenForm,
  MAX_FAMILY_CHILDREN,
  createFamilyChildren,
  emptyChild,
  isChildValid,
  type ChildDraft,
} from './FamilyChildrenForm';

interface Props {
  parentId: string;
  /** Children already linked to this parent. */
  existingCount: number;
  /** 'hero' = translucent button for the dark hero band; 'default' = solid violet. */
  variant?: 'hero' | 'default';
  /** How the parent is related to their children (mother/father/guardian/other); new children inherit it. */
  relationshipType?: string;
}

export function AddChildDialog({ parentId, existingCount, variant = 'default', relationshipType }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState<ChildDraft[]>([emptyChild()]);

  const room = MAX_FAMILY_CHILDREN - existingCount;
  const valid = children.length >= 1 && children.every(isChildValid);

  const handleOpenChange = (next: boolean) => {
    if (saving) return;
    setOpen(next);
    if (next) setChildren([emptyChild()]);
  };

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    const result = await createFamilyChildren(children, relationshipType);
    setSaving(false);

    if (result.error) {
      toast({ title: 'Couldn’t add your child', description: result.error.message, variant: 'destructive' });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['parent-students', parentId] });
    toast({ title: children.length === 1 ? 'Child added' : 'Children added' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={room <= 0}
          className={`fd-btn ${variant === 'hero' ? 'fd-btn--ghost-light' : 'fd-btn--hub'} disabled:opacity-50`}
        >
          <UserPlus className="h-5 w-5" aria-hidden /> {t('pd.hero.addChild')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a child</DialogTitle>
          <DialogDescription>
            Each child gets their own learning space. Lessons you buy are shared across the family.
          </DialogDescription>
        </DialogHeader>
        <FamilyChildrenForm value={children} onChange={setChildren} maxCount={Math.max(room, 1)} disabled={saving} />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!valid || saving}>
            {saving ? (<><Loader2 className="me-2 h-4 w-4 animate-spin" /> Saving…</>) : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
