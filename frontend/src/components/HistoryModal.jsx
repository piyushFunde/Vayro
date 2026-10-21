import React, { useEffect, useState } from 'react';
import { X, Calendar, Download, MapPin, CheckCircle, Car } from 'lucide-react';
import { rideApi } from '../services/api';

export default function HistoryModal({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await rideApi.getHistory();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load ride history from backend:', err);
        setHistory([]);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [isOpen]);

  const handleDownloadInvoice = async (rideId) => {
    setDownloadingId(rideId);
    try {
      await rideApi.downloadInvoice(rideId);
    } catch (err) {
      alert('Could not download PDF invoice: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Database Trip History</h3>
            <p className="text-xs text-slate-400">Live records fetched from Spring Boot / Database</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trips List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Fetching records from backend...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 space-y-1">
              <p className="text-xs font-semibold text-slate-300">No rides found in database yet.</p>
              <p className="text-[11px] text-slate-500">Book a ride to create your first database record!</p>
            </div>
          ) : (
            history.map((ride) => (
              <div key={ride.id} className="glass-card rounded-xl p-4 space-y-3 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ride.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{ride.vehicleType}</span>
                  </div>
                  <span className="font-extrabold text-sm text-brand-400">${ride.finalFare ? ride.finalFare.toFixed(2) : '0.00'}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1"></div>
                    <span className="truncate">{ride.pickupAddress}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400 mt-1"></div>
                    <span className="truncate">{ride.dropAddress}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {ride.distanceKm} km • {ride.durationMinutes} mins
                  </span>

                  <button
                    onClick={() => handleDownloadInvoice(ride.id)}
                    disabled={downloadingId === ride.id}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700/60 transition disabled:opacity-50"
                  >
                    <Download className="w-3 h-3 text-brand-400" />
                    <span>{downloadingId === ride.id ? 'Generating...' : 'PDF Invoice'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
