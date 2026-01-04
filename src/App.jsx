import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { session } from "./api";
import { connectSocket } from "./socket";
import { Toast } from "./ui/Toast";

import AuthPage from "./pages/AuthPage.jsx";
import RiderPage from "./pages/RiderPage.jsx";
import DriverPage from "./pages/DriverPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

function RequireAuth({ children, role }) {
  const me = session.me;
  if (!session.token || !me) return <Navigate to="/auth" replace />;

  if (role && me.role !== role) {
    if (me.role === "RIDER") return <Navigate to="/rider" replace />;
    if (me.role === "DRIVER") return <Navigate to="/driver" replace />;
    if (me.role === "ADMIN") return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  const [toast, setToast] = useState({ message: "", type: "info" });

  const socket = useMemo(() => {
    if (!session.token) return null;
    return connectSocket();
  }, [session.token]);

  useEffect(() => {
    if (!socket) return;

    socket.on("ride:new", () => setToast({ message: "New ride requested (for drivers).", type: "info" }));
    socket.on("ride:update", (r) => setToast({ message: `Ride updated: ${r.status}`, type: "success" }));
    socket.on("connect_error", (e) => setToast({ message: e.message || "Socket error", type: "error" }));

    return () => socket.disconnect();
  }, [socket]);

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/rider" element={<RequireAuth role="RIDER"><RiderPage /></RequireAuth>} />
        <Route path="/driver" element={<RequireAuth role="DRIVER"><DriverPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth role="ADMIN"><AdminPage /></RequireAuth>} />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function HomeRedirect() {
  const me = session.me;
  if (!session.token || !me) return <Navigate to="/auth" replace />;
  if (me.role === "RIDER") return <Navigate to="/rider" replace />;
  if (me.role === "DRIVER") return <Navigate to="/driver" replace />;
  return <Navigate to="/admin" replace />;
}
