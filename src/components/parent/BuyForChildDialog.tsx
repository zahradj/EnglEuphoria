import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FamilyPackList, type FamilyLearner } from './FamilyPackList';

export type { FamilyLearner } from './FamilyPackList';

interface Props {
  learner: FamilyLearner | null;
  onOpenChange: (open: boolean) => void;
}

/** A parent picks a pack for one child; checkout is paid by the parent and the lessons go to the child. */
export function BuyForChildDialog({ learner, onOpenChange }: Props) {
  return (
    <Dialog open={!!learner} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy lessons for {learner?.name}</DialogTitle>
          <DialogDescription>
            You pay once and the lessons go straight to {learner?.name}. Each lesson is 25 minutes.
          </DialogDescription>
        </DialogHeader>
        {learner && <FamilyPackList key={learner.studentId} learner={learner} />}
      </DialogContent>
    </Dialog>
  );
}
