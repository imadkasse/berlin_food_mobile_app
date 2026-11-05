import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { errorMessage } from '../lib/format';

export type CourierLocation = { lat: number; lng: number } | null;

export type CourierLocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export type UseCourierLocationResult = {
  location: CourierLocation;
  status: CourierLocationStatus;
  error: string | null;
};

/**
 * Reads the courier's current position once on mount so the active-delivery
 * map can show a real pickup pin and driving route.
 *
 * Location is a progressive enhancement: denial, missing services and any
 * failure resolve to a status instead of throwing, and the screen keeps
 * working with a destination-only map. No watchers or background tasks.
 */
export function useCourierLocation(): UseCourierLocationResult {
  const [location, setLocation] = useState<CourierLocation>(null);
  const [status, setStatus] = useState<CourierLocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const resolve = async () => {
      try {
        setStatus('requesting');

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!active) return;

        if (!servicesEnabled) {
          setStatus('unavailable');
          setError('Location services are turned off. Enable them to see your route on the map.');
          return;
        }

        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;

        if (permission.status !== 'granted') {
          setStatus('denied');
          setError(
            permission.canAskAgain
              ? 'Location permission is needed to show your position on the map.'
              : 'Location permission is blocked. Enable it in your device settings to see your position.'
          );
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!active) return;

        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!Number.isFinite(next.lat) || !Number.isFinite(next.lng)) {
          setStatus('unavailable');
          setError('We could not read your position. Showing the destination only.');
          return;
        }

        setLocation(next);
        setError(null);
        setStatus('granted');
      } catch (caught) {
        if (!active) return;
        setStatus('unavailable');
        setError(
          errorMessage(caught, 'We could not read your position. Showing the destination only.')
        );
      }
    };

    void resolve();

    return () => {
      active = false;
    };
  }, []);

  return { location, status, error };
}
