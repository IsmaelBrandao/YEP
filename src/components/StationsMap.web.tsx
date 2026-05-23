import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { router } from 'expo-router';

import { FuelType, StationWithDistance } from '../services/types';
import { colors, formatPrice, priceColor } from '../styles/theme';
import 'leaflet/dist/leaflet.css';

interface StationsMapProps {
  stations: StationWithDistance[];
  region: { latitude: number; longitude: number };
  fuel: FuelType;
  priceRange: { min: number; max: number };
}

function priceIcon(label: string, color: string) {
  return L.divIcon({
    className: 'yep-price-marker',
    html: `<div style="
      background:${color};
      color:#fff;
      font:700 12px system-ui,sans-serif;
      padding:3px 8px;
      border-radius:6px;
      white-space:nowrap;
      box-shadow:0 1px 3px rgba(0,0,0,0.3);
      transform:translate(-50%,-100%);
    ">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function StationsMap({ stations, region, fuel, priceRange }: StationsMapProps) {
  return (
    <div style={{ flex: 1, height: '100%', width: '100%' }}>
      <MapContainer
        center={[region.latitude, region.longitude]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {stations.map((station) => {
          const price = station.prices[fuel];
          const color =
            price == null ? colors.textMuted : priceColor(price, priceRange.min, priceRange.max);
          const label = price == null ? '—' : formatPrice(price);
          return (
            <Marker
              key={station.id}
              position={[station.coordinate.latitude, station.coordinate.longitude]}
              icon={priceIcon(label, color)}
              eventHandlers={{ click: () => router.push(`/station/${station.id}`) }}
            >
              <Popup>
                <strong>{station.name}</strong>
                <br />
                {station.address}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
