import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Layout, Card, Button, Input, Select } from "../ui/Layout";
import { StatusPill } from "../ui/StatusPill";
import { getSocket } from "../socket";
import { geocodeAddress } from "../utils/geocode";

export default function DriverPage() {
  const [rides, setRides] = useState([]);
  const [online, setOnline] = useState(false);
  const [rideId, setRideId] = useState("");
  const [statusRideId, setStatusRideId] = useState("");
  const [status, setStatus] = useState("ARRIVING");
  const [currentLocation, setCurrentLocation] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function refresh() {
    const data = await api.myRides();
    setRides(data.rides);
  }

  useEffect(() => {
    refresh().catch(() => {});

    // safe socket init
    let socket;
    try {
      socket = getSocket();
    } catch {
      socket = null;
    }
    if (!socket) return;

    // backend pushes updates automatically
    socket.on("ride:update", (payload) => {
      const ride = payload?.ride ?? payload;

      setRides((prev) => {
        const idx = prev.findIndex((r) => r.id === ride.id);
        if (idx === -1) return [ride, ...prev];
        const copy = [...prev];
        copy[idx] = ride;
        return copy;
      });
    });

    socket.on("ride:new", () => {
      // optional: refresh().catch(() => {});
    });

    return () => {
      socket.off("ride:update");
      socket.off("ride:new");
    };
  }, []);

  async function goOnline() {
    setErr("");
    setMsg("");
    await api.driverOnline();
    setOnline(true);
    setMsg("You are online.");
  }

  async function goOffline() {
    setErr("");
    setMsg("");
    await api.driverOffline();
    setOnline(false);
    setMsg("You are offline.");
  }

  // ✅ FIXED: convert typed location -> lat/lng and send to backend
  async function sendLocation() {
    setErr("");
    setMsg("");
    try {
      if (!currentLocation.trim()) {
        setErr("Please enter a location.");
        return;
      }

      const coords = await geocodeAddress(currentLocation);

      await api.driverLocation({
        lat: coords.lat,
        lng: coords.lng,
      });

      setMsg(`Location updated: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  async function acceptRide() {
    setErr("");
    setMsg("");

    try {
      // ✅ Use your existing backend driver accept route
      await api.driverAccept({ rideId });

      setMsg("Ride accepted.");
      await refresh();
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  async function updateStatus() {
    setErr("");
    setMsg("");
    try {
      await api.driverStatus({ rideId: statusRideId, status });
      await refresh();
      setMsg("Ride status updated.");
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  return (
    <Layout title="Driver Dashboard">
      <div className="grid gap-6">
        <Card
          title="Driver status"
          right={
            <div className="flex gap-2">
              <Button onClick={goOnline} disabled={online}>
                Go Online
              </Button>
              <Button variant="secondary" onClick={goOffline} disabled={!online}>
                Go Offline
              </Button>
            </div>
          }
        >
          <div className="text-sm text-slate-700">
            Current:{" "}
            <span className={`font-semibold ${online ? "text-green-700" : "text-slate-700"}`}>
              {online ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <Input
              label="Current Location"
              placeholder="Example: Gachibowli, Hyderabad"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
            />

            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={sendLocation}
                className="w-full"
                disabled={!currentLocation.trim()}
              >
                Update Location
              </Button>
            </div>
          </div>

          {msg && (
            <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              {msg}
            </div>
          )}
          {err && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {err}
            </div>
          )}
        </Card>

        <Card title="Actions">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="grid gap-3">
              <div className="font-semibold text-slate-900">Accept ride</div>
              <Input
                label="Ride ID"
                value={rideId}
                onChange={(e) => setRideId(e.target.value)}
                placeholder="Paste ride id..."
              />
              <Button onClick={acceptRide} disabled={!rideId}>
                Accept
              </Button>
            </div>

            <div className="grid gap-3">
              <div className="font-semibold text-slate-900">Update ride status</div>
              <Input
                label="Ride ID"
                value={statusRideId}
                onChange={(e) => setStatusRideId(e.target.value)}
                placeholder="Paste ride id..."
              />
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>ARRIVING</option>
                <option>IN_PROGRESS</option>
                <option>COMPLETED</option>
                <option>CHECKED_OUT</option>
                <option>CANCELLED</option>
              </Select>
              <Button variant="secondary" onClick={updateStatus} disabled={!statusRideId}>
                Update Status
              </Button>
              <div className="text-xs text-slate-500">
                Note: backend supports ARRIVING, IN_PROGRESS, COMPLETED, CANCELLED.
              </div>
            </div>
          </div>
        </Card>

        <Card title="My assigned rides" right={<Button variant="secondary" onClick={refresh}>Refresh</Button>}>
          {rides.length === 0 ? (
            <div className="text-sm text-slate-600">No assigned rides yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Ride ID</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Rider</th>
                    <th className="py-2 pr-3">Pickup</th>
                    <th className="py-2 pr-3">Drop</th>
                    <th className="py-2 pr-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3 font-mono text-xs">{r.id}</td>
                      <td className="py-3 pr-3"><StatusPill status={r.status} /></td>
                      <td className="py-3 pr-3 text-slate-700">
                        {r.rider ? (r.rider.name || r.rider.email || r.rider.id) : (r.riderId || "—")}
                      </td>
                      <td className="py-3 pr-3 text-slate-700">
                        {typeof r.pickupLat === "number" && typeof r.pickupLng === "number"
                          ? `${r.pickupLat.toFixed(5)}, ${r.pickupLng.toFixed(5)}`
                          : "—"}
                      </td>
                      <td className="py-3 pr-3 text-slate-700">
                        {typeof r.dropLat === "number" && typeof r.dropLng === "number"
                          ? `${r.dropLat.toFixed(5)}, ${r.dropLng.toFixed(5)}`
                          : "—"}
                      </td>
                      <td className="py-3 pr-3 text-slate-700">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
