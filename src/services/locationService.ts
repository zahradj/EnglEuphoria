
export interface RegionConfig {
  name: string;
  flag: string;
  currency: string;
  description: string;
  paymentMethods: string[];
}

export interface LocationInfo {
  country: string;
  region: 'algeria' | 'international';
  detected: boolean;
}

export const getRegionConfig = (region: 'algeria' | 'international'): RegionConfig => {
  const configs: Record<string, RegionConfig> = {
    algeria: {
      name: 'Algeria',
      flag: '🇩🇿',
      currency: 'DZD',
      description: 'Specialized pricing for Algerian students',
      paymentMethods: ['BaridiMob', 'CIB Bank']
    },
    international: {
      name: 'International',
      flag: '🌍',
      currency: 'EUR',
      description: 'International pricing in Euros',
      paymentMethods: ['Bank Transfer', 'SEPA']
    }
  };

  return configs[region] || configs.international;
};

export const detectUserRegion = async (): Promise<'algeria' | 'international'> => {
  try {
    // In production, this could use IP geolocation or user preferences
    // For now, default to Algeria as the primary market
    return 'algeria';
  } catch (error) {
    console.error('Failed to detect user region:', error);
    return 'algeria';
  }
};

export const detectUserLocation = async (): Promise<LocationInfo> => {
  try {
    // In production, this would use a real IP geolocation service
    // For now, return Algeria as the default
    const region = await detectUserRegion();
    
    return {
      country: region === 'algeria' ? 'Algeria' : 'International',
      region,
      detected: true
    };
  } catch (error) {
    console.error('Failed to detect user location:', error);
    return {
      country: 'Algeria',
      region: 'algeria',
      detected: false
    };
  }
};
