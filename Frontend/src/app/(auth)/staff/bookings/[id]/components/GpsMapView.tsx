'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet + webpack/Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

interface CarTrack {
  carId: string;
  label: string;
  positions: [number, number][];
  speed: number;
  distance: number;
}

interface Props {
  tracks: CarTrack[];
}

function FitBounds({ tracks }: { tracks: CarTrack[] }) {
  const map = useMap();

  useEffect(() => {
    if (tracks.length === 0) return;
    const allPositions = tracks.flatMap((t) => t.positions);
    if (allPositions.length === 0) return;
    const bounds = L.latLngBounds(allPositions.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, tracks]);

  return null;
}

export default function GpsMapView({ tracks }: Props) {
  if (tracks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Waiting for GPS data...
      </div>
    );
  }

  const center = tracks[0]?.positions[0] ?? [10.7769, 106.7009];

  return (
    <MapContainer
      className="gps-map"
      center={center as [number, number]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds tracks={tracks} />

      {tracks.map((track, idx) => {
        const currentPos = track.positions[track.positions.length - 1];
        if (!currentPos) return null;
        const color = COLORS[idx % COLORS.length];

        return (
          <div key={track.carId}>
            <Marker position={currentPos}>
              <Popup>
                <div className="text-sm">
                  <strong>{track.label}</strong>
                  <br />
                  Speed: {track.speed} km/h
                  <br />
                  Distance: {track.distance.toFixed(2)} km
                </div>
              </Popup>
            </Marker>
            {track.positions.length > 1 && (
              <Polyline
                positions={track.positions}
                pathOptions={{ color, weight: 3, opacity: 0.7 }}
              />
            )}
          </div>
        );
      })}
    </MapContainer>
  );
}
