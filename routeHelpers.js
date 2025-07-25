// routeHelpers.js
// Helper functions for route distance calculations and geocoding

// Calculates driving distance between two points using OpenRouteService
export async function getRouteDistanceORS(start, end) {
  const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRkZGE0M2MyYWVmNDRkYzFiYWRmMzMyN2IzMzhmMzMxIiwiaCI6Im11cm11cjY0In0='; // <-- Replace with your real key!
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('ORS API error');
    const data = await res.json();
    // Distance in meters
    const distanceKm = data.features[0].properties.summary.distance / 1000;
    return distanceKm;
  } catch (err) {
    console.error('Error fetching route distance:', err);
    return null;
  }
}

// Calculates total distance (in km) from an array of {lat, lng} points (tracked route)
export function calculateRouteDistance(route) {
  if (!route || route.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversine(route[i-1], route[i]);
  }
  return total / 1000; // return in kilometers
}

function haversine(a, b) {
  const R = 6371000; // meters
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad((b.lat || b.latitude) - (a.lat || a.latitude));
  const dLon = toRad((b.lng || b.longitude) - (a.lng || a.longitude));
  const lat1 = toRad(a.lat || a.latitude);
  const lat2 = toRad(b.lat || b.latitude);
  const h =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Downsamples a route array to N points (start, end, and evenly spaced in between)
export function distillRoute(route, maxPoints = 20) {
  if (!route || route.length <= maxPoints) return route;
  const result = [];
  const step = (route.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.round(i * step);
    result.push(route[idx]);
  }
  return result;
}

// Gets the governorate/state from coordinates using OpenStreetMap Nominatim
export async function getGovernorateFromCoords(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TaxiFairApp/1.0',
        'Accept-Language': 'ar,en'
      }
    });
    if (!res.ok) throw new Error('Nominatim error');
    const data = await res.json();
    // Try to get governorate from address
    const gov = data.address.state || data.address.county || data.address.region || '';
    return gov;
  } catch (err) {
    console.error('Error fetching governorate:', err);
    return '';
  }
} 