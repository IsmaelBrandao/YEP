import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

export interface ServiceFlags {
  conveniencia: boolean;
  calibragem: boolean;
  lavagem: boolean;
}

interface ServiceRow extends ServiceFlags {
  user_id: string;
}

interface Aggregate {
  conveniencia: number;
  calibragem: number;
  lavagem: number;
  total: number;
}

const EMPTY: ServiceFlags = { conveniencia: false, calibragem: false, lavagem: false };

export function useStationServices(stationId: string) {
  const { user } = useAuth();
  const [available, setAvailable] = useState<ServiceFlags>(EMPTY);
  const [myReport, setMyReport] = useState<ServiceFlags | null>(null);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('station_services')
        .select('user_id, conveniencia, calibragem, lavagem')
        .eq('station_id', stationId);
      const rows = (data ?? []) as ServiceRow[];
      const counts: Aggregate = { conveniencia: 0, calibragem: 0, lavagem: 0, total: rows.length };
      rows.forEach((row) => {
        if (row.conveniencia) counts.conveniencia += 1;
        if (row.calibragem) counts.calibragem += 1;
        if (row.lavagem) counts.lavagem += 1;
      });
      // serviço é considerado disponível por maioria dos reportes
      setAvailable({
        conveniencia: counts.total > 0 && counts.conveniencia * 2 > counts.total,
        calibragem: counts.total > 0 && counts.calibragem * 2 > counts.total,
        lavagem: counts.total > 0 && counts.lavagem * 2 > counts.total,
      });
      setTotalReports(counts.total);
      const mine = user ? rows.find((row) => row.user_id === user.id) : undefined;
      setMyReport(
        mine
          ? { conveniencia: mine.conveniencia, calibragem: mine.calibragem, lavagem: mine.lavagem }
          : null,
      );
    } catch {
      // mantém estado atual em caso de falha de rede
    } finally {
      setLoading(false);
    }
  }, [stationId, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const saveMyServices = useCallback(
    async (flags: ServiceFlags) => {
      if (!user) {
        return;
      }
      await supabase.from('station_services').upsert({
        user_id: user.id,
        station_id: stationId,
        ...flags,
        updated_at: new Date().toISOString(),
      });
      await load();
    },
    [user, stationId, load],
  );

  return { available, myReport, totalReports, loading, saveMyServices };
}
