export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

function isAdminOnly(pathname: string, method: string): boolean {
    if (pathname.startsWith("/admin/budget")) return true;
    if (pathname.startsWith("/admin/settings")) return true;
    if (pathname.startsWith("/api/admin/settings")) return true;

    if (pathname === "/api/admin/budget" && method !== "GET") return true;
    if (pathname.startsWith("/api/admin/budget/category") && method === "POST") return true;
    if (pathname.startsWith("/api/admin/budget/requests") && method === "PATCH") return true;

    if (pathname.startsWith("/api/admin/workers") && method !== "GET") return true;

    return false;
}

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
        const isStaff = decoded.role === "admin" || decoded.role === "moderator";

        if (!isStaff) {
            if (isApiRoute) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
            return NextResponse.redirect(new URL("/", request.url));
        }

        if (isAdminOnly(pathname, request.method) && decoded.role !== "admin") {
            if (isApiRoute) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.next();
    } catch (err) {
        console.log("Token verification failed:", err);
        if (isApiRoute) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"],
};