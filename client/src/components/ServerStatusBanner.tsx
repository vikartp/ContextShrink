"use client";

import { useState, useEffect } from "react";

export default function ServerStatusBanner() {
  const [serverState, setServerState] = useState<'starting' | 'ready' | null>(null);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;
    let successTimeout: ReturnType<typeof setTimeout>;

    const checkHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/health`);
        if (!res.ok) throw new Error("Server returned an error");
        
        setServerState((prev) => {
          if (prev === 'starting') {
            successTimeout = setTimeout(() => setServerState(null), 5000);
            return 'ready';
          }
          return null;
        });
        return true;
      } catch (err) {
        console.error("Health check failed:", err);
        setServerState('starting');
        return false;
      }
    };

    const runInit = async () => {
      const ok = await checkHealth();
      if (!ok) {
        pollInterval = setInterval(async () => {
          const isOk = await checkHealth();
          if (isOk) clearInterval(pollInterval);
        }, 5000);
      }
    };
    
    runInit();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (successTimeout) clearTimeout(successTimeout);
    };
  }, []);

  if (!serverState) return null;

  return (
    <>
      {serverState === 'starting' && (
        <div className="bg-accent-amber-soft text-accent-amber px-4 py-3 rounded-lg mb-4 border border-accent-amber-soft text-center">
          Please wait, we are waking up the server...
        </div>
      )}
      {serverState === 'ready' && (
        <div className="bg-accent-green-soft text-accent-green px-4 py-3 rounded-lg mb-4 border border-accent-green-soft text-center">
          Server is back online! You can proceed now.
        </div>
      )}
    </>
  );
}
