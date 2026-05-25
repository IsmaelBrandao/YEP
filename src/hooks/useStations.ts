import { useMemo } from 'react';

import { distanceKm } from '../services/geo';
import {
  Coordinate,
  Filters,
  FuelType,
  SortMode,
  StationWithDistance,
} from '../services/types';
import { useStationsData } from './StationsContext';

function fuelPrice(station: StationWithDistance, fuel: FuelType): number {
  const value = station.prices[fuel];
  return value == null ? Number.POSITIVE_INFINITY : value;
}

interface UseStationsParams {
  origin: Coordinate;
  filters: Filters;
  sortMode?: SortMode;
  radiusKm?: number;
}

export function useStations({ origin, filters, sortMode = 'distance', radiusKm }: UseStationsParams) {
  const { stations: allStations } = useStationsData();

  return useMemo<StationWithDistance[]>(() => {
    const withDistance: StationWithDistance[] = allStations.map((station) => ({
      ...station,
      distanceKm: distanceKm(origin, station.coordinate),
    }));

    const filtered = withDistance.filter((station) => {
      if (radiusKm != null && station.distanceKm > radiusKm) {
        return false;
      }
      if (filters.brands.length > 0 && !filters.brands.includes(station.brand)) {
        return false;
      }
      if (filters.fuel === 'gnv' && station.prices.gnv == null) {
        return false;
      }
      for (const service of filters.services) {
        if (!station.services[service]) {
          return false;
        }
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortMode === 'price') {
        return fuelPrice(a, filters.fuel) - fuelPrice(b, filters.fuel);
      }
      return a.distanceKm - b.distanceKm;
    });
  }, [allStations, origin, filters, sortMode, radiusKm]);
}
