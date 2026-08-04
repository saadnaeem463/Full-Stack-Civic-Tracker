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
    verifyToken(token);
    return NextResponse.next();
  } catch(err) {
  console.log("Token verification failed:", err);
    return NextResponse.redirect(new URL("/auth/login", request.url));;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // protect these routes
};