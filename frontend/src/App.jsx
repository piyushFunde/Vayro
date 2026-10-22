import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import VayroHero from './components/VayroHero';
import RideCategories from './components/RideCategories';
import HowItWorks from './components/HowItWorks';
import SafetySection from './components/SafetySection';
import CtaBanner from './components/CtaBanner';
import RideTrackerModal from './components/RideTrackerModal';
import DriverWidget from './components/DriverWidget';
import PaymentModal from './components/PaymentModal';
import HistoryModal from './components/HistoryModal';
import AuthModal from './components/AuthModal';
import { rideApi, driverApi } from './services/api';
import { getRealDrivingRoute, reverseGeocode, calculateBearing } from './services/routing';
import { wsService } from './services/websocket';
import { soundService } from './services/sound';

function MainApp() {
  const { user, driver, activeRole, token } = useAuth();

  const [pickupCoords, setPickupCoords] = useState([18.5285, 73.8743]);
  const [dropCoords, setDropCoords] = useState([18.5912, 73.7390]);
  const [pickupAddress, setPickupAddress] = useState('Pune Railway Station, Pune');
  const [dropAddress, setDropAddress] = useState('Hinjewadi IT Park, Pune');

  const [selectedCategory, setSelectedCategory] = useState('MINI');

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distanceKm, setDistanceKm] = useState(6.4);
  const [durationMinutes, setDurationMinutes] = useState(3);

  const [activeDriverCoords, setActiveDriverCoords] = useState(null);
  const [activeDriverHeading, setActiveDriverHeading] = useState(0);
  const [activeDriverSpeed, setActiveDriverSpeed] = useState(35);

  const [activeRide, setActiveRide] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [apiError, setApiError] = useState(null);

  const driveIntervalRef = useRef(null);

  const calculateFare = (vehId = selectedCategory) => {
    switch (vehId) {
      case 'AUTO':
        return Math.round(50 + distanceKm * 10);
      case 'MINI':
        return Math.round(60 + distanceKm * 17);
      case 'SEDAN':
        return Math.round(80 + distanceKm * 21);
      case 'SUV':
        return Math.round(100 + distanceKm * 30);
      default:
        return Math.round(60 + distanceKm * 17);
    }
  };

  const currentFare = calculateFare();

  useEffect(() => {
    wsService.connect();

    const unsubDriverRequests = wsService.subscribe('/topic/drivers/requests', (newRide) => {
      setIncomingOffer(newRide);
      soundService.playDispatchPing();
    });

    return () => {
      unsubDriverRequests();
    };
  }, []);

  useEffect(() => {
    if (!activeRide || !activeRide.id) return;

    const unsubStatus = wsService.subscribe(`/topic/ride/${activeRide.id}/status`, (updatedRide) => {
      setActiveRide(updatedRide);

      if (updatedRide.status === 'DRIVER_ARRIVED') {
        soundService.playDriverArrivedChime();
      } else if (updatedRide.status === 'IN_PROGRESS') {
        soundService.playTripStartedSound();
      } else if (updatedRide.status === 'COMPLETED') {
        soundService.playPaymentSuccessSound();
        setIsPaymentOpen(true);
      }
    });

    const unsubLocation = wsService.subscribe(`/topic/ride/${activeRide.id}/location`, (loc) => {
      if (loc && loc.latitude && loc.longitude) {
        setActiveDriverCoords([loc.latitude, loc.longitude]);
        if (loc.heading !== undefined) setActiveDriverHeading(loc.heading);
      }
    });

    return () => {
      unsubStatus();
      unsubLocation();
    };
  }, [activeRide?.id]);

  useEffect(() => {
    if (!activeRide || !activeRide.id || activeRide.status === 'COMPLETED' || activeRide.status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const freshRide = await rideApi.getRideById(activeRide.id);
        setActiveRide(freshRide);

        if (freshRide.status === 'COMPLETED' && !isPaymentOpen) {
          setIsPaymentOpen(true);
        }
      } catch (err) {}
    }, 2500);

    return () => clearInterval(interval);
  }, [activeRide?.id, activeRide?.status, isPaymentOpen]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchRoute() {
      if (!pickupCoords || !dropCoords) return;
      try {
        const route = await getRealDrivingRoute(pickupCoords, dropCoords);
        if (!isCancelled && route) {
          setRouteCoordinates(route.coordinates);
          setDistanceKm(route.distanceKm);
          setDurationMinutes(route.durationMinutes);
        }
      } catch (e) {
        console.warn('Could not fetch OSRM route:', e);
      }
    }

    fetchRoute();
    return () => {
      isCancelled = true;
    };
  }, [pickupCoords, dropCoords]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPickupCoords([lat, lng]);
        const address = await reverseGeocode(lat, lng);
        setPickupAddress(address);
      },
      (err) => {
        alert('Could not retrieve GPS coordinates. Please allow location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!activeRide) return;

    if (driveIntervalRef.current) {
      clearInterval(driveIntervalRef.current);
      driveIntervalRef.current = null;
    }

    if (activeRide.status === 'ACCEPTED' && pickupCoords) {
      const driverStart = [
        pickupCoords[0] + (Math.random() - 0.5) * 0.02,
        pickupCoords[1] + (Math.random() - 0.5) * 0.02,
      ];
      setActiveDriverCoords(driverStart);

      getRealDrivingRoute(driverStart, pickupCoords).then((toPickupRoute) => {
        if (!toPickupRoute || toPickupRoute.coordinates.length < 2) return;

        const path = toPickupRoute.coordinates;
        let stepIdx = 0;

        driveIntervalRef.current = setInterval(() => {
          if (stepIdx < path.length) {
            const currentPt = path[stepIdx];
            const nextPt = path[Math.min(stepIdx + 1, path.length - 1)];
            const heading = calculateBearing(currentPt[0], currentPt[1], nextPt[0], nextPt[1]);

            setActiveDriverCoords(currentPt);
            setActiveDriverHeading(heading);
            setActiveDriverSpeed(38);

            driverApi.updateLocation(currentPt[0], currentPt[1], heading).catch(() => {});
            stepIdx++;
          } else {
            clearInterval(driveIntervalRef.current);
            driveIntervalRef.current = null;
          }
        }, 1200);
      });
    }

    if (activeRide.status === 'IN_PROGRESS' && routeCoordinates.length > 1) {
      let stepIdx = 0;
      const path = routeCoordinates;

      driveIntervalRef.current = setInterval(() => {
        if (stepIdx < path.length) {
          const currentPt = path[stepIdx];
          const nextPt = path[Math.min(stepIdx + 1, path.length - 1)];
          const heading = calculateBearing(currentPt[0], currentPt[1], nextPt[0], nextPt[1]);

          setActiveDriverCoords(currentPt);
          setActiveDriverHeading(heading);
          setActiveDriverSpeed(48);

          driverApi.updateLocation(currentPt[0], currentPt[1], heading).catch(() => {});
          stepIdx++;
        } else {
          clearInterval(driveIntervalRef.current);
          driveIntervalRef.current = null;
        }
      }, 1200);
    }

    return () => {
      if (driveIntervalRef.current) {
        clearInterval(driveIntervalRef.current);
        driveIntervalRef.current = null;
      }
    };
  }, [activeRide?.status, routeCoordinates]);

  const handleMapClick = async (latlng) => {
    if (!pickupCoords) {
      setPickupCoords([latlng.lat, latlng.lng]);
      const addr = await reverseGeocode(latlng.lat, latlng.lng);
      setPickupAddress(addr);
    } else {
      setDropCoords([latlng.lat, latlng.lng]);
      const addr = await reverseGeocode(latlng.lat, latlng.lng);
      setDropAddress(addr);
    }
  };

  const handleBookRide = async () => {
    if (!user || !token) {
      setAuthInitialMode('signup');
      setIsAuthOpen(true);
      return;
    }

    setIsBooking(true);
    setApiError(null);

    const vehicleMapping = {
      AUTO: 'AUTO',
      MINI: 'SEDAN',
      SEDAN: 'SEDAN',
      SUV: 'SUV',
    };

    const payload = {
      pickupAddress,
      pickupLat: pickupCoords[0],
      pickupLng: pickupCoords[1],
      dropAddress,
      dropLat: dropCoords[0],
      dropLng: dropCoords[1],
      vehicleType: vehicleMapping[selectedCategory] || 'SEDAN',
    };

    try {
      const realRide = await rideApi.requestRide(payload);
      setActiveRide(realRide);
      setIncomingOffer(realRide);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to dispatch ride');
    } finally {
      setIsBooking(false);
    }
  };

  const handleAcceptOffer = async () => {
    const targetRide = incomingOffer || activeRide;
    if (!targetRide || !targetRide.id) return;
    try {
      const updated = await driverApi.acceptRide(targetRide.id);
      setActiveRide(updated);
      setIncomingOffer(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept ride');
    }
  };

  const handleMarkArrived = async (rideId) => {
    try {
      const updated = await driverApi.markArrived(rideId);
      setActiveRide(updated);
      soundService.playDriverArrivedChime();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleStartRide = async (rideId, otp) => {
    try {
      const updated = await driverApi.startRide(rideId, otp);
      setActiveRide(updated);
      soundService.playTripStartedSound();
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid verification PIN');
    }
  };

  const handleCompleteRide = async (rideId) => {
    try {
      const updated = await driverApi.completeRide(rideId);
      setActiveRide(updated);
      soundService.playPaymentSuccessSound();
      setIsPaymentOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not complete ride');
    }
  };

  const handleCancelRide = async (rideId) => {
    try {
      await rideApi.cancelRide(rideId, 'Rider requested cancellation');
      setActiveRide(null);
      setIncomingOffer(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel ride');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#0E131F] flex flex-col selection:bg-vayro-lime selection:text-black">
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode);
          setIsAuthOpen(true);
        }}
      />

      <VayroHero
        pickupAddress={pickupAddress}
        dropAddress={dropAddress}
        onSelectPickup={(coords, address) => {
          setPickupCoords(coords);
          setPickupAddress(address);
        }}
        onSelectDrop={(coords, address) => {
          setDropCoords(coords);
          setDropAddress(address);
        }}
        onLocateMe={handleLocateMe}
        onBookRide={handleBookRide}
        isBooking={isBooking}
        pickupCoords={pickupCoords}
        dropCoords={dropCoords}
        routeCoordinates={routeCoordinates}
        activeDriverCoords={activeDriverCoords}
        activeDriverHeading={activeDriverHeading}
        activeDriverSpeed={activeDriverSpeed}
        activeRide={activeRide}
        distanceKm={distanceKm}
        durationMinutes={durationMinutes}
        fare={currentFare}
        selectedCategory={selectedCategory === 'MINI' ? 'Mini' : selectedCategory}
        onMapClick={handleMapClick}
      />

      <RideCategories
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
      />

      <HowItWorks />

      <SafetySection />

      <CtaBanner
        onBookClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {activeRide && activeRole === 'ROLE_RIDER' && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <RideTrackerModal
            ride={activeRide}
            onCancelRide={handleCancelRide}
            onOpenPayment={() => setIsPaymentOpen(true)}
          />
        </div>
      )}

      {activeRole === 'ROLE_DRIVER' && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm sm:max-w-md w-full animate-fade-in">
          <DriverWidget
            activeRide={activeRide}
            incomingOffer={incomingOffer}
            onAcceptOffer={handleAcceptOffer}
            onDeclineOffer={() => setIncomingOffer(null)}
            onMarkArrived={handleMarkArrived}
            onStartRide={handleStartRide}
            onCompleteRide={handleCompleteRide}
          />
        </div>
      )}

      {isPaymentOpen && (
        <PaymentModal
          ride={activeRide}
          onClose={() => {
            setIsPaymentOpen(false);
            setActiveRide(null);
            setIncomingOffer(null);
          }}
        />
      )}

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
