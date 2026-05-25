import api from './api';

// Mapillary (fotos de rua abertas). Busca a imagem mais próxima das coordenadas
// do posto. Requer um token gratuito em EXPO_PUBLIC_MAPILLARY_TOKEN.
const TOKEN = process.env.EXPO_PUBLIC_MAPILLARY_TOKEN ?? '';
const BBOX_DELTA = 0.0009; // ~100m ao redor do ponto

interface MapillaryImage {
  thumb_1024_url?: string;
  computed_geometry?: { coordinates: [number, number] };
}

export async function fetchStationPhoto(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  if (!TOKEN) {
    return null;
  }
  const bbox = [
    longitude - BBOX_DELTA,
    latitude - BBOX_DELTA,
    longitude + BBOX_DELTA,
    latitude + BBOX_DELTA,
  ].join(',');

  try {
    const { data } = await api.get<{ data: MapillaryImage[] }>(
      'https://graph.mapillary.com/images',
      {
        params: { access_token: TOKEN, fields: 'thumb_1024_url,computed_geometry', bbox, limit: 10 },
        timeout: 8000,
      },
    );
    const images = data.data ?? [];
    if (images.length === 0) {
      return null;
    }
    let best: MapillaryImage | null = null;
    let bestDist = Infinity;
    for (const image of images) {
      const coords = image.computed_geometry?.coordinates;
      const dist = coords
        ? (coords[0] - longitude) ** 2 + (coords[1] - latitude) ** 2
        : Infinity;
      if (image.thumb_1024_url && dist < bestDist) {
        bestDist = dist;
        best = image;
      }
    }
    return best?.thumb_1024_url ?? null;
  } catch {
    return null;
  }
}
