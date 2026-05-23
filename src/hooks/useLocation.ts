import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { Coordinate } from '../services/types';

const FORTALEZA_CENTER: Coordinate = { latitude: -3.7319, longitude: -38.5267 };
const LOCATION_TIMEOUT = 8000;

interface LocationState {
  coordinate: Coordinate;
  loading: boolean;
  permissionDenied: boolean;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coordinate: FORTALEZA_CENTER,
    loading: true,
    permissionDenied: false,
  });

  const loadLocation = useCallback(async () => {
    try {
      const { status } = await withTimeout(
        Location.requestForegroundPermissionsAsync(),
        LOCATION_TIMEOUT,
      );

      if (status !== 'granted') {
        setState({ coordinate: FORTALEZA_CENTER, loading: false, permissionDenied: true });
        return;
      }

      const position = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        LOCATION_TIMEOUT,
      );

      setState({
        coordinate: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        loading: false,
        permissionDenied: false,
      });
    } catch {
      setState({ coordinate: FORTALEZA_CENTER, loading: false, permissionDenied: false });
    }
  }, []);

  const requestLocation = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLocation();
  }, [loadLocation]);

  return { ...state, requestLocation };
}
