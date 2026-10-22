import React, { useState, useEffect } from 'react';
import { Navigation, Clock, Tag, X, MapPin } from 'lucide-react';
import MapView from './MapView';
import { searchPlaces } from '../services/routing';

export default function VayroHero({
  pickupAddress,
  dropAddress,
  onSelectPickup,
  onSelectDrop,
  onLocateMe,
  onBookRide,
  isBooking,
  pickupCoords,
  dropCoords,
  routeCoordinates,
  activeDriverCoords,
  activeDriverHeading,
  activeDriverSpeed,
  activeRide,
  distanceKm,
  durationMinutes,
  fare,
  selectedCategory,
  onMapClick,
}) {
  const [activeTab, setActiveTab] = useState('now');
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  // Autocomplete search states
  const [pickupQuery, setPickupQuery] = useState(pickupAddress || '');
  const [dropQuery, setDropQuery] = useState(dropAddress || '');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [showPickupMenu, setShowPickupMenu] = useState(false);
  const [showDropMenu, setShowDropMenu] = useState(false);

  useEffect(() => {
    setPickupQuery(pickupAddress);
  }, [pickupAddress]);

  useEffect(() => {
    setDropQuery(dropAddress);
  }, [dropAddress]);

  // Debounce search
  useEffect(() => {
    if (!pickupQuery || pickupQuery.length < 2) {
      setPickupSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchPlaces(pickupQuery);
      setPickupSuggestions(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [pickupQuery]);

  useEffect(() => {
    if (!dropQuery || dropQuery.length < 2) {
      setDropSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchPlaces(dropQuery);
      setDropSuggestions(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [dropQuery]);

  const handleSelectPickup = (place) => {
    setPickupQuery(place.name);
    setShowPickupMenu(false);
    if (onSelectPickup) {
      onSelectPickup(place.coords, place.fullAddress || place.name);
    }
  };

  const handleSelectDrop = (place) => {
    setDropQuery(place.name);
    setShowDropMenu(false);
    if (onSelectDrop) {
      onSelectDrop(place.coords, place.fullAddress || place.name);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-vayro-limeLight text-[#0E131F] text-xs font-semibold">
              <span className="text-emerald-700">📍</span>
              <span>Rides available 24/7 in your city</span>
            </div>
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-[#0E131F] leading-[1.1] tracking-tight">
              Your ride,
              <br />
              just a tap away.
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-4 leading-relaxed max-w-md">
              Book a cab in seconds, see the fare before you go, and follow your driver live on the map.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 relative">
            <div className="flex items-center space-x-2 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('now')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                  activeTab === 'now'
                    ? 'bg-[#0E131F] text-white shadow-sm'
                    : 'bg-[#F1F3ED] text-slate-700 hover:text-black'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pickup now</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                  activeTab === 'schedule'
                    ? 'bg-[#0E131F] text-white shadow-sm'
                    : 'bg-[#F1F3ED] text-slate-700 hover:text-black'
                }`}
              >
                <span>Schedule</span>
              </button>
            </div>

            <div className="space-y-3 relative">
              {/* Pickup Location */}
              <div className="relative">
                <div className="flex items-center bg-[#F3F4F6] rounded-2xl px-4 py-3.5">
                  <div className="w-3 h-3 rounded-full bg-[#0E131F] mr-3 flex-shrink-0"></div>
                  <input
                    type="text"
                    value={pickupQuery}
                    onChange={(e) => {
                      setPickupQuery(e.target.value);
                      setShowPickupMenu(true);
                    }}
                    onFocus={() => setShowPickupMenu(true)}
                    placeholder="Pickup location"
                    className="w-full bg-transparent text-sm text-[#0E131F] placeholder-slate-400 font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={onLocateMe}
                    title="Use Current Location"
                    className="text-[#0E131F] hover:text-emerald-600 transition pl-2"
                  >
                    <svg className="w-4 h-4 fill-current rotate-45" viewBox="0 0 24 24">
                      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                    </svg>
                  </button>
                </div>

                {/* Pickup Suggestions Dropdown */}
                {showPickupMenu && pickupSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-14 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                    {pickupSuggestions.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPickup(p)}
                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition flex items-center space-x-2.5"
                      >
                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#0E131F] truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{p.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropoff Location */}
              <div className="relative">
                <div className="flex items-center bg-[#F3F4F6] rounded-2xl px-4 py-3.5">
                  <div className="w-3 h-3 rounded-sm bg-[#0E131F] mr-3 flex-shrink-0"></div>
                  <input
                    type="text"
                    value={dropQuery}
                    onChange={(e) => {
                      setDropQuery(e.target.value);
                      setShowDropMenu(true);
                    }}
                    onFocus={() => setShowDropMenu(true)}
                    placeholder="Dropoff location"
                    className="w-full bg-transparent text-sm text-[#0E131F] placeholder-slate-400 font-medium focus:outline-none"
                  />
                  {dropQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropQuery('');
                        setDropSuggestions([]);
                      }}
                      className="text-slate-400 hover:text-black pl-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropoff Suggestions Dropdown */}
                {showDropMenu && dropSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-14 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                    {dropSuggestions.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectDrop(p)}
                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition flex items-center space-x-2.5"
                      >
                        <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#0E131F] truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{p.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onBookRide}
              disabled={isBooking}
              className="w-full mt-5 py-4 px-6 bg-vayro-lime hover:bg-vayro-limeHover text-[#0E131F] font-bold text-sm sm:text-base rounded-2xl transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isBooking ? 'Searching Nearest Drivers...' : 'See prices →'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800">
            <MapView
              pickupCoords={pickupCoords}
              dropCoords={dropCoords}
              routeCoordinates={routeCoordinates}
              activeDriverCoords={activeDriverCoords}
              activeDriverHeading={activeDriverHeading}
              activeDriverSpeed={activeDriverSpeed}
              activeRide={activeRide}
              distanceKm={distanceKm}
              durationMinutes={durationMinutes}
              fare={fare}
              selectedCategory={selectedCategory}
              onMapClick={onMapClick}
            />
          </div>
        </div>
      </div>

      {showPromoBanner && (
        <div className="w-full mt-8 bg-[#111622] rounded-2xl p-4 sm:px-6 flex items-center justify-between text-white shadow-sm border border-slate-800">
          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <span className="text-vayro-lime">
              <Tag className="w-4 h-4" />
            </span>
            <span className="font-medium text-slate-200">
              Welcome offer: save on your first rides. Terms apply.
            </span>
          </div>

          <button
            onClick={() => setShowPromoBanner(false)}
            className="text-slate-400 hover:text-white transition p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
