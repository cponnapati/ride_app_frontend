export async function geocodeAddress(address) {
  const q = encodeURIComponent(address.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`;

  const res = await fetch(url, {
    headers: { "Accept": "application/json", "Accept-Language": "en" }
  });

  if (!res.ok) throw new Error("Failed to geocode address");

  const data = await res.json();
  if (!data?.length) throw new Error("Location not found");

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}
