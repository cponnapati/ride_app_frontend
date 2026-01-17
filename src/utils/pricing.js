// Deterministic, static "fake" pricing + pseudo route coordinates.
// No backend calls. Same inputs => same prices and same map markers.

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function formatMoney(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function canQuote(from, to) {
  return (from || "").trim().length >= 2 && (to || "").trim().length >= 2;
}

function getCityCenter(city) {
  const c = (city || "").toLowerCase();

  // You can extend this list anytime.
  if (c.includes("rio")) return { lat: -22.9068, lng: -43.1729, zoom: 12 };
  if (c.includes("hyderabad")) return { lat: 17.385, lng: 78.4867, zoom: 12 };
  if (c.includes("london")) return { lat: 51.5072, lng: -0.1276, zoom: 12 };
  if (c.includes("new york")) return { lat: 40.7128, lng: -74.006, zoom: 12 };

  // Default: Rio-ish so your screenshots match.
  return { lat: -22.9068, lng: -43.1729, zoom: 12 };
}

function jitterAround(center, seed) {
  // ~ up to 4-5km jitter
  const r1 = ((seed % 1000) / 1000) - 0.5;
  const r2 = (((seed >>> 10) % 1000) / 1000) - 0.5;

  const dLat = r1 * 0.06; // ~6km
  const dLng = r2 * 0.06;

  return {
    lat: center.lat + dLat,
    lng: center.lng + dLng,
  };
}

export function getPseudoRoute({ city, from, to }) {
  const center = getCityCenter(city);
  const seed = hashString(`${(from || "").trim().toLowerCase()}::${(to || "").trim().toLowerCase()}`);

  const pickup = jitterAround(center, seed);
  const drop = jitterAround(center, seed ^ 0x9e3779b9);

  return {
    center,
    pickup,
    drop,
  };
}

// Static OSM image (no API key) with two markers.
// Source: staticmap.openstreetmap.de
export function getStaticMapUrl({ city, from, to, width = 640, height = 520 }) {
  const { center, pickup, drop } = getPseudoRoute({ city, from, to });

  // markers format: lat,lng,color
  const markerA = `${pickup.lat.toFixed(5)},${pickup.lng.toFixed(5)},lightblue1`;
  const markerB = `${drop.lat.toFixed(5)},${drop.lng.toFixed(5)},red-pushpin`;

  // We intentionally keep zoom fixed by city for stable look.
  const zoom = center.zoom ?? 12;

  // NOTE: staticmap.de supports markers. Paths are inconsistent across mirrors, so we keep it simple.
  const params = new URLSearchParams({
    center: `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`,
    zoom: String(zoom),
    size: `${Math.min(width, 1024)}x${Math.min(height, 1024)}`,
    maptype: "mapnik",
    markers: `${markerA}|${markerB}`,
  });

  return `https://staticmap.openstreetmap.de/staticmap.php?${params.toString()}`;
}

export function getStaticQuotes({ from, to, currency = "USD" }) {
  const a = (from || "").trim().toLowerCase();
  const b = (to || "").trim().toLowerCase();
  const seed = hashString(`${a}::${b}`);

  const km = clamp(((seed % 3800) / 100) + 1.2, 1.2, 42.5);
  const minutes = Math.round(km * (2.2 + ((seed >>> 8) % 70) / 100));

  const base = 1.75 + ((seed >>> 16) % 100) / 100;
  const perKm = 0.95 + ((seed >>> 3) % 70) / 100;
  const perMin = 0.22 + ((seed >>> 11) % 30) / 100;

  const surge = 1 + (((seed >>> 20) % 25) / 100);
  const core = (base + km * perKm + minutes * perMin) * surge;

  const products = [
    { key: "economy", name: "Economy", multiplier: 1.0, etaMin: 3 + (seed % 4), seats: 4, note: "Affordable, everyday rides" },
    { key: "comfort", name: "Comfort", multiplier: 1.25, etaMin: 4 + ((seed >>> 2) % 5), seats: 4, note: "Better cars and comfort" },
    { key: "xl", name: "XL", multiplier: 1.55, etaMin: 5 + ((seed >>> 4) % 6), seats: 6, note: "More space for groups" },
    { key: "premium", name: "Premium", multiplier: 2.1, etaMin: 6 + ((seed >>> 6) % 7), seats: 4, note: "Premium rides" },
  ];

  const quotes = products.map((p) => {
    const raw = core * p.multiplier;
    const price = Math.round(raw * 100) / 100;
    return {
      ...p,
      price,
      priceLabel: formatMoney(price, currency),
      etaLabel: `${p.etaMin}-${p.etaMin + 3} min`,
    };
  });

  return {
    km: Math.round(km * 10) / 10,
    minutes,
    currency,
    surge: Math.round(surge * 100) / 100,
    quotes,
  };
}
