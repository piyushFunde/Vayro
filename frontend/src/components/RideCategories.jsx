import React from 'react';

const CATEGORIES = [
  {
    id: 'AUTO',
    name: 'Auto',
    desc: 'Quick and affordable for short city hops. Up to 3 riders.',
    price: '₹112',
    icon: (
      <svg className="w-8 h-8 text-[#0E131F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 16h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-4H8L6 7H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    id: 'MINI',
    name: 'Mini',
    desc: 'The everyday pick. Compact cars, shortest wait. Up to 4 riders.',
    price: '₹168',
    isPopular: true,
    icon: (
      <svg className="w-8 h-8 text-[#0E131F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 10.8 2 11v5c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    id: 'SEDAN',
    name: 'Sedan',
    desc: 'More legroom and a quieter ride for longer trips.',
    price: '₹214',
    icon: (
      <svg className="w-8 h-8 text-[#0E131F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'SUV',
    name: 'SUV',
    desc: 'Room for the whole group and the luggage. Up to 6 riders.',
    price: '₹296',
    icon: (
      <svg className="w-8 h-8 text-[#0E131F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14h18v-2a3 3 0 0 0-3-3h-4l-2-3H8L6 9H4a3 3 0 0 0-3 3v2z" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="17.5" cy="16.5" r="2.5" />
      </svg>
    ),
  },
];

export default function RideCategories({ selectedCategory, onSelectCategory }) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E131F] tracking-tight">
          A ride for every trip
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Pick by budget, space or speed. Prices are shown before you confirm.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.slice(0, 3).map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const isMini = cat.id === 'MINI';
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-6 rounded-3xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                isMini || isSelected
                  ? 'bg-vayro-lime border-vayro-lime text-[#0E131F] shadow-sm transform -translate-y-0.5'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 text-[#0E131F]'
              }`}
            >
              <div>
                <div className="mb-4">{cat.icon}</div>
                <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isMini || isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                  {cat.desc}
                </p>
              </div>
              <div className="mt-6 font-bold text-sm">
                From {cat.price}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUV Wide Card */}
      <div className="mt-4">
        {CATEGORIES.slice(3).map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-6 rounded-3xl cursor-pointer transition-all duration-200 border flex flex-col sm:flex-row sm:items-center justify-between ${
                isSelected
                  ? 'bg-vayro-lime border-vayro-lime text-[#0E131F]'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 text-[#0E131F]'
              }`}
            >
              <div className="flex items-start sm:items-center space-x-4 mb-4 sm:mb-0">
                <div className="flex-shrink-0">{cat.icon}</div>
                <div>
                  <h3 className="text-xl font-bold">{cat.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                    {cat.desc}
                  </p>
                </div>
              </div>
              <div className="font-bold text-sm sm:text-base">
                From {cat.price}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
