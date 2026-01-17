import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { session } from "./api";
import { connectSocket } from "./socket";
import { Toast } from "./ui/Toast";

import LandingPage from "./pages/LandingPage.jsx";
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
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function App() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // connect socket only when authenticated
    if (!session.token) return;
    const s = connectSocket();
    return () => {
      try {
        s?.disconnect?.();
      } catch {}
    };
  }, []);

  const toastApi = useMemo(() => {
    return {
      show: (message, kind = "info") => setToast({ message, kind }),
      clear: () => setToast(null),
    };
  }, []);

  return (
    <>
      {toast && (
        <Toast
          kind={toast.kind}
          onClose={() => toastApi.clear()}
        >
          {toast.message}
        </Toast>
      )}

      <Routes>
        {/* NEW Uber-like landing */}
        <Route path="/" element={<LandingPage />} />

        {/* existing auth + dashboards */}
        <Route path="/auth" element={<AuthPage toast={toastApi} />} />

        <Route
          path="/rider"
          element={
            <RequireAuth role="RIDER">
              <RiderPage toast={toastApi} />
            </RequireAuth>
          }
        />
        <Route
          path="/driver"
          element={
            <RequireAuth role="DRIVER">
              <DriverPage toast={toastApi} />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth role="ADMIN">
              <AdminPage toast={toastApi} />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
