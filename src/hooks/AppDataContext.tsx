import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PriceReport } from '../services/types';

const FAVORITES_KEY = '@yep/favorites';
const REPORTS_KEY = '@yep/reports';

interface AppDataValue {
  favorites: string[];
  reports: PriceReport[];
  ready: boolean;
  isFavorite: (stationId: string) => boolean;
  toggleFavorite: (stationId: string) => void;
  addReport: (report: PriceReport) => void;
}

const AppDataContext = createContext<AppDataValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reports, setReports] = useState<PriceReport[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const [storedFavorites, storedReports] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(REPORTS_KEY),
      ]);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
      setReady(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites, ready]);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    }
  }, [reports, ready]);

  const value = useMemo<AppDataValue>(
    () => ({
      favorites,
      reports,
      ready,
      isFavorite: (stationId) => favorites.includes(stationId),
      toggleFavorite: (stationId) =>
        setFavorites((prev) =>
          prev.includes(stationId)
            ? prev.filter((id) => id !== stationId)
            : [...prev, stationId],
        ),
      addReport: (report) => setReports((prev) => [report, ...prev]),
    }),
    [favorites, reports, ready],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData deve ser usado dentro de AppDataProvider');
  }
  return context;
}
