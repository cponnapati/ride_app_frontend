import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Layout, Card, Button } from "../ui/Layout";
import { StatusPill } from "../ui/StatusPill";

export default function AdminPage() {
  const [rides, setRides] = useState([]);
  const [err, setErr] = useState("");

  async function refresh() {
    setErr("");
    try {
      const data = await api.adminRides();
      setRides(data.rides);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  useEffect(() => { refresh().catch(() => {}); }, []);

  return (
    <Layout title="Admin Dashboard">
      <Card title="All rides" right={<Button variant="secondary" onClick={refresh}>Refresh</Button>}>
        {err && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</div>}
        {rides.length === 0 ? (
          <div className="text-sm text-slate-600">No rides found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr className="border-b">
                  <th className="py-2 pr-3">Ride ID</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Rider</th>
                  <th className="py-2 pr-3">Driver</th>
                  <th className="py-2 pr-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-3 font-mono text-xs">{r.id}</td>
                    <td className="py-3 pr-3"><StatusPill status={r.status} /></td>
                    <td className="py-3 pr-3 text-slate-700">{r.riderId}</td>
                    <td className="py-3 pr-3 text-slate-700">{r.driverId || "—"}</td>
                    <td className="py-3 pr-3 text-slate-700">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
}
