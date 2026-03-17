'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Gauge, Route, Timer } from 'lucide-react';

interface CarInfo {
  id: string;
  name: string;
  brand: string;
  model: string;
}

interface Props {
  cars: CarInfo[];
  bookingId: string;
}

interface CarTrack {
  carId: string;
  label: string;
  positions: [number, number][];
  speed: number;
  distance: number;
}

// HCMC center
const BASE_LAT = 10.7769;
const BASE_LNG = 106.7009;
const UPDATE_INTERVAL = 3000;

function randomDelta(): number {
  return (Math.random() - 0.5) * 0.002;
}

function randomSpeed(): number {
  return Math.floor(Math.random() * 60) + 20; // 20-80 km/h
}

function haversineDistance(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Dynamically import the map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./GpsMapView'), { ssr: false });

export default function GpsTracker({ cars }: Props) {
  const [tracks, setTracks] = useState<CarTrack[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Initialize tracks
  useEffect(() => {
    const initial: CarTrack[] = cars.map((car, i) => ({
      carId: car.id,
      label: `${car.brand} ${car.model}`,
      positions: [[BASE_LAT + i * 0.003, BASE_LNG + i * 0.003] as [number, number]],
      speed: randomSpeed(),
      distance: 0,
    }));
    setTracks(initial);
  }, [cars]);

  // GPS update interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTracks((prev) =>
        prev.map((track) => {
          if (track.positions.length === 0) return track;
          const lastPos = track.positions[track.positions.length - 1]!;
          const newPos: [number, number] = [
            lastPos[0] + randomDelta(),
            lastPos[1] + randomDelta(),
          ];
          const segmentDist = haversineDistance(lastPos, newPos);
          return {
            ...track,
            positions: [...track.positions, newPos],
            speed: randomSpeed(),
            distance: track.distance + segmentDist,
          };
        })
      );
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalDistance = useMemo(
    () => tracks.reduce((sum, t) => sum + t.distance, 0),
    [tracks]
  );

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-red-500" />
        GPS Tracking (Emulated)
      </h3>

      {/* Map */}
      <div className="gps-map-shell rounded-lg overflow-hidden border" style={{ height: 400 }}>
        <MapView tracks={tracks} />
      </div>

      {/* Info Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <Timer className="w-4 h-4 text-gray-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">
            {formatElapsed(elapsed)}
          </div>
          <div className="text-xs text-gray-500">Tracking Duration</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <Route className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">
            {totalDistance.toFixed(2)} km
          </div>
          <div className="text-xs text-gray-500">Total Distance</div>
        </div>

        {tracks.map((track) => (
          <div key={track.carId} className="bg-gray-50 rounded-lg p-3 text-center">
            <Gauge className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">
              {track.speed} km/h
            </div>
            <div className="text-xs text-gray-500 truncate">{track.label}</div>
          </div>
        ))}
      </div>

      {/* Car status list */}
      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.carId}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">{track.label}</span>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>{track.speed} km/h</span>
              <span>{track.distance.toFixed(2)} km</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
