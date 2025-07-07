import { useState, useEffect, useCallback, useRef } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  supportsTouch: boolean;
  supportsPWA: boolean;
  isStandalone: boolean;
  platform: string;
  userAgent: string;
}

interface TouchGesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  distance: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  duration: number;
  isSwipe: boolean;
  isPinch: boolean;
  scale?: number;
}

interface MobileFeatures {
  hapticFeedback: (type?: 'light' | 'medium' | 'heavy') => void;
  shareContent: (data: ShareData) => Promise<boolean>;
  installPWA: () => Promise<boolean>;
  goFullscreen: () => Promise<boolean>;
  exitFullscreen: () => Promise<boolean>;
  lockOrientation: (orientation: OrientationLockType) => Promise<boolean>;
  unlockOrientation: () => Promise<boolean>;
  getNetworkInfo: () => NetworkInformation | null;
  getBatteryInfo: () => Promise<BatteryManager | null>;
  requestWakeLock: () => Promise<WakeLockSentinel | null>;
  releaseWakeLock: () => Promise<void>;
}

interface UseMobileOptions {
  enableGestures?: boolean;
  gestureThreshold?: number;
  debounceResize?: number;
  trackOrientation?: boolean;
  trackNetwork?: boolean;
  trackBattery?: boolean;
}

interface TouchEventHandlers {
  onSwipeUp?: (gesture: TouchGesture) => void;
  onSwipeDown?: (gesture: TouchGesture) => void;
  onSwipeLeft?: (gesture: TouchGesture) => void;
  onSwipeRight?: (gesture: TouchGesture) => void;
  onPinch?: (gesture: TouchGesture) => void;
  onTap?: (gesture: TouchGesture) => void;
  onLongPress?: (gesture: TouchGesture) => void;
}

// Extended interfaces for better type safety
interface NetworkInformation extends EventTarget {
  readonly connection?: {
    readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
    readonly type: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    readonly downlink: number;
    readonly rtt: number;
    readonly saveData: boolean;
  };
}

interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

type OrientationLockType = 
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary';

export function useMobile(options: UseMobileOptions = {}): {
  deviceInfo: DeviceInfo;
  touchHandlers: TouchEventHandlers & {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  features: MobileFeatures;
  isOnline: boolean;
  batteryInfo: BatteryManager | null;
  networkInfo: NetworkInformation | null;
  isInstallable: boolean;
  isFullscreen: boolean;
  wakeLock: WakeLockSentinel | null;
} {
  const {
    enableGestures = true,
    gestureThreshold = 50,
    debounceResize = 250,
    trackOrientation = true,
    trackNetwork = true,
    trackBattery = true
  } = options;

  // Device info state
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getInitialDeviceInfo());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryInfo, setBatteryInfo] = useState<BatteryManager | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInformation | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  // Touch gesture state
  const touchStartRef = useRef<{ x: number; y: number; time: number; touches: Touch[] } | null>(null);
  const touchHandlersRef = useRef<TouchEventHandlers>({});
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gestureRef = useRef<TouchGesture | null>(null);

  // PWA installation prompt
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  // Get initial device info
  function getInitialDeviceInfo(): DeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024,
      screenWidth: width,
      screenHeight: height,
      devicePixelRatio: window.devicePixelRatio || 1,
      orientation: width > height ? 'landscape' : 'portrait',
      supportsTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      supportsPWA: 'serviceWorker' in navigator && 'PushManager' in window,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                   (window.navigator as any).standalone === true,
      platform: navigator.platform,
      userAgent: navigator.userAgent
    };
  }

  // Update device info on window resize
  const updateDeviceInfo = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setDeviceInfo(prev => ({
      ...prev,
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait'
    }));
  }, []);

  // Debounced resize handler
  const debouncedResize = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDeviceInfo, debounceResize);
    };
  }, [updateDeviceInfo, debounceResize]);

  // Haptic feedback
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Share content
  const shareContent = useCallback(async (data: ShareData): Promise<boolean> => {
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }
    
    // Fallback to clipboard
    if (data.url && 'clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('Clipboard write failed:', error);
        return false;
      }
    }
    
    return false;
  }, []);

  // Install PWA
  const installPWA = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        (deferredPrompt as any).prompt();
        const { outcome } = await (deferredPrompt as any).userChoice;
        setDeferredPrompt(null);
        setIsInstallable(false);
        return outcome === 'accepted';
      } catch (error) {
        console.error('PWA installation failed:', error);
        return false;
      }
    }
    return false;
  }, [deferredPrompt]);

  // Fullscreen methods
  const goFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        return true;
      }
    } catch (error) {
      console.error('Fullscreen request failed:', error);
    }
    return false;
  }, []);

  const exitFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return true;
      }
    } catch (error) {
      console.error('Exit fullscreen failed:', error);
    }
    return false;
  }, []);

  // Orientation methods
  const lockOrientation = useCallback(async (orientation: OrientationLockType): Promise<boolean> => {
    try {
      if ('orientation' in screen && 'lock' in screen.orientation) {
        await screen.orientation.lock(orientation);
        return true;
      }
    } catch (error) {
      console.error('Orientation lock failed:', error);
    }
    return false;
  }, []);

  const unlockOrientation = useCallback(async (): Promise<boolean> => {
    try {
      if ('orientation' in screen && 'unlock' in screen.orientation) {
        screen.orientation.unlock();
        return true;
      }
    } catch (error) {
      console.error('Orientation unlock failed:', error);
    }
    return false;
  }, []);

  // Network info
  const getNetworkInfo = useCallback((): NetworkInformation | null => {
    if ('connection' in navigator) {
      return navigator as NetworkInformation;
    }
    return null;
  }, []);

  // Battery info
  const getBatteryInfo = useCallback(async (): Promise<BatteryManager | null> => {
    try {
      if ('getBattery' in navigator) {
        return await (navigator as any).getBattery();
      }
    } catch (error) {
      console.error('Battery info not available:', error);
    }
    return null;
  }, []);

  // Wake lock
  const requestWakeLock = useCallback(async (): Promise<WakeLockSentinel | null> => {
    try {
      if ('wakeLock' in navigator) {
        const wakeLockSentinel = await navigator.wakeLock.request('screen');
        setWakeLock(wakeLockSentinel);
        return wakeLockSentinel;
      }
    } catch (error) {
      console.error('Wake lock request failed:', error);
    }
    return null;
  }, []);

  const releaseWakeLock = useCallback(async (): Promise<void> => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
      } catch (error) {
        console.error('Wake lock release failed:', error);
      }
    }
  }, [wakeLock]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableGestures) return;

    const touch = e.touches[0];
    const time = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time,
      touches: Array.from(e.touches)
    };

    // Start long press timer
    if (touchHandlersRef.current.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          const gesture: TouchGesture = {
            startX: touchStartRef.current.x,
            startY: touchStartRef.current.y,
            endX: touchStartRef.current.x,
            endY: touchStartRef.current.y,
            distance: 0,
            direction: null,
            duration: Date.now() - touchStartRef.current.time,
            isSwipe: false,
            isPinch: false
          };
          touchHandlersRef.current.onLongPress?.(gesture);
          hapticFeedback('medium');
        }
      }, 500);
    }
  }, [enableGestures, hapticFeedback]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !touchStartRef.current) return;

    // Handle pinch gesture
    if (e.touches.length === 2 && touchStartRef.current.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const startTouch1 = touchStartRef.current.touches[0];
      const startTouch2 = touchStartRef.current.touches[1];

      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const startDistance = Math.hypot(
        startTouch2.clientX - startTouch1.clientX,
        startTouch2.clientY - startTouch1.clientY
      );

      const scale = currentDistance / startDistance;

      const gesture: TouchGesture = {
        startX: (startTouch1.clientX + startTouch2.clientX) / 2,
        startY: (startTouch1.clientY + startTouch2.clientY) / 2,
        endX: (touch1.clientX + touch2.clientX) / 2,
        endY: (touch1.clientY + touch2.clientY) / 2,
        distance: Math.abs(currentDistance - startDistance),
        direction: null,
        duration: Date.now() - touchStartRef.current.time,
        isSwipe: false,
        isPinch: true,
        scale
      };

      gestureRef.current = gesture;
      touchHandlersRef.current.onPinch?.(gesture);
    }

    // Cancel long press if moving
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, [enableGestures]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !touchStartRef.current) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.hypot(deltaX, deltaY);
    const duration = Date.now() - touchStartRef.current.time;

    const gesture: TouchGesture = {
      startX: touchStartRef.current.x,
      startY: touchStartRef.current.y,
      endX: touch.clientX,
      endY: touch.clientY,
      distance,
      direction: null,
      duration,
      isSwipe: distance >= gestureThreshold,
      isPinch: false
    };

    // Determine direction for swipes
    if (gesture.isSwipe) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > absY) {
        gesture.direction = deltaX > 0 ? 'right' : 'left';
      } else {
        gesture.direction = deltaY > 0 ? 'down' : 'up';
      }

      // Call appropriate swipe handler
      switch (gesture.direction) {
        case 'up':
          touchHandlersRef.current.onSwipeUp?.(gesture);
          break;
        case 'down':
          touchHandlersRef.current.onSwipeDown?.(gesture);
          break;
        case 'left':
          touchHandlersRef.current.onSwipeLeft?.(gesture);
          break;
        case 'right':
          touchHandlersRef.current.onSwipeRight?.(gesture);
          break;
      }

      hapticFeedback('light');
    } else if (distance < 10 && duration < 300) {
      // Simple tap
      touchHandlersRef.current.onTap?.(gesture);
    }

    touchStartRef.current = null;
    gestureRef.current = null;
  }, [enableGestures, gestureThreshold, hapticFeedback]);

  // Set up event listeners
  useEffect(() => {
    const handleResize = debouncedResize();
    window.addEventListener('resize', handleResize);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fullscreen change
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Orientation change
    if (trackOrientation) {
      const handleOrientationChange = () => {
        updateDeviceInfo();
      };
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    // Network info
    if (trackNetwork && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo(connection);
      
      const handleConnectionChange = () => {
        setNetworkInfo(connection);
      };
      connection?.addEventListener('change', handleConnectionChange);
    }

    // Battery info
    if (trackBattery) {
      getBatteryInfo().then(battery => {
        if (battery) {
          setBatteryInfo(battery);
          
          const updateBattery = () => setBatteryInfo({ ...battery });
          battery.addEventListener('chargingchange', updateBattery);
          battery.addEventListener('levelchange', updateBattery);
        }
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      if (trackOrientation) {
        window.removeEventListener('orientationchange', updateDeviceInfo);
      }
    };
  }, [debouncedResize, updateDeviceInfo, trackOrientation, trackNetwork, trackBattery, getBatteryInfo]);

  // Update touch handlers ref
  useEffect(() => {
    touchHandlersRef.current = {
      onSwipeUp: touchHandlersRef.current.onSwipeUp,
      onSwipeDown: touchHandlersRef.current.onSwipeDown,
      onSwipeLeft: touchHandlersRef.current.onSwipeLeft,
      onSwipeRight: touchHandlersRef.current.onSwipeRight,
      onPinch: touchHandlersRef.current.onPinch,
      onTap: touchHandlersRef.current.onTap,
      onLongPress: touchHandlersRef.current.onLongPress
    };
  });

  const features: MobileFeatures = {
    hapticFeedback,
    shareContent,
    installPWA,
    goFullscreen,
    exitFullscreen,
    lockOrientation,
    unlockOrientation,
    getNetworkInfo,
    getBatteryInfo,
    requestWakeLock,
    releaseWakeLock
  };

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onSwipeUp: (handler: (gesture: TouchGesture) => void) => {
      touchHandlersRef.current.onSwipeUp = handler;
    },
    onSwipeDown: (handler: (gesture: TouchGesture) => void) => {
      touchHandlersRef.current.onSwipeDown = handler;
    },
    onSwipeLeft: (handler: (gesture: TouchGesture) => void) => {
      touchHandlersRef.current.onSwipeLeft = handler;
    },
    onSwipeRight: (handler: (gesture: TouchGesture) => void) => {
      touchHandlersRef.current.onSwipeRight = handler;
    },
    onPinch: (handler: (gesture: TouchGesture) => void) => {
      touchHandlersRef.current.onPinch = handler;
    },
    onTap: (handler: (gesture: TouchGesture) => void) => {
      touchHandlersRef.current.onTap = handler;
    },
    onLongPress: (handler: (gesture: TouchGesture) => void) => {
      touchHandlersRef.current.onLongPress = handler;
    }
  };

  return {
    deviceInfo,
    touchHandlers,
    features,
    isOnline,
    batteryInfo,
    networkInfo,
    isInstallable,
    isFullscreen,
    wakeLock
  };
} 