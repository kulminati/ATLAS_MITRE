import { api } from "@/lib/api";
import type { KillchainSummary } from "@/lib/types";
import KillchainGallery from "@/components/killchain/KillchainGallery";

export default async function KillchainPage() {
  let killchains: KillchainSummary[] | null = null;
  let categories: string[] = [];
  let error: string | null = null;

  try {
    [killchains, categories] = await Promise.all([
      api.getKillchains(),
      api.getKillchainCategories(),
    ]);
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Failed to connect to the backend.";
  }

  if (error || !killchains) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-300">
          Backend Not Available
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Could not connect to the API server. Make sure the FastAPI backend is
          running on{" "}
          <code className="text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded text-sm">
            localhost:8000
          </code>
        </p>
        {error && (
          <p className="text-red-400/70 text-sm mt-2">{error}</p>
        )}
      </div>
    );
  }

  return <KillchainGallery killchains={killchains} categories={categories} />;
}
