import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Power, MapPin, Navigation, CheckCircle, Key } from 'lucide-react';

export default function DriverWidget({
  activeRide,
  incomingOffer,
  onAcceptOffer,
  onDeclineOffer,
  onMarkArrived,
  onStartRide,
  onCompleteRide,
}) {
  const { driver, toggleDriverStatus } = useAuth();
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [offerCountdown, setOfferCountdown] = useState(15);

  const isOnline = driver?.status === 'AVAILABLE' || driver?.status === 'BUSY';

  // Offer countdown
  useEffect(() => {
    let timer;
    if (incomingOffer && offerCountdown > 0) {
      timer = setInterval(() => setOfferCountdown((prev) => prev - 1), 1000);
    } else if (incomingOffer && offerCountdown === 0) {
      onDeclineOffer();
    }
    return () => clearInterval(timer);
  }, [incomingOffer, offerCountdown, onDeclineOffer]);

  const handleStartWithOtp = (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length < 4) {
      setOtpError('Please enter valid 4-digit PIN');
      return;
    }
    setOtpError('');
    onStartRide(activeRide.id, enteredOtp);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-w-md w-full">
      {/* Header & Status Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-[#0E131F] flex items-center space-x-2">
            <span>Driver Partner</span>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                isOnline
                  ? 'bg-vayro-lime text-[#0E131F]'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {driver?.status || 'ONLINE'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">{driver?.vehicleModel || 'Toyota Camry'} • {driver?.vehicleNumber || 'CAB-9021'}</p>
        </div>

        {/* Toggle Online/Offline Switch */}
        <button
          onClick={toggleDriverStatus}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            isOnline
              ? 'bg-[#0E131F] text-white hover:bg-black'
              : 'bg-vayro-lime text-[#0E131F] hover:bg-vayro-limeHover'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
        </button>
      </div>

      {/* Driver Performance Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#F8F9FA] rounded-2xl p-3 text-center border border-slate-100">
          <div className="text-[10px] uppercase font-bold text-slate-400">Today</div>
          <div className="text-lg font-black text-[#0E131F] mt-0.5">₹1,840</div>
        </div>
        <div className="bg-[#F8F9FA] rounded-2xl p-3 text-center border border-slate-100">
          <div className="text-[10px] uppercase font-bold text-slate-400">Trips</div>
          <div className="text-lg font-black text-[#0E131F] mt-0.5">{driver?.totalTrips || 18}</div>
        </div>
        <div className="bg-[#F8F9FA] rounded-2xl p-3 text-center border border-slate-100">
          <div className="text-[10px] uppercase font-bold text-slate-400">Rating</div>
          <div className="text-lg font-black text-amber-500 mt-0.5">★ {driver?.ratingAvg || 4.8}</div>
        </div>
      </div>

      {/* Incoming Ride Offer Overlay Card */}
      {incomingOffer && !activeRide && (
        <div className="p-5 rounded-2xl border-2 border-vayro-lime bg-[#FAFAF8] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0E131F] uppercase tracking-wide">
              New Trip Dispatch
            </span>
            <span className="px-2.5 py-0.5 bg-[#0E131F] text-vayro-lime font-mono text-xs font-bold rounded-full">
              {offerCountdown}s
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-[#0E131F]">₹{incomingOffer.finalFare || 168}</div>
            <div className="text-xs text-slate-500 font-medium">
              {incomingOffer.distanceKm || 6.4} km • ~{incomingOffer.durationMinutes || 12} mins
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E131F] flex-shrink-0"></span>
              <span className="truncate">{incomingOffer.pickupAddress}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-vayro-lime border border-[#0E131F] flex-shrink-0"></span>
              <span className="truncate">{incomingOffer.dropAddress}</span>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={onAcceptOffer}
              className="flex-1 py-3 bg-vayro-lime hover:bg-vayro-limeHover text-[#0E131F] font-bold text-xs rounded-xl transition shadow-sm"
            >
              Accept Trip
            </button>
            <button
              onClick={onDeclineOffer}
              className="px-4 py-3 bg-[#F1F3ED] hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Active Trip Workflow Controller */}
      {activeRide && (
        <div className="p-4 rounded-2xl space-y-3.5 bg-[#F9F9F7] border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0E131F] uppercase tracking-wider">
              Active Assignment
            </span>
            <span className="px-2.5 py-0.5 bg-[#0E131F] text-white text-[10px] font-bold rounded-full">
              {activeRide.status}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-700">
            <p><strong>Passenger:</strong> {activeRide.rider?.fullName || 'Alex Morgan'}</p>
            <p><strong>Pickup:</strong> {activeRide.pickupAddress}</p>
            <p><strong>Destination:</strong> {activeRide.dropAddress}</p>
          </div>

          {/* Workflow step 1: Driver assigned, navigating to pickup */}
          {activeRide.status === 'DRIVER_ASSIGNED' && (
            <button
              onClick={() => onMarkArrived(activeRide.id)}
              className="w-full py-3.5 bg-[#0E131F] hover:bg-black text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center space-x-2"
            >
              <Navigation className="w-4 h-4 text-vayro-lime" />
              <span>I Have Arrived at Pickup</span>
            </button>
          )}

          {/* Workflow step 2: Driver arrived, verify OTP to start */}
          {activeRide.status === 'DRIVER_ARRIVED' && (
            <form onSubmit={handleStartWithOtp} className="space-y-2">
              <label className="text-[11px] font-bold text-[#0E131F] block">
                Enter Passenger 4-Digit OTP to Begin Trip:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 5648"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-mono font-bold tracking-widest text-[#0E131F] focus:outline-none focus:border-black text-base"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-vayro-lime hover:bg-vayro-limeHover text-[#0E131F] font-bold text-xs rounded-xl transition"
                >
                  Verify & Start
                </button>
              </div>
              {otpError && <p className="text-[11px] text-rose-500">{otpError}</p>}
            </form>
          )}

          {/* Workflow step 3: Trip in progress, button to complete */}
          {activeRide.status === 'IN_PROGRESS' && (
            <button
              onClick={() => onCompleteRide(activeRide.id)}
              className="w-full py-3.5 bg-vayro-lime hover:bg-vayro-limeHover text-[#0E131F] font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Arrived at Destination — Complete Trip</span>
            </button>
          )}
        </div>
      )}

      {/* Driver standby indicator when no offer */}
      {!activeRide && !incomingOffer && isOnline && (
        <div className="p-4 rounded-2xl bg-[#F8F9FA] text-center space-y-1 text-slate-500 border border-slate-100">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto animate-ping"></div>
          <p className="text-xs font-bold text-[#0E131F] pt-1">Listening for Ride Requests</p>
          <p className="text-[11px] text-slate-400">Your vehicle is broadcasting to nearby riders.</p>
        </div>
      )}
    </div>
  );
}
