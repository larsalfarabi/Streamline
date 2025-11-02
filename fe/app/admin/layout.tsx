"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Redirect if not admin
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard"); // Redirect hosts to their dashboard
      return;
    }
  }, [status, session, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not admin (will redirect)
  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
