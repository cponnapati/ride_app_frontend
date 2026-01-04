import React from "react";

const map = {
  REQUESTED: "bg-amber-50 text-amber-800 border-amber-200",
  ASSIGNED: "bg-blue-50 text-blue-800 border-blue-200",
  ARRIVING: "bg-indigo-50 text-indigo-800 border-indigo-200",
  IN_PROGRESS: "bg-violet-50 text-violet-800 border-violet-200",
  COMPLETED: "bg-green-50 text-green-800 border-green-200",
  CANCELLED: "bg-red-50 text-red-800 border-red-200",
};

export function StatusPill({ status }) {
  const cls = map[status] || "bg-slate-50 text-slate-800 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
