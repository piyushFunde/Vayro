/**
 * Real-world Routing & Geocoding Service
 * Powered by OpenStreetMap Nominatim / Photon & OSRM (Open Source Routing Machine)
 * 100% Free, No API Keys required, Global coverage.
 */

// Search places worldwide with instant autocomplete
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    // Photon API (high-speed geocoding based on OpenStreetMap)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();

    return (data.features || []).map((feat) => {
      const p = feat.properties;
      const coords = [feat.geometry.coordinates[1], feat.geometry.coordinates[0]]; // [lat, lng]
      const nameParts = [p.name, p.street, p.city || p.county, p.state, p.country].filter(Boolean);
      const title = p.name || p.street || 'Location';
      const subtitle = nameParts.slice(1).join(', ');

      return {
        id: `${coords[0]}_${coords[1]}_${Math.random()}`,
        name: title,
        description: subtitle || p.country || 'Address',
        fullAddress: nameParts.join(', '),
        coords,
      };
    });
  } catch (err) {
    console.warn('Photon geocoding failed, falling back to Nominatim:', err);
    // Fallback to Nominatim
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      const res = await fetch(nomUrl, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await res.json();
      return (data || []).map((item) => ({
        id: item.place_id,
        name: item.display_name.split(',')[0],
        description: item.display_name.split(',').slice(1, 3).join(', '),
        fullAddress: item.display_name,
        coords: [parseFloat(item.lat), parseFloat(item.lon)],
      }));
    } catch (fallbackErr) {
      console.error('All geocoding services failed:', fallbackErr);
      return [];
    }
  }
}

// Reverse Geocode coordinates to real street address
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) throw new Error('Reverse geocoding failed');
    const data = await res.json();
    const addr = data.address || {};
    const street = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const country = addr.country || '';

    const label = [street, city, country].filter(Boolean).join(', ');
    return label || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Real Road Routing via OSRM (Driving network)
export async function getRealDrivingRoute(startCoords, endCoords) {
  if (!startCoords || !endCoords) return null;

  const [lat1, lng1] = startCoords;
  const [lat2, lng2] = endCoords;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM route failed');
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No driving route found');
    }

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]); // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
    const distanceKm = +(route.distance / 1000).toFixed(1);
    const durationMinutes = Math.max(1, Math.round(route.duration / 60));

    // Extract turn-by-turn steps
    const steps = [];
    if (route.legs && route.legs[0] && route.legs[0].steps) {
      for (const step of route.legs[0].steps) {
        if (step.maneuver && step.name) {
          steps.push({
            instruction: `${step.maneuver.type} onto ${step.name}`,
            distanceMeters: Math.round(step.distance),
          });
        }
      }
    }

    return {
      coordinates,
      distanceKm,
      durationMinutes,
      steps,
    };
  } catch (err) {
    console.warn('OSRM driving route failed, falling back to straight line calculation:', err);
    // Fallback: Haversine distance
    const dist = calculateHaversineDistance(lat1, lng1, lat2, lng2);
    const duration = Math.max(2, Math.round(dist * 2.5));
    return {
      coordinates: [
        [lat1, lng1],
        [lat2, lng2],
      ],
      distanceKm: +dist.toFixed(1),
      durationMinutes: duration,
      steps: [{ instruction: 'Head towards destination', distanceMeters: dist * 1000 }],
    };
  }
}

// Haversine formula calculation in kilometers
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute compass bearing / heading between two GPS coordinates (in degrees 0-360)
export function calculateBearing(startLat, startLng, endLat, endLng) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLngRad = (endLng * Math.PI) / 180;

  const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(endLatRad) -
    Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}
