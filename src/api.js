const API = "http://localhost:4000";

export const session = {
  get token() { return localStorage.getItem("token"); },
  set token(v) { localStorage.setItem("token", v); },
  clear() { localStorage.removeItem("token"); localStorage.removeItem("me"); },
  get me() { try { return JSON.parse(localStorage.getItem("me") || "null"); } catch { return null; } },
  set me(v) { localStorage.setItem("me", JSON.stringify(v)); }
};

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(session.token ? { Authorization: `Bearer ${session.token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.error
      ? (typeof data.error === "string" ? data.error : JSON.stringify(data.error))
      : "Request failed";
    throw new Error(msg);
  }
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),

  createRide: (payload) => request("/api/rides", { method: "POST", body: payload }),
  myRides: () => request("/api/rides/my"),

  // ✅ NEW Uber-style accept route (if backend supports it)
  acceptRide: (rideId) => request(`/api/rides/${rideId}/accept`, { method: "POST" }),

  driverOnline: () => request("/api/driver/online", { method: "POST" }),
  driverOffline: () => request("/api/driver/offline", { method: "POST" }),
  driverLocation: (payload) => request("/api/driver/location", { method: "POST", body: payload }),
  driverAvailableRides: () => request("/api/driver/available-rides"),

  // ✅ Keep old accept route too (so nothing breaks)
  driverAccept: (payload) => request("/api/driver/accept", { method: "POST", body: payload }),

  driverStatus: (payload) => request("/api/driver/status", { method: "POST", body: payload }),
  adminRides: () => request("/api/admin/rides")
};
