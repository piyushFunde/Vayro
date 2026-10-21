import React from 'react';
import { Lock, Share2, ShieldAlert } from 'lucide-react';

export default function SafetySection() {
  return (
    <section id="safety" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="bg-[#111622] rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Title & Description */}
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Built to feel safe, every time.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-md leading-relaxed">
              Safety tools sit one tap away during every trip, not buried in a menu.
            </p>
          </div>

          {/* Right Safety Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#182030] rounded-2xl p-5 border border-slate-700/50 flex items-start space-x-4">
              <div className="p-2.5 rounded-xl bg-ridewave-lime/10 text-ridewave-lime flex-shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">OTP-verified pickup</h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  The trip starts only when you share your code with the right driver.
                </p>
              </div>
            </div>

            <div className="bg-[#182030] rounded-2xl p-5 border border-slate-700/50 flex items-start space-x-4">
              <div className="p-2.5 rounded-xl bg-ridewave-lime/10 text-ridewave-lime flex-shrink-0 mt-0.5">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Live trip sharing</h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  Send a tracking link so people you trust can follow along.
                </p>
              </div>
            </div>

            <div className="bg-[#182030] rounded-2xl p-5 border border-slate-700/50 flex items-start space-x-4">
              <div className="p-2.5 rounded-xl bg-ridewave-lime/10 text-ridewave-lime flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">One-tap SOS</h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  Reach emergency help fast, with your live location attached.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
