import React from 'react';
import { Phone, AlertTriangle, Key, CheckCircle, Navigation, Shield, User } from 'lucide-react';

export default function RideTrackerModal({
  ride,
  onCancelRide,
  onOpenPayment,
}) {
  if (!ride) return null;

  const getStatusBadge = () => {
    switch (ride.status) {
      case 'REQUESTED':
        return {
          title: 'Searching for Nearby Drivers...',
          subtitle: 'Dispatching to top-rated Vayro partners',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'DRIVER_ASSIGNED':
        return {
          title: 'Driver En Route to Pickup',
          subtitle: `${ride.driver?.vehicleModel || 'Vehicle'} • Arriving in ~3 mins`,
          color: 'bg-vayro-lime text-[#0E131F] font-bold border-vayro-lime',
        };
      case 'DRIVER_ARRIVED':
        return {
          title: 'Driver Has Arrived!',
          subtitle: 'Please proceed to your pickup point',
          color: 'bg-emerald-100 text-emerald-800 font-bold border-emerald-200',
        };
      case 'IN_PROGRESS':
        return {
          title: 'On Trip to Destination',
          subtitle: `En route to ${ride.dropAddress}`,
          color: 'bg-blue-100 text-blue-800 font-bold border-blue-200',
        };
      case 'COMPLETED':
        return {
          title: 'Trip Completed Successfully!',
          subtitle: 'Please settle fare and review your experience',
          color: 'bg-emerald-100 text-emerald-800 font-bold border-emerald-200',
        };
      default:
        return {
          title: 'Active Trip',
          subtitle: 'Live Telemetry',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-w-md w-full">
      {/* Status Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className={`px-3 py-1 text-xs rounded-full border ${statusInfo.color}`}>
            {ride.status}
          </span>
          <h3 className="text-xl font-extrabold text-[#0E131F] mt-2">{statusInfo.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{statusInfo.subtitle}</p>
        </div>

        {/* SOS Alert Button */}
        <button
          onClick={() => alert('🚨 SOS Emergency alert triggered! Coordinates transmitted to safety desk.')}
          className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-full text-xs font-bold transition"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>SOS</span>
        </button>
      </div>

      {/* Verification OTP Box */}
      <div className="rounded-2xl p-4 flex items-center justify-between border border-slate-200 bg-[#FAFAF8]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-vayro-lime flex items-center justify-center text-[#0E131F] font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#0E131F]">Ride Verification PIN</div>
            <div className="text-[11px] text-slate-500">Share with driver before departure</div>
          </div>
        </div>
        <div className="text-2xl font-black tracking-widest text-[#0E131F] bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-sm font-mono">
          {ride.otp || '5648'}
        </div>
      </div>

      {/* Driver Information Card (when assigned) */}
      {ride.driver && (
        <div className="rounded-2xl p-4 space-y-3 bg-[#F9F9F7] border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-vayro-lime flex items-center justify-center font-bold text-[#0E131F] text-base shadow-sm">
                {ride.driver.user?.fullName
                  ? ride.driver.user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)
                  : 'RK'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0E131F]">
                  {ride.driver.user?.fullName || 'Ramesh Kumar'}
                </h4>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">★ {ride.driver.ratingAvg || '4.8'}</span>
                  <span>•</span>
                  <span>{ride.driver.totalTrips || 240} trips</span>
                </div>
              </div>
            </div>

            <a
              href="tel:+15550000003"
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0E131F] transition shadow-sm"
              title="Call Driver"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Vehicle</span>
              <span className="font-bold text-slate-800">{ride.driver.vehicleModel}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Plate Number</span>
              <span className="font-bold text-[#0E131F] tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                {ride.driver.vehicleNumber}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trip Route Details */}
      <div className="space-y-2 text-xs py-1">
        <div className="flex items-start space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0E131F] mt-1 flex-shrink-0"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pickup</span>
            <span className="text-slate-800 font-medium">{ride.pickupAddress}</span>
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-vayro-lime mt-1 flex-shrink-0 border border-slate-800"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Destination</span>
            <span className="text-slate-800 font-medium">{ride.dropAddress}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex space-x-2">
        {ride.status === 'COMPLETED' ? (
          <button
            onClick={onOpenPayment}
            className="w-full py-3.5 bg-vayro-lime hover:bg-vayro-limeHover text-[#0E131F] font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Pay & Download Receipt (₹{ride.finalFare})</span>
          </button>
        ) : (
          <button
            onClick={() => onCancelRide(ride.id)}
            className="w-full py-3 bg-[#F1F3ED] hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold text-xs rounded-2xl transition"
          >
            Cancel Trip
          </button>
        )}
      </div>
    </div>
  );
}
