import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as any)?.role;

  if (pathname.startsWith("/admin")) {
    if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "admin") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/rider")) {
    if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "rider") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/seller")) {
    if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "seller") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/orders") || pathname.startsWith("/account")) {
    if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/rider/:path*", "/seller/:path*", "/checkout", "/orders/:path*", "/account/:path*"],
};
