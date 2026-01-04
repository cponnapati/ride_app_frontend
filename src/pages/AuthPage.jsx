import React, { useState } from "react";
import { api, session } from "../api";
import { Button, Card, Input, Select } from "../ui/Layout";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("rider@test.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("RIDER");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      const payload =
        mode === "register"
          ? { email, password, role, name: name || undefined }
          : { email, password };

      const data = mode === "register" ? await api.register(payload) : await api.login(payload);
      session.token = data.token;
      session.me = data.user;

      if (data.user.role === "RIDER") window.location.href = "/rider";
      if (data.user.role === "DRIVER") window.location.href = "/driver";
      if (data.user.role === "ADMIN") window.location.href = "/admin";
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold text-slate-900">Ride Platform</div>
          <div className="text-sm text-slate-600">Login/Register to continue</div>
        </div>

        <Card
          title={mode === "register" ? "Create account" : "Welcome back"}
          right={
            <div className="flex gap-2">
              <button
                className={`text-sm px-3 py-1 rounded-xl border ${mode === "login" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200"}`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={`text-sm px-3 py-1 rounded-xl border ${mode === "register" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200"}`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>
          }
        >
          <div className="grid gap-4">
            {mode === "register" && (
              <>
                <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option>RIDER</option>
                  <option>DRIVER</option>
                  <option>ADMIN</option>
                </Select>
                <Input label="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              </>
            )}

            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {err && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {err}
              </div>
            )}

            <Button onClick={submit} disabled={busy}>
              {busy ? "Please wait..." : mode === "register" ? "Create account" : "Login"}
            </Button>

            <div className="text-xs text-slate-500">
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
