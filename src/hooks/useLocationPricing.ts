
import { useState, useEffect } from 'react';
import { detectUserLocation, LocationInfo } from '@/services/locationService';

export const useLocationPricing = () => {
  const [selectedRegion, setSelectedRegion] = useState<'algeria' | 'international'>('international');
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        setIsLoading(true);
        const location = await detectUserLocation();
        setLocationInfo(location);
        setSelectedRegion(location.region);
      } catch (error) {
        console.error('Failed to detect location:', error);
        setSelectedRegion('international');
      } finally {
        setIsLoading(false);
      }
    };

    loadLocation();
  }, []);

  const handleRegionChange = (region: 'algeria' | 'international') => {
    setSelectedRegion(region);
  };

  return {
    selectedRegion,
    locationInfo,
    isLoading,
    handleRegionChange
  };
};
