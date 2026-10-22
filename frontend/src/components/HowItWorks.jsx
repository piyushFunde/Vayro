import React from 'react';

const STEPS = [
  {
    step: '1',
    title: 'Set your trip',
    desc: 'Enter where to. Your pickup is filled in from your current location.',
  },
  {
    step: '2',
    title: 'Choose and confirm',
    desc: 'Compare fares and arrival times, then confirm with one tap.',
  },
  {
    step: '3',
    title: 'Track and ride',
    desc: 'Watch your driver arrive, share the OTP, and pay when you reach.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 scroll-mt-24">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E131F] tracking-tight mb-8">
        Three steps to your ride
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0E131F] text-white flex items-center justify-center font-bold text-sm mb-6">
                {s.step}
              </div>
              <h3 className="text-xl font-bold text-[#0E131F] mb-3">
                {s.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
