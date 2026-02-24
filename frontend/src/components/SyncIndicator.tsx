"use client";

import { useEffect, useState } from "react";
import type { SyncStatus } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sync/status`);
      if (!res.ok) throw new Error("Failed to fetch sync status");
      const data: SyncStatus = await res.json();
      setStatus(data);
      setError(null);
    } catch {
      setError("offline");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/sync`, { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      await fetchStatus();
    } catch {
      setError("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (error === "offline") {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-gray-600" />
        API offline
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${
          status.needs_sync ? "bg-amber-400" : "bg-emerald-400"
        }`}
      />
      <span className="text-gray-400">
        {status.last_updated
          ? `Synced ${formatRelativeTime(status.last_updated)}`
          : "Never synced"}
      </span>
      {status.needs_sync && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="ml-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
        >
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      )}
      {error && <span className="text-red-400">{error}</span>}
    </div>
  );
}
