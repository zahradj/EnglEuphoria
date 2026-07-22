import { useState, useEffect } from 'react';
import { bookingValidationService } from '@/services/bookingValidationService';
import { useStudentCredits } from './useStudentCredits';

interface PackageValidationResult {
  hasActivePackages: boolean;
  totalCredits: number;
  trialAvailable: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

// Package-based pricing (lessonPricingService) was retired — the real
// student_credits table is the sole source of truth for how many
// lessons a student can book. This hook now only layers trial
// eligibility on top of that.
export const usePackageValidation = (studentId: string | null): PackageValidationResult => {
  const [trialAvailable, setTrialAvailable] = useState(false);
  const [trialLoading, setTrialLoading] = useState(true);

  const { availableCredits, loading: creditsLoading, refresh: refreshCredits } = useStudentCredits(studentId);

  const loadTrialEligibility = async () => {
    if (!studentId) {
      setTrialLoading(false);
      return;
    }

    try {
      setTrialLoading(true);
      const isTrialEligible = await bookingValidationService.isEligibleForTrial(studentId);
      setTrialAvailable(isTrialEligible);
    } catch (error) {
      console.error('Error checking trial eligibility:', error);
      setTrialAvailable(false);
    } finally {
      setTrialLoading(false);
    }
  };

  useEffect(() => {
    loadTrialEligibility();
  }, [studentId]);

  const totalCredits = availableCredits;
  const hasActivePackages = totalCredits > 0;

  const refresh = async () => {
    await Promise.all([loadTrialEligibility(), refreshCredits()]);
  };

  return {
    hasActivePackages,
    totalCredits,
    trialAvailable,
    loading: trialLoading || creditsLoading,
    refresh,
  };
};
