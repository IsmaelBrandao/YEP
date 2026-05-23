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
      display:flex;
      flex-direction:column;
      align-items:center;
      transform:translate(-50%,-100%);
    ">
      <div style="
        background:#fff;
        color:${color};
        font:800 12px system-ui,sans-serif;
        padding:3px 9px;
        border-radius:999px;
        border:1.5px solid ${color};
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        margin-bottom:-3px;
        z-index:2;
      ">${label}</div>
      <svg width="30" height="40" viewBox="0 0 24 32" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))">
        <path d="M12 0C5.4 0 0 5.2 0 11.6 0 20 12 32 12 32s12-12 12-20.4C24 5.2 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="11.5" r="4" fill="#fff"/>
      </svg>
    </div>`,
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
