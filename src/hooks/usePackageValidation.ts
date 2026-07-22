import { useState, useEffect } from 'react';
import { StudentPackagePurchase } from '@/types/pricing';
import { lessonPricingService } from '@/services/lessonPricingService';
import { bookingValidationService } from '@/services/bookingValidationService';
import { useStudentCredits } from './useStudentCredits';

interface PackageValidationResult {
  hasActivePackages: boolean;
  packages: StudentPackagePurchase[];
  totalCredits: number;
  trialAvailable: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const usePackageValidation = (studentId: string | null): PackageValidationResult => {
  const [packages, setPackages] = useState<StudentPackagePurchase[]>([]);
  const [trialAvailable, setTrialAvailable] = useState(false);
  const [packageLoading, setPackageLoading] = useState(true);

  // Use the real student_credits table as the source of truth
  const { availableCredits, loading: creditsLoading, refresh: refreshCredits } = useStudentCredits(studentId);

  const loadPackages = async () => {
    if (!studentId) {
      setPackageLoading(false);
      return;
    }

    try {
      setPackageLoading(true);
      const [data, isTrialEligible] = await Promise.all([
        lessonPricingService.getStudentPackages(studentId),
        bookingValidationService.isEligibleForTrial(studentId),
      ]);
      setPackages(data);
      setTrialAvailable(isTrialEligible);
    } catch (error) {
      console.error('Error loading packages for validation:', error);
      setPackages([]);
      setTrialAvailable(false);
    } finally {
      setPackageLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [studentId]);

  // Combine: student has credits if real balance > 0 OR has package-based credits
  const packageCredits = packages.reduce((sum, pkg) => sum + pkg.lessons_remaining, 0);
  const totalCredits = availableCredits + packageCredits;
  const hasActivePackages = totalCredits > 0;

  const refresh = async () => {
    await Promise.all([loadPackages(), refreshCredits()]);
  };

  return {
    hasActivePackages,
    packages,
    totalCredits,
    trialAvailable,
    loading: packageLoading || creditsLoading,
    refresh,
  };
};
