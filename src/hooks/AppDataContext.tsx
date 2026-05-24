import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '../services/supabase';
import { FuelType, PriceReport } from '../services/types';
import { useAuth } from './AuthContext';

interface ReportInput {
  stationId: string;
  stationName: string;
  fuel: FuelType;
  price: number;
  photoUri: string | null;
}

interface AppDataValue {
  favorites: string[];
  reports: PriceReport[];
  ready: boolean;
  isFavorite: (stationId: string) => boolean;
  toggleFavorite: (stationId: string) => Promise<void>;
  addReport: (input: ReportInput) => Promise<void>;
}

interface ReportRow {
  id: string;
  station_id: string;
  station_name: string;
  fuel: FuelType;
  price: number;
  photo_uri: string | null;
  created_at: string;
}

const AppDataContext = createContext<AppDataValue | undefined>(undefined);

function mapReport(row: ReportRow): PriceReport {
  return {
    id: row.id,
    stationId: row.station_id,
    stationName: row.station_name,
    fuel: row.fuel,
    price: Number(row.price),
    photoUri: row.photo_uri,
    reportedAt: row.created_at,
  };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reports, setReports] = useState<PriceReport[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setReports([]);
      setReady(true);
      return;
    }
    setReady(false);
    try {
      const [favsResult, repsResult] = await Promise.all([
        supabase.from('favorites').select('station_id').eq('user_id', user.id),
        supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      setFavorites((favsResult.data ?? []).map((row: { station_id: string }) => row.station_id));
      setReports((repsResult.data ?? []).map(mapReport));
    } catch {
      setFavorites([]);
      setReports([]);
    } finally {
      setReady(true);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const toggleFavorite = useCallback(
    async (stationId: string) => {
      if (!user) {
        return;
      }
      const active = favorites.includes(stationId);
      setFavorites((prev) =>
        active ? prev.filter((id) => id !== stationId) : [...prev, stationId],
      );
      if (active) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('station_id', stationId);
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, station_id: stationId });
      }
    },
    [user, favorites],
  );

  const addReport = useCallback(
    async (input: ReportInput) => {
      if (!user) {
        return;
      }
      const { data } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          station_id: input.stationId,
          station_name: input.stationName,
          fuel: input.fuel,
          price: input.price,
          photo_uri: input.photoUri,
        })
        .select()
        .single();
      if (data) {
        setReports((prev) => [mapReport(data as ReportRow), ...prev]);
      }
    },
    [user],
  );

  const value = useMemo<AppDataValue>(
    () => ({
      favorites,
      reports,
      ready,
      isFavorite: (stationId) => favorites.includes(stationId),
      toggleFavorite,
      addReport,
    }),
    [favorites, reports, ready, toggleFavorite, addReport],
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
