"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * Debug component to check session state
 * Remove this after debugging
 */
export function SessionDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("[SessionDebug] Status:", status);
    console.log("[SessionDebug] Session:", session);
    console.log("[SessionDebug] Has accessToken:", !!session?.accessToken);

    if (session?.accessToken) {
      console.log(
        "[SessionDebug] AccessToken (first 20 chars):",
        session.accessToken.substring(0, 20) + "..."
      );
    }
  }, [session, status]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-3 rounded shadow-lg max-w-xs z-50">
      <div className="font-bold mb-1">Session Debug</div>
      <div>Status: {status}</div>
      <div>User: {session?.user?.name || "None"}</div>
      <div>Token: {session?.accessToken ? "✓" : "✗"}</div>
    </div>
  );
}
