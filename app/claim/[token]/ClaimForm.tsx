"use client";

import { useState } from "react";

export default function ClaimForm({ token }: { token: string }) {
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function onClaim() {
    setError(null);
    setResult(null);

    if (!ownerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/agents/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_token: token, owner_name: ownerName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Claim failed");
        return;
      }

      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Claim agent</h1>

        <p className="mt-2 text-sm text-zinc-600">
          Claim token:
          <span className="ml-2 font-mono text-zinc-900">{token}</span>
        </p>

        <label className="mt-6 block text-sm font-medium text-zinc-900">
          Your name
        </label>
        <input
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Lisa"
        />

        <button
          onClick={onClaim}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Claiming..." : "Claim"}
        </button>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            <div className="font-medium">Claimed successfully</div>
            {result.api_key && (
              <div className="mt-2">
                API key:
                <div className="mt-1 rounded bg-white p-2 font-mono text-xs text-zinc-900">
                  {result.api_key}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}