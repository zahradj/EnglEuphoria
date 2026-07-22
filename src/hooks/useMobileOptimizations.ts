import { useEffect, useState } from 'react';
import { useDeviceCapabilities } from './useDeviceCapabilities';

interface MobileOptimizations {
  reducedAnimations: boolean;
  optimizedImages: boolean;
  limitedParallaxEffects: boolean;
  reducedMotion: boolean;
  batteryAware: boolean;
}

export const useMobileOptimizations = () => {
  const { capabilities } = useDeviceCapabilities();
  const [optimizations, setOptimizations] = useState<MobileOptimizations>({
    reducedAnimations: false,
    optimizedImages: false,
    limitedParallaxEffects: false,
    reducedMotion: false,
    batteryAware: false
  });

  useEffect(() => {
    const applyOptimizations = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check battery status if available
      const getBatteryInfo = async () => {
        if ('getBattery' in navigator) {
          try {
            const battery = await (navigator as any).getBattery();
            return {
              level: battery.level,
              charging: battery.charging
            };
          } catch (error) {
            return null;
          }
        }
        return null;
      };

      getBatteryInfo().then(battery => {
        const lowBattery = battery && battery.level < 0.2 && !battery.charging;
        
        setOptimizations({
          reducedAnimations: capabilities.isMobile || prefersReducedMotion || !!lowBattery,
          optimizedImages: capabilities.isMobile,
          limitedParallaxEffects: capabilities.isMobile,
          reducedMotion: prefersReducedMotion,
          batteryAware: !!lowBattery
        });
      });
    };

    applyOptimizations();

    // Listen for battery changes
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const handleBatteryChange = () => applyOptimizations();
        battery.addEventListener('levelchange', handleBatteryChange);
        battery.addEventListener('chargingchange', handleBatteryChange);
        
        return () => {
          battery.removeEventListener('levelchange', handleBatteryChange);
          battery.removeEventListener('chargingchange', handleBatteryChange);
        };
      });
    }

    // Listen for motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => applyOptimizations();
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [capabilities.isMobile]);

  return {
    optimizations,
    shouldReduceAnimations: optimizations.reducedAnimations,
    shouldOptimizeImages: optimizations.optimizedImages,
    shouldLimitParallax: optimizations.limitedParallaxEffects,
    isBatteryAware: optimizations.batteryAware
  };
};