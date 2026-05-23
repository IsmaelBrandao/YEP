import { useEffect, useState } from 'react';
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

  async function requestLocation() {
    setState((prev) => ({ ...prev, loading: true }));
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
  }

  useEffect(() => {
    requestLocation();
  }, []);

  return { ...state, requestLocation };
}
