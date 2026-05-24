import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FuelType } from '../services/types';

const STORAGE_KEY = '@yep/settings';

interface Settings {
  defaultFuel: FuelType;
  searchRadius: number;
}

const DEFAULT_SETTINGS: Settings = {
  defaultFuel: 'comum',
  searchRadius: 10,
};

interface SettingsValue extends Settings {
  ready: boolean;
  setDefaultFuel: (fuel: FuelType) => void;
  setSearchRadius: (radius: number) => void;
}

const SettingsContext = createContext<SettingsValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
      setReady(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, ready]);

  const value = useMemo<SettingsValue>(
    () => ({
      ...settings,
      ready,
      setDefaultFuel: (defaultFuel) => setSettings((prev) => ({ ...prev, defaultFuel })),
      setSearchRadius: (searchRadius) => setSettings((prev) => ({ ...prev, searchRadius })),
    }),
    [settings, ready],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de SettingsProvider');
  }
  return context;
}
