import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { Coordinate } from '../services/types';

const FORTALEZA_CENTER: Coordinate = { latitude: -3.7319, longitude: -38.5267 };

interface LocationState {
  coordinate: Coordinate;
  loading: boolean;
  permissionDenied: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coordinate: FORTALEZA_CENTER,
    loading: true,
    permissionDenied: false,
  });

  const loadLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setState({
        coordinate: FORTALEZA_CENTER,
        loading: false,
        permissionDenied: true,
      });
      return;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    setState({
      coordinate: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      loading: false,
      permissionDenied: false,
    });
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
