'use client';

import { useEffect } from 'react';

/**
 * Automatically cleans up any lingering Service Workers on localhost
 * (such as Firebase Cloud Messaging service workers from other projects sharing localhost:3000).
 */
export function ServiceWorkerCleaner() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      }).catch(() => {
        // Ignore unregistration errors in dev environments
      });
    }
  }, []);

  return null;
}
