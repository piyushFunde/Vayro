import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, initialMode = 'login', onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('ROLE_RIDER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setError('Please enter your email and password.');
          setLoading(false);
          return;
        }
        await login(email.trim(), password);
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        if (!email || !password || !fullName || !phoneNumber) {
          setError('Please fill in all registration fields.');
          setLoading(false);
          return;
        }
        await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          role,
        });
        setSuccessMsg('Account created successfully! Welcome to Vayro.');
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[#0E131F] flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-vayro-lime" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12c3-5 6-5 9 0s6 5 9 0" />
            </svg>
          </div>
          <span className="font-extrabold text-lg text-[#0E131F]">Vayro Account</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F1F3ED] p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              mode === 'login'
                ? 'bg-[#0E131F] text-white shadow-sm'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              mode === 'signup'
                ? 'bg-[#0E131F] text-white shadow-sm'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Real Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl text-sm font-medium text-[#0E131F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E131F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl text-sm font-medium text-[#0E131F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E131F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">I want to register as</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_RIDER')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                      role === 'ROLE_RIDER'
                        ? 'bg-[#0E131F] text-white border-[#0E131F]'
                        : 'bg-[#F3F4F6] text-slate-700 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    Passenger / Rider
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_DRIVER')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                      role === 'ROLE_DRIVER'
                        ? 'bg-vayro-lime text-[#0E131F] border-vayro-lime'
                        : 'bg-[#F3F4F6] text-slate-700 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    Driver Partner
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl text-sm font-medium text-[#0E131F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E131F]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl text-sm font-medium text-[#0E131F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E131F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-vayro-lime hover:bg-vayro-limeHover text-[#0E131F] font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create My Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-[11px] text-slate-400">
          Secured with Spring Security JWT Stateless Bearer Token
        </div>
      </div>
    </div>
  );
}
