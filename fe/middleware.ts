import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isOnLogin = req.nextUrl.pathname.startsWith("/login");

  // Jika sudah login dan mencoba akses login page, redirect berdasarkan role
  if (isLoggedIn && isOnLogin) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Jika belum login dan mencoba akses dashboard, redirect ke login
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika belum login dan mencoba akses admin, redirect ke login
  if (!isLoggedIn && isOnAdmin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika HOST mencoba akses admin, redirect ke dashboard host
  if (isLoggedIn && userRole === "HOST" && isOnAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Jika ADMIN mencoba akses dashboard host, redirect ke admin dashboard
  if (isLoggedIn && userRole === "ADMIN" && isOnDashboard) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
});

// Konfigurasi matcher untuk middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
