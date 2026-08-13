export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decoded=verifyToken(token);
    if(request.nextUrl.pathname.startsWith("/admin") && decoded.role!=='admin'){
        return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch(err) {
  console.log("Token verification failed:", err);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*","/api/admin/:path*"], // protect these routes
};