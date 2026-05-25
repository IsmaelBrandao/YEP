import { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { router } from 'expo-router';

import { Coordinate, FuelType, StationWithDistance } from '../services/types';
import { colors, formatPrice, priceColor } from '../styles/theme';
import 'leaflet/dist/leaflet.css';

interface StationsMapProps {
  stations: StationWithDistance[];
  region: { latitude: number; longitude: number };
  userCoordinate: Coordinate;
  radiusKm: number;
  fuel: FuelType;
  priceRange: { min: number; max: number };
  onRecenter: () => void;
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

function userIcon() {
  return L.divIcon({
    className: 'yep-user-marker',
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#1d6fe0;border:3px solid #fff;
      box-shadow:0 0 0 2px rgba(29,111,224,0.35),0 1px 3px rgba(0,0,0,0.4);
      transform:translate(-50%,-50%);
    "></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function StationsMap({
  stations,
  region,
  userCoordinate,
  radiusKm,
  fuel,
  priceRange,
  onRecenter,
}: StationsMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (map) {
      map.setView([userCoordinate.latitude, userCoordinate.longitude]);
    }
  }, [map, userCoordinate.latitude, userCoordinate.longitude]);

  function handleRecenter() {
    onRecenter();
    map?.setView([userCoordinate.latitude, userCoordinate.longitude], 14);
  }

  return (
    <div style={{ position: 'relative', flex: 1, height: '100%', width: '100%' }}>
      <MapContainer
        ref={setMap}
        center={[region.latitude, region.longitude]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <Circle
          center={[userCoordinate.latitude, userCoordinate.longitude]}
          radius={radiusKm * 1000}
          pathOptions={{ color: colors.primary, fillColor: colors.primary, fillOpacity: 0.08, weight: 2 }}
        />
        <Marker
          position={[userCoordinate.latitude, userCoordinate.longitude]}
          icon={userIcon()}
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

      <button onClick={handleRecenter} title="Minha localização" style={recenterButtonStyle}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
        </svg>
      </button>
    </div>
  );
}

const recenterButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: 16,
  bottom: 24,
  width: 48,
  height: 48,
  borderRadius: 999,
  border: 'none',
  backgroundColor: colors.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  zIndex: 1000,
};
