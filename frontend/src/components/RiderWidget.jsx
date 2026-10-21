import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Tag, ArrowRight, Zap, Shield, CheckCircle2, Crosshair, Search, Clock, X, Sparkles } from 'lucide-react';
import { searchPlaces } from '../services/routing';

const VEHICLES = [
  { id: 'SEDAN', name: 'Vayro Comfort', seats: 4, perKm: 1.8, base: 5.0, eta: '3 min', desc: 'Top-rated drivers, AC sedan', icon: '🚗' },
  { id: 'LUXURY', name: 'Vayro Black EV', seats: 4, perKm: 2.5, base: 10.0, eta: '5 min', desc: 'Premium electric, quiet ride', icon: '⚡' },
  { id: 'SUV', name: 'Vayro XL', seats: 6, perKm: 2.8, base: 12.0, eta: '6 min', desc: 'Room for 6 passengers & bags', icon: '🚙' },
  { id: 'AUTO', name: 'Vayro City Go', seats: 3, perKm: 1.2, base: 3.5, eta: '2 min', desc: 'Fast, budget city commuter', icon: '🚕' },
];

export default function RiderWidget({
  pickupAddress,
  dropAddress,
  onSelectPickup,
  onSelectDrop,
  onLocateMe,
  onBookRide,
  isBooking,
  distanceKm = 4.2,
  durationMinutes = 12,
}) {
  const [selectedVehicle, setSelectedVehicle] = useState('SEDAN');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Autocomplete state
  const [pickupQuery, setPickupQuery] = useState(pickupAddress || '');
  const [dropQuery, setDropQuery] = useState(dropAddress || '');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDrop, setIsSearchingDrop] = useState(false);
  const [showPickupMenu, setShowPickupMenu] = useState(false);
  const [showDropMenu, setShowDropMenu] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setPickupQuery(pickupAddress);
  }, [pickupAddress]);

  useEffect(() => {
    setDropQuery(dropAddress);
  }, [dropAddress]);

  // Debounced search for pickup
  useEffect(() => {
    if (!pickupQuery || pickupQuery.length < 2) {
      setPickupSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      const results = await searchPlaces(pickupQuery);
      setPickupSuggestions(results);
      setIsSearchingPickup(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [pickupQuery]);

  // Debounced search for drop
  useEffect(() => {
    if (!dropQuery || dropQuery.length < 2) {
      setDropSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingDrop(true);
      const results = await searchPlaces(dropQuery);
      setDropSuggestions(results);
      setIsSearchingDrop(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [dropQuery]);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'VAYRO50') {
      setPromoApplied(true);
      setPromoError('');
    } else if (promoCode.trim().toUpperCase() === 'WELCOME20') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo. Try VAYRO50 or WELCOME20');
      setPromoApplied(false);
    }
  };

  const calculateFare = (veh) => {
    const rawFare = veh.base + distanceKm * veh.perKm + durationMinutes * 0.25;
    if (promoApplied) {
      const discount = promoCode.toUpperCase() === 'VAYRO50' ? Math.min(rawFare * 0.5, 25) : Math.min(rawFare * 0.2, 15);
      return Math.max(5.0, rawFare - discount).toFixed(2);
    }
    return rawFare.toFixed(2);
  };

  const handleSelectPickupPlace = (place) => {
    setPickupQuery(place.name);
    setShowPickupMenu(false);
    if (onSelectPickup) {
      onSelectPickup(place.coords, place.fullAddress || place.name);
    }
  };

  const handleSelectDropPlace = (place) => {
    setDropQuery(place.name);
    setShowDropMenu(false);
    if (onSelectDrop) {
      onSelectDrop(place.coords, place.fullAddress || place.name);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-2xl flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <span>Where are you going?</span>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 font-bold rounded-full border border-emerald-500/30">
              Live Fleet
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">Search any street, city or landmark worldwide</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-200">{distanceKm} km</div>
          <div className="text-[10px] text-brand-400 font-medium">~{durationMinutes} min drive</div>
        </div>
      </div>

      {/* Real Autocomplete Search Fields */}
      <div className="space-y-2 relative">
        {/* Pickup Input */}
        <div className="relative">
          <div className="absolute left-3 top-3 flex items-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20"></div>
          </div>
          <input
            type="text"
            value={pickupQuery}
            onChange={(e) => {
              setPickupQuery(e.target.value);
              setShowPickupMenu(true);
            }}
            onFocus={() => setShowPickupMenu(true)}
            placeholder="Search pickup location or airport..."
            className="w-full pl-9 pr-9 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-inner transition"
          />
          {onLocateMe && (
            <button
              onClick={onLocateMe}
              type="button"
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-emerald-400 transition"
              title="Use Current GPS Location"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          )}

          {/* Pickup Autocomplete Dropdown */}
          {showPickupMenu && pickupSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-11 z-30 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto backdrop-blur-lg">
              {pickupSuggestions.map((place) => (
                <div
                  key={place.id}
                  onClick={() => handleSelectPickupPlace(place)}
                  className="px-3.5 py-2.5 hover:bg-slate-800/80 cursor-pointer border-b border-slate-800/60 last:border-0 transition flex items-center space-x-3"
                >
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{place.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{place.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div className="relative">
          <div className="absolute left-3 top-3 flex items-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20"></div>
          </div>
          <input
            type="text"
            value={dropQuery}
            onChange={(e) => {
              setDropQuery(e.target.value);
              setShowDropMenu(true);
            }}
            onFocus={() => setShowDropMenu(true)}
            placeholder="Where to? Enter destination..."
            className="w-full pl-9 pr-9 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-inner transition"
          />
          {dropQuery && (
            <button
              onClick={() => {
                setDropQuery('');
                setDropSuggestions([]);
              }}
              type="button"
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Destination Autocomplete Dropdown */}
          {showDropMenu && dropSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-11 z-30 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto backdrop-blur-lg">
              {dropSuggestions.map((place) => (
                <div
                  key={place.id}
                  onClick={() => handleSelectDropPlace(place)}
                  className="px-3.5 py-2.5 hover:bg-slate-800/80 cursor-pointer border-b border-slate-800/60 last:border-0 transition flex items-center space-x-3"
                >
                  <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{place.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{place.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Landmark Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] text-slate-300">
        <span className="text-[10px] text-slate-500 font-semibold uppercase flex-shrink-0">Quick:</span>
        {[
          { label: '✈️ Airport', query: 'San Francisco International Airport' },
          { label: '🏙️ Downtown', query: 'Union Square, San Francisco' },
          { label: '🌉 Golden Gate', query: 'Golden Gate Bridge, SF' },
          { label: '🚆 Station', query: 'SF Transbay Transit Center' },
        ].map((pill, i) => (
          <button
            key={i}
            type="button"
            onClick={async () => {
              setDropQuery(pill.query);
              const res = await searchPlaces(pill.query);
              if (res.length > 0) {
                handleSelectDropPlace(res[0]);
              }
            }}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 whitespace-nowrap text-[11px] transition"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Vehicle Category Selector */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Select Fleet Class
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {VEHICLES.map((veh) => {
            const isSelected = selectedVehicle === veh.id;
            const fare = calculateFare(veh);
            return (
              <div
                key={veh.id}
                onClick={() => setSelectedVehicle(veh.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                  isSelected ? 'glass-card-active' : 'glass-card hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl p-1.5 bg-slate-800/90 rounded-xl border border-slate-700/60">
                    {veh.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{veh.name}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{veh.eta}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{veh.desc}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-base text-brand-400">${fare}</div>
                  <div className="text-[10px] text-slate-500">{veh.seats} seats</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promo Code Input */}
      <form onSubmit={handleApplyPromo} className="space-y-1">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo code (e.g. VAYRO50)"
              className="w-full pl-8 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 transition"
          >
            Apply
          </button>
        </div>
        {promoApplied && (
          <p className="text-[11px] text-emerald-400 flex items-center space-x-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>50% discount applied to all vehicles!</span>
          </p>
        )}
        {promoError && <p className="text-[11px] text-rose-400 pt-1">{promoError}</p>}
      </form>

      {/* Book Ride Action Button */}
      <button
        onClick={() => {
          const veh = VEHICLES.find((v) => v.id === selectedVehicle);
          onBookRide({
            vehicleType: selectedVehicle,
            fare: calculateFare(veh),
            promoCode: promoApplied ? promoCode : null,
          });
        }}
        disabled={isBooking}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm rounded-xl shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <span>{isBooking ? 'Searching Nearest Drivers...' : `Confirm & Request ${selectedVehicle}`}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Trust & Safety Badges */}
      <div className="flex items-center justify-around pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
        <span className="flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-brand-400" />
          <span>Real-time GPS Tracking</span>
        </span>
        <span className="flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Instant Driver Match</span>
        </span>
      </div>
    </div>
  );
}
