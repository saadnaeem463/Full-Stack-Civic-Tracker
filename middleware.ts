export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/admin");
  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (isApiRoute) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "admin") {
      if (isApiRoute) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      if (request.nextUrl.pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch (err) {
    console.log("Token verification failed:", err);
    if (isApiRoute) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"], // protect these routes
};