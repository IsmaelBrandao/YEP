import api from './api';
import { stations as bundledStations } from './stations';
import { Station } from './types';

// JSON gerado por scripts/build-stations.mjs e servido pelo repositório.
// Permite atualizar os preços sem recompilar o app. Se a rede falhar,
// usamos o snapshot embutido como fallback.
const REMOTE_STATIONS_URL =
  'https://raw.githubusercontent.com/IsmaelBrandao/YEP/main/assets/stations.json';

export async function fetchStations(): Promise<Station[]> {
  try {
    const { data } = await api.get<Station[]>(REMOTE_STATIONS_URL, { timeout: 8000 });
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // sem rede / arquivo indisponível: cai para o snapshot local
  }
  return bundledStations;
}
