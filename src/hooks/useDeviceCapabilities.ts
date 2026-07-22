import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  isTouchDevice: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  supportsWebRTC: boolean;
  supportsGeolocation: boolean;
  supportsVibration: boolean;
  supportsOrientationChange: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
}

export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return {
      isTouchDevice,
      hasCamera: false, // Will be determined async
      hasMicrophone: false, // Will be determined async
      supportsWebRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      supportsGeolocation: 'geolocation' in navigator,
      supportsVibration: 'vibrate' in navigator,
      supportsOrientationChange: 'orientation' in window || 'onorientationchange' in window,
      isIOS,
      isAndroid,
      isMobile: isTouchDevice && window.innerWidth < 768,
      isTablet: isTouchDevice && window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: !isTouchDevice || window.innerWidth >= 1024,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };
  });

  useEffect(() => {
    // Check camera and microphone capabilities
    const checkMediaCapabilities = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');
        
        setCapabilities(prev => ({
          ...prev,
          hasCamera,
          hasMicrophone
        }));
      } catch (error) {
        console.warn('Could not enumerate media devices:', error);
      }
    };

    if (capabilities.supportsWebRTC) {
      checkMediaCapabilities();
    }

    // Handle resize and orientation changes
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setCapabilities(prev => ({
        ...prev,
        screenSize: { width, height },
        orientation: width > height ? 'landscape' : 'portrait',
        isMobile: prev.isTouchDevice && width < 768,
        isTablet: prev.isTouchDevice && width >= 768 && width < 1024,
        isDesktop: !prev.isTouchDevice || width >= 1024
      }));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [capabilities.supportsWebRTC, capabilities.isTouchDevice]);

  const requestCameraPermission = async () => {
    if (!capabilities.supportsWebRTC) return false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  };

  const requestMicrophonePermission = async () => {
    if (!capabilities.supportsWebRTC) return false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  };

  const vibrateDevice = (pattern: number | number[] = 100) => {
    if (capabilities.supportsVibration) {
      navigator.vibrate(pattern);
    }
  };

  const getDeviceOrientation = async (): Promise<DeviceOrientationEvent | null> => {
    if (!capabilities.supportsOrientationChange) return null;
    
    try {
      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') return null;
      }
      
      return new Promise((resolve) => {
        const handler = (event: DeviceOrientationEvent) => {
          window.removeEventListener('deviceorientation', handler);
          resolve(event);
        };
        window.addEventListener('deviceorientation', handler);
      });
    } catch (error) {
      console.error('Device orientation not supported:', error);
      return null;
    }
  };

  return {
    capabilities,
    requestCameraPermission,
    requestMicrophonePermission,
    vibrateDevice,
    getDeviceOrientation
  };
};