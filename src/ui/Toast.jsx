import React, { useEffect } from "react";

export function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const styles =
    type === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : type === "success"
      ? "bg-green-50 text-green-800 border-green-200"
      : "bg-slate-50 text-slate-800 border-slate-200";

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`border ${styles} shadow-sm rounded-xl px-4 py-3 min-w-[280px]`}>
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm">{message}</div>
          <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      </div>
    </div>
  );
}
