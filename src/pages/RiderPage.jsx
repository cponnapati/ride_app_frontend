import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Layout, Card, Button, Input } from "../ui/Layout";
import { StatusPill } from "../ui/StatusPill";
import { geocodeAddress } from "../utils/geocode";

export default function RiderPage() {
  const [rides, setRides] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function refresh() {
    const data = await api.myRides();
    setRides(data.rides);
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  async function createRide() {
    setErr("");

    if (!from || !to) {
      setErr("Please enter both From and To locations.");
      return;
    }

    setBusy(true);
    try {
      // Convert typed addresses -> latitude/longitude (required by backend)
      const pickup = await geocodeAddress(from);
      const drop = await geocodeAddress(to);

      // Send payload that backend expects
      await api.createRide({
        pickupAddress: from,
        dropAddress: to,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropLat: drop.lat,
        dropLng: drop.lng,
      });

      await refresh();
      setFrom("");
      setTo("");
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout title="Rider Dashboard">
      <div className="grid gap-6">
        <Card
          title="Request a ride"
          right={
            <Button onClick={createRide} disabled={busy}>
              {busy ? "Requesting..." : "Request Ride"}
            </Button>
          }
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="From"
              placeholder="Pickup location"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              label="To"
              placeholder="Destination"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {err && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {err}
            </div>
          )}
        </Card>

        <Card
          title="My rides"
          right={
            <Button variant="secondary" onClick={refresh}>
              Refresh
            </Button>
          }
        >
          {rides.length === 0 ? (
            <div className="text-sm text-slate-600">No rides yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Ride ID</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Driver</th>
                    <th className="py-2 pr-3">Created</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3 font-mono text-xs">{r.id}</td>
                      <td className="py-3 pr-3">
                        <StatusPill status={r.status} />
                      </td>
                      <td className="py-3 pr-3 text-slate-700">
                        {r.driver
                          ? r.driver.name || r.driver.email || r.driver.id
                          : r.driverId || "—"}
                      </td>
                      <td className="py-3 pr-3 text-slate-700">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          className="text-xs underline text-slate-700 hover:text-slate-900"
                          onClick={() => navigator.clipboard.writeText(r.id)}
                        >
                          Copy ID
                        </button>
                      </td>
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
