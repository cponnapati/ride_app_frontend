import React from "react";
import { Link, NavLink } from "react-router-dom";
import { session } from "../api";
import { Car, LogOut, LayoutDashboard, Shield, User } from "lucide-react";

export function Layout({ title, children }) {
  const me = session.me;

  function logout() {
    session.clear();
    window.location.href = "/auth";
  }

  const nav = [
    { to: "/rider", label: "Rider", icon: <User size={18} />, show: me?.role === "RIDER" },
    { to: "/driver", label: "Driver", icon: <Car size={18} />, show: me?.role === "DRIVER" },
    { to: "/admin", label: "Admin", icon: <Shield size={18} />, show: me?.role === "ADMIN" },
  ].filter(n => n.show);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <LayoutDashboard size={18} />
            Ride Platform
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{me?.role}</span>
              <span className="hidden sm:inline"> • {me?.email}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border bg-white p-3">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Navigation
            </div>
            <div className="flex md:flex-col gap-2">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm border ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    }`
                  }
                >
                  {n.icon}
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        </aside>

        <main className="col-span-12 md:col-span-9">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="text-slate-600 text-sm"></p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl border bg-white">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="font-semibold text-slate-900">{title}</div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const cls =
    variant === "secondary"
      ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-900"
      : variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
      : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900";
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border ${cls} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ label, ...props }) {
  return (
    <label className="block">
      {label && <div className="text-xs font-medium text-slate-600 mb-1">{label}</div>}
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
      />
    </label>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <label className="block">
      {label && <div className="text-xs font-medium text-slate-600 mb-1">{label}</div>}
      <select
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
      >
        {children}
      </select>
    </label>
  );
}
