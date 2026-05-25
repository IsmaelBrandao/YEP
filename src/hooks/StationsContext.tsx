import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { fetchStations } from '../services/stationsApi';
import { stations as bundledStations } from '../services/stations';
import { Station } from '../services/types';

interface StationsValue {
  stations: Station[];
  loading: boolean;
  getById: (id: string) => Station | undefined;
}

const StationsContext = createContext<StationsValue | undefined>(undefined);

export function StationsProvider({ children }: { children: React.ReactNode }) {
  const [stations, setStations] = useState<Station[]>(bundledStations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchStations().then((data) => {
      if (active) {
        setStations(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<StationsValue>(
    () => ({
      stations,
      loading,
      getById: (id) => stations.find((station) => station.id === id),
    }),
    [stations, loading],
  );

  return <StationsContext.Provider value={value}>{children}</StationsContext.Provider>;
}

export function useStationsData(): StationsValue {
  const context = useContext(StationsContext);
  if (!context) {
    throw new Error('useStationsData deve ser usado dentro de StationsProvider');
  }
  return context;
}
