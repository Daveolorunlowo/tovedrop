"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CAMPUS_LOCATIONS = [
  { name: "Library (Surge)", pos: [7.8010, 4.1785] as [number, number] },
  { name: "Hostel Block C", pos: [7.8025, 4.1800] as [number, number] },
  { name: "Main Gate", pos: [7.8000, 4.1810] as [number, number] },
  { name: "Chapel", pos: [7.8016, 4.1770] as [number, number] },
];

const dotIcon = L.divIcon({
  className: 'custom-dot-icon',
  html: `<div class="w-3 h-3 bg-[#00C9E8] rounded-full shadow-[0_0_10px_#00C9E8] border border-black"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Component to dynamically pan the map to the user's location
function LocationMarker({ position, isFollowingUser }: { position: [number, number] | null, isFollowingUser: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (position && isFollowingUser) {
      // Zoom level 18 provides a very close, clear street-level view of nearby places
      map.flyTo(position, 18, { animate: true, duration: 1.5 });
    }
  }, [position, map, isFollowingUser]);

  // Create a pulsing blue dot icon
  const userIcon = L.divIcon({
    className: 'custom-user-location',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="absolute w-full h-full bg-blue-500 rounded-full opacity-40 animate-ping"></div>
        <div class="relative w-3 h-3 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

// Map Bounds updater for Driver Tracking
function BoundsUpdater({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 18 });
    }
  }, [points, map]);
  return null;
}

export interface LiveMapProps {
  driverPosition?: [number, number] | null;
  pickupLocation?: [number, number] | null;
  dropoffLocation?: [number, number] | null;
  disableUserTracking?: boolean; // Used so tracking page only focuses on driver
}

export default function LiveMap({ driverPosition, pickupLocation, dropoffLocation, disableUserTracking }: LiveMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Default center (e.g., Bowen University or somewhere close)
  const defaultCenter: [number, number] = [7.8016, 4.1793]; // Bowen Univ approximate

  useEffect(() => {
    if (disableUserTracking) return;

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setErrorMsg(null);
      },
      (err) => {
        setErrorMsg(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [disableUserTracking]);

  // Car Icon
  const carIcon = L.divIcon({
    className: 'custom-car-icon',
    html: `
      <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.2)] border-2 border-[#00C9E8]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
          <path d="M12 7V3"></path>
          <path d="M6 7v10"></path>
          <path d="M18 7v10"></path>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const pickupIcon = L.divIcon({
    className: 'pickup-icon',
    html: `<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const dropoffIcon = L.divIcon({
    className: 'dropoff-icon',
    html: `<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const relevantPoints: [number, number][] = [];
  if (driverPosition) relevantPoints.push(driverPosition);
  if (pickupLocation) relevantPoints.push(pickupLocation);
  if (dropoffLocation) relevantPoints.push(dropoffLocation);
  // Also consider user position if we aren't overriding it
  if (!disableUserTracking && position && relevantPoints.length === 0) {
    relevantPoints.push(position);
  }

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={17} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />
        
        {/* Only follow user if tracking isn't overridden by ride data */}
        <LocationMarker position={position} isFollowingUser={!disableUserTracking && relevantPoints.length <= 1} />
        
        {/* Bounds updater so we zoom out to see driver + pickup */}
        {relevantPoints.length > 1 && <BoundsUpdater points={relevantPoints} />}

        {/* Standard Campus Locations (hidden when tracking active ride to reduce clutter) */}
        {!disableUserTracking && CAMPUS_LOCATIONS.map((loc, i) => (
          <Marker key={i} position={loc.pos} icon={dotIcon}>
            <Tooltip permanent direction="top" offset={[0, -10]} className="!bg-[#0A192F]/80 !text-[#00C9E8] !border-[#00C9E8]/30 !font-bold !rounded-lg !backdrop-blur-md !shadow-lg">
              {loc.name}
            </Tooltip>
          </Marker>
        ))}

        {/* --- RIDE TRACKING OVERLAYS --- */}
        {driverPosition && <Marker position={driverPosition} icon={carIcon} zIndexOffset={1000} />}
        {pickupLocation && <Marker position={pickupLocation} icon={pickupIcon} />}
        {dropoffLocation && <Marker position={dropoffLocation} icon={dropoffIcon} />}
        
        {/* Route Line (Driver -> Pickup) or (Pickup -> Dropoff) depending on status */}
        {driverPosition && pickupLocation && (
          <Polyline positions={[driverPosition, pickupLocation]} pathOptions={{ color: '#00C9E8', weight: 4, dashArray: '10, 10' }} />
        )}
        {pickupLocation && dropoffLocation && (
          <Polyline positions={[pickupLocation, dropoffLocation]} pathOptions={{ color: '#4F46E5', weight: 4 }} />
        )}
      </MapContainer>
      
      {/* Optional Error Overlay */}
      {errorMsg && !disableUserTracking && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-red-500/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
