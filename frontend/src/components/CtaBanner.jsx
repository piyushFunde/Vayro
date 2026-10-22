import React from 'react';

export default function CtaBanner({ onBookClick }) {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-16">
      {/* Lime Banner */}
      <div className="bg-vayro-lime rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between shadow-sm">
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0E131F] tracking-tight">
            Ready for your first ride?
          </h2>
          <p className="text-slate-800 text-sm sm:text-base mt-2">
            Set a destination and see your fare in under a minute.
          </p>
        </div>

        <button
          onClick={onBookClick}
          className="px-8 py-3.5 bg-[#0E131F] hover:bg-black text-white text-sm font-bold rounded-full transition shadow-md self-start md:self-auto"
        >
          Book a ride
        </button>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-8 text-xs text-slate-400">
        Vayro — Next-Gen Cab Booking & Fleet Platform.
      </div>
    </footer>
  );
}
