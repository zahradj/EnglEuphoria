import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useOrganization } from './useOrganization';

interface FeatureFlag {
  id: string;
  flag_name: string;
  is_enabled: boolean;
  conditions: any;
}

interface FeatureFlagsContextType {
  flags: Record<string, boolean>;
  loading: boolean;
  isEnabled: (flagName: string) => boolean;
  enableFlag: (flagName: string) => Promise<void>;
  disableFlag: (flagName: string) => Promise<void>;
  setFlagConditions: (flagName: string, conditions: any) => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const FeatureFlagsProvider = ({ children }: { children: React.ReactNode }) => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (currentOrganization) {
      loadFeatureFlags();
    }
  }, [currentOrganization]);

  const loadFeatureFlags = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feature_flags')
        .select('flag_name, is_enabled, conditions')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      const flagsMap = data?.reduce((acc, flag) => {
        acc[flag.flag_name] = flag.is_enabled;
        return acc;
      }, {} as Record<string, boolean>) || {};

      setFlags(flagsMap);
    } catch (error) {
      console.error('Error loading feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (flagName: string): boolean => {
    return flags[flagName] || false;
  };

  const enableFlag = async (flagName: string) => {
    if (!currentOrganization) return;

    try {
      const { error } = await supabase
        .from('feature_flags')
        .upsert([{
          organization_id: currentOrganization.id,
          flag_name: flagName,
          is_enabled: true
        }]);

      if (error) throw error;

      setFlags(prev => ({ ...prev, [flagName]: true }));
    } catch (error) {
      console.error('Error enabling feature flag:', error);
    }
  };

  const disableFlag = async (flagName: string) => {
    if (!currentOrganization) return;

    try {
      const { error } = await supabase
        .from('feature_flags')
        .upsert([{
          organization_id: currentOrganization.id,
          flag_name: flagName,
          is_enabled: false
        }]);

      if (error) throw error;

      setFlags(prev => ({ ...prev, [flagName]: false }));
    } catch (error) {
      console.error('Error disabling feature flag:', error);
    }
  };

  const setFlagConditions = async (flagName: string, conditions: any) => {
    if (!currentOrganization) return;

    try {
      const { error } = await supabase
        .from('feature_flags')
        .upsert([{
          organization_id: currentOrganization.id,
          flag_name: flagName,
          conditions
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting feature flag conditions:', error);
    }
  };

  return (
    <FeatureFlagsContext.Provider value={{
      flags,
      loading,
      isEnabled,
      enableFlag,
      disableFlag,
      setFlagConditions
    }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};