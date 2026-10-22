import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Moon, Sun, Crosshair, Plus, Minus } from 'lucide-react';

const createVayroIcon = (type, options = {}) => {
  let innerHtml = '';
  const { heading = 0 } = options;

  if (type === 'start') {
    innerHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-7 h-7 rounded-full bg-white border-[3px] border-[#0E131F] shadow-2xl flex items-center justify-center">
          <div class="w-2.5 h-2.5 rounded-full bg-[#0E131F]"></div>
        </div>
      </div>
    `;
  } else if (type === 'end') {
    innerHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-7 h-7 rounded-xl bg-vayro-lime border-2 border-white shadow-2xl flex items-center justify-center">
          <div class="w-2.5 h-2.5 rounded-sm bg-[#0E131F]"></div>
        </div>
      </div>
    `;
  } else if (type === 'car') {
    innerHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full bg-vayro-lime/25 animate-ping pointer-events-none"></div>
        <div class="w-9 h-9 rounded-full bg-[#0E131F] border-2 border-vayro-lime shadow-2xl flex items-center justify-center text-vayro-lime transition-transform duration-300" style="transform: rotate(${heading}deg);">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      </div>
    `;
  }

  return L.divIcon({
    html: innerHtml,
    className: 'custom-map-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
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
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (center) {
      map.setView(center, zoom || 14, { animate: true });
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

function MapControls({ isDark, onToggleTheme, onRecenter, onZoomIn, onZoomOut }) {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200/80">
      <button
        type="button"
        onClick={onToggleTheme}
        title={isDark ? 'Switch to Street Map' : 'Switch to Dark Map'}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-black hover:bg-slate-100 transition cursor-pointer"
      >
        {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
      </button>

      <button
        type="button"
        onClick={onRecenter}
        title="Recenter Map"
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-black hover:bg-slate-100 transition cursor-pointer"
      >
        <Crosshair className="w-4 h-4 text-[#0E131F]" />
      </button>

      <div className="h-px bg-slate-200 my-0.5" />

      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom In"
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-black hover:bg-slate-100 transition cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom Out"
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-black hover:bg-slate-100 transition cursor-pointer"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

function MapControllerRef({ onInit }) {
  const map = useMap();
  useEffect(() => {
    if (onInit) onInit(map);
  }, [map, onInit]);
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
  distanceKm,
  durationMinutes,
  fare,
  selectedCategory,
  onMapClick,
}) {
  const [isDark, setIsDark] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const defaultCenter = pickupCoords || [18.5285, 73.8743];

  const bounds =
    routeCoordinates && routeCoordinates.length > 1
      ? routeCoordinates
      : pickupCoords && dropCoords
      ? [pickupCoords, dropCoords]
      : null;

  const carPosition =
    activeDriverCoords ||
    (routeCoordinates && routeCoordinates.length > 0
      ? routeCoordinates[Math.floor(routeCoordinates.length / 2)]
      : pickupCoords);

  const handleRecenter = () => {
    if (!mapInstance) return;
    if (bounds) {
      mapInstance.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (pickupCoords) {
      mapInstance.setView(pickupCoords, 15, { animate: true });
    } else {
      mapInstance.setView(defaultCenter, 13, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapInstance) mapInstance.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstance) mapInstance.zoomOut();
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden bg-[#0E131F] shadow-2xl border border-slate-200/50">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        className={`w-full h-full rounded-3xl ${isDark ? 'vayro-dark-map' : ''}`}
      >
        <MapControllerRef onInit={setMapInstance} />
        <MapResizer />
        <MapClickHandler onMapClick={onMapClick} />
        <MapViewController center={defaultCenter} bounds={bounds} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {routeCoordinates && routeCoordinates.length > 0 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#0E131F',
                weight: 7,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
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

        {pickupCoords && (
          <Marker position={pickupCoords} icon={createVayroIcon('start')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">Pickup Location</div>
            </Popup>
          </Marker>
        )}

        {dropCoords && (
          <Marker position={dropCoords} icon={createVayroIcon('end')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">Destination</div>
            </Popup>
          </Marker>
        )}

        {carPosition && (
          <Marker
            position={carPosition}
            icon={createVayroIcon('car', { heading: activeDriverHeading })}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-900">
                Driver Active • {activeDriverSpeed} km/h
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <MapControls
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onRecenter={handleRecenter}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}
