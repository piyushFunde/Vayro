import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { History, LogOut, User, Car } from 'lucide-react';

export default function Navbar({ onOpenHistory, onOpenAuth }) {
  const { user, driver, activeRole, switchRole, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAFAF8]/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Brand Logo & Navigation */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Ridewave Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-[#0E131F] flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-ridewave-lime" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12c3-5 6-5 9 0s6 5 9 0" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#0E131F]">
            Ridewave
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <button className="px-3.5 py-1.5 rounded-full bg-[#EAECE6] text-[#0E131F] font-semibold transition">
            Rides
          </button>
          <a href="#how-it-works" className="px-3 py-1.5 text-slate-600 hover:text-[#0E131F] transition">
            How it works
          </a>
          <a href="#safety" className="px-3 py-1.5 text-slate-600 hover:text-[#0E131F] transition">
            Safety
          </a>
          <button
            onClick={() => switchRole('ROLE_DRIVER')}
            className="px-3 py-1.5 text-slate-600 hover:text-[#0E131F] transition"
          >
            Drive with us
          </button>
        </nav>
      </div>

      {/* Right Actions & Auth / Role Toggle */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Role Switcher Pill */}
        <div className="flex items-center bg-[#EAECE6] p-1 rounded-full text-xs font-semibold">
          <button
            onClick={() => switchRole('ROLE_RIDER')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeRole === 'ROLE_RIDER'
                ? 'bg-[#0E131F] text-white shadow-sm'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Rider
          </button>
          <button
            onClick={() => switchRole('ROLE_DRIVER')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeRole === 'ROLE_DRIVER'
                ? 'bg-ridewave-lime text-[#0E131F] font-bold shadow-sm'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Driver
          </button>
        </div>

        {/* Trips History Button */}
        <button
          onClick={onOpenHistory}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-[#EAECE6] transition flex items-center space-x-1"
          title="Past Trips"
        >
          <History className="w-4 h-4 text-slate-700" />
          <span className="hidden sm:inline">Trips</span>
        </button>

        {/* User Account / Login State */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 transition shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-ridewave-lime flex items-center justify-center font-bold text-xs text-[#0E131F]">
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs font-bold text-[#0E131F] max-w-[100px] truncate">
                {user.fullName || user.email}
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-[#0E131F] truncate">{user.fullName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                    {activeRole}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenAuth('login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Switch / Re-login
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="text-sm font-semibold text-[#0E131F] px-2 py-1.5 hover:opacity-80 transition"
            >
              Log in
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2 bg-[#0E131F] hover:bg-black text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
