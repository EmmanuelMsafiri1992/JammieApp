import React, { useEffect, useState, useCallback } from 'react';

interface AppVersion {
  version: string;
  timestamp: number;
}

export const useAppUpdater = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const getCurrentVersion = (): AppVersion => {
    const stored = localStorage.getItem('app-version');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Invalid stored version, create new one
      }
    }
    
    const newVersion = {
      version: Date.now().toString(),
      timestamp: Date.now()
    };
    localStorage.setItem('app-version', JSON.stringify(newVersion));
    return newVersion;
  };

  const checkForUpdates = useCallback(async () => {
    setIsChecking(true);
    try {
      // Add cache-busting parameter to force fresh fetch
      const response = await fetch(`/src/main.tsx?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const currentVersion = getCurrentVersion();
        const serverTimestamp = response.headers.get('last-modified');
        
        if (serverTimestamp) {
          const serverTime = new Date(serverTimestamp).getTime();
          if (serverTime > currentVersion.timestamp) {
            setUpdateAvailable(true);
            return true;
          }
        }
      }
    } catch (error) {
      console.log('Update check failed:', error);
    } finally {
      setIsChecking(false);
    }
    return false;
  }, []);

  const applyUpdate = () => {
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Clear localStorage version
    localStorage.removeItem('app-version');
    
    // Force reload
    window.location.reload();
  };

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates();
    
    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkForUpdates, 30000);
    
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return {
    updateAvailable,
    isChecking,
    checkForUpdates,
    applyUpdate
  };
};