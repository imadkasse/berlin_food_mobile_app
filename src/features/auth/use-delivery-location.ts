import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { getErrorMessage } from './errors';

export type Coordinates = {
  lat: number;
  lng: number;
};

/**
 * Foreground location for the delivery-address step. The map picker itself is
 * intentionally deferred — no map SDK has been chosen for the mobile app yet.
 */
export function useDeliveryLocation(initialCoordinates: Coordinates | null = null) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initialCoordinates);
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    setIsLocating(true);
    setMessage(null);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        setMessage(
          'Location services are turned off. Enable them in your device settings or enter the coordinates manually.'
        );
        return null;
      }

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setMessage(
          permission.canAskAgain
            ? 'Location permission is needed to find you. You can allow it in settings or enter the coordinates manually.'
            : 'Location permission is blocked. Enable it in your device settings or enter the coordinates manually.'
        );
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const next = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setCoordinates(next);
      return next;
    } catch (caught) {
      setMessage(
        getErrorMessage(caught, 'We could not read your location. Enter the coordinates manually.')
      );
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  const setManualCoordinates = useCallback((next: Coordinates) => {
    setCoordinates(next);
    setMessage(null);
  }, []);

  return { coordinates, isLocating, message, requestLocation, setManualCoordinates };
}
