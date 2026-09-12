export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const ADMIN_ONLY_PREFIXES = [
  "/admin/budget",
  "/admin/settings",
  "/api/admin/budget",
  "/api/admin/settings",
];

export function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl;
    const isApiRoute = pathname.startsWith("/api/admin");
  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (isApiRoute) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decoded = verifyToken(token);
    const isStaff=decoded.role==='admin' || decoded.role==='moderator'
    const isAdminOnlyPath=ADMIN_ONLY_PREFIXES.some((p)=>pathname.startsWith(p))

    if (!isStaff) {
      if (isApiRoute) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAdminOnlyPath && decoded.role !== "admin") {
      if (isApiRoute) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      return NextResponse.redirect(new URL("/admin/dashboard",request.url))
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