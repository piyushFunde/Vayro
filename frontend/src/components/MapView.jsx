import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Moon, Sun, Crosshair } from 'lucide-react';

// Create custom markers matching Vayro screenshot
const createVayroIcon = (type, options = {}) => {
  let innerHtml = '';
  const { heading = 0 } = options;

  if (type === 'start') {
    // White ring with black center
    innerHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-6 h-6 rounded-full bg-white border-4 border-[#0E131F] shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-[#0E131F]"></div>
        </div>
      </div>
    `;
  } else if (type === 'end') {
    // Lime rounded square
    innerHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-6 h-6 rounded-lg bg-vayro-lime border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 rounded-sm bg-[#0E131F]"></div>
        </div>
      </div>
    `;
  } else if (type === 'car') {
    // White rounded car badge with black car icon
    innerHtml = `
      <div class="relative flex items-center justify-center transition-transform duration-300" style="transform: rotate(${heading}deg);">
        <div class="w-8 h-8 rounded-full bg-white border-2 border-slate-900 shadow-xl flex items-center justify-center text-[#0E131F]">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
        </div>
      </div>
    `;
  }

  return L.divIcon({
    html: innerHtml,
    className: 'custom-map-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick(e.latlng);
    },
  });
  return null;
}

function MapViewController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2 && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
    } else if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, bounds, map]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function MapView({
  pickupCoords,
  dropCoords,
  routeCoordinates = [],
  drivers = [],
  activeDriverCoords,
  activeDriverHeading = 0,
  activeDriverSpeed = 35,
  activeRide,
  distanceKm = 6.4,
  durationMinutes = 3,
  fare = 168,
  selectedCategory = 'Mini',
  onMapClick,
}) {
  const defaultCenter = pickupCoords || [18.5285, 73.8743];

  // Route bounds
  const bounds =
    routeCoordinates && routeCoordinates.length > 1
      ? routeCoordinates
      : pickupCoords && dropCoords
      ? [pickupCoords, dropCoords]
      : null;

  // Car position along the route
  const carPosition =
    activeDriverCoords ||
    (routeCoordinates && routeCoordinates.length > 0
      ? routeCoordinates[Math.floor(routeCoordinates.length / 2)]
      : pickupCoords);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden bg-[#111622] vayro-map">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full rounded-3xl"
      >
        <MapResizer />
        <MapClickHandler onMapClick={onMapClick} />
        <MapViewController center={defaultCenter} bounds={bounds} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Real Neon Green Route Polyline matching screenshot */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <>
            {/* Glow backing */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#CBF932',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Crisp neon core */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#CBF932',
                weight: 4.5,
                opacity: 1.0,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Start Point Marker (White ring) */}
        {pickupCoords && (
          <Marker position={pickupCoords} icon={createVayroIcon('start')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">Pickup Location</div>
            </Popup>
          </Marker>
        )}

        {/* End Point Marker (Lime square) */}
        {dropCoords && (
          <Marker position={dropCoords} icon={createVayroIcon('end')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">Destination</div>
            </Popup>
          </Marker>
        )}

        {/* Car on Route Line */}
        {carPosition && (
          <Marker
            position={carPosition}
            icon={createVayroIcon('car', { heading: activeDriverHeading })}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-900">
                Driver En Route • {activeDriverSpeed} km/h
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Driver Status Card (Top-Left) matching Image 1 */}
      <div className="absolute top-5 left-5 z-20 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center space-x-3 border border-slate-100 backdrop-blur-md">
        <div className="w-10 h-10 rounded-full bg-vayro-lime flex items-center justify-center font-bold text-xs text-[#0E131F]">
          {activeRide?.driver?.user?.fullName
            ? activeRide.driver.user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)
            : 'RK'}
        </div>
        <div>
          <div className="text-xs sm:text-sm font-extrabold text-[#0E131F] leading-tight">
            {activeRide?.status === 'DRIVER_ARRIVED'
              ? 'Driver has arrived!'
              : activeRide?.status === 'IN_PROGRESS'
              ? 'On trip to destination'
              : `Driver arriving in ${durationMinutes || 3} min`}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {activeRide?.driver?.user?.fullName || 'Ramesh'} • {activeRide?.driver?.ratingAvg || '4.8'} rating
          </div>
        </div>
      </div>

      {/* Floating Price Badge (Bottom-Right) matching Image 1 */}
      <div className="absolute bottom-5 right-5 z-20 bg-white rounded-2xl shadow-xl px-4 py-3 text-right border border-slate-100 backdrop-blur-md">
        <div className="text-xs text-slate-500 font-medium">
          {selectedCategory || 'Mini'} • {distanceKm || '6.4'} km
        </div>
        <div className="text-2xl font-black text-[#0E131F] tracking-tight">
          ₹{fare || 168}
        </div>
      </div>
    </div>
  );
}
