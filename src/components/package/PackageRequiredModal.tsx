import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, CreditCard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PackageRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const PackageRequiredModal: React.FC<PackageRequiredModalProps> = ({
  isOpen,
  onClose,
  title = "Lesson Package Required",
  description = "You need to purchase a lesson package before you can book lessons with our teachers."
}) => {
  const navigate = useNavigate();

  const handlePurchasePackage = () => {
    onClose();
    navigate('/pricing');
  };

  const handleViewPackages = () => {
    onClose();
    navigate('/student');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-student/10">
            <Package className="h-8 w-8 text-student" />
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-student" />
              Why Purchase a Package?
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pre-paid credits ensure guaranteed lesson access</li>
              <li>• Secure payment before booking</li>
              <li>• Better value with package discounts</li>
              <li>• Easy tracking of remaining lessons</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleViewPackages}>
            View My Packages
          </Button>
          <Button 
            onClick={handlePurchasePackage}
            className="bg-gradient-to-r from-student to-student-accent hover:from-student-dark hover:to-student text-white"
          >
            Purchase Package
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};