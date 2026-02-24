"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ExportButtonProps {
  /** API path to fetch export JSON from, e.g. "/api/killchains/1/export" */
  exportPath: string;
  /** Filename for the downloaded file (without .json extension) */
  filename: string;
}

export default function ExportButton({ exportPath, filename }: ExportButtonProps) {
  async function handleExport() {
    try {
      const res = await fetch(`${API_URL}${exportPath}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100 border border-gray-700 transition-colors cursor-pointer"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export JSON
    </button>
  );
}
