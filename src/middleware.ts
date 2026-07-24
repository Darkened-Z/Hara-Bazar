import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/seller")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if ((req.auth.user as any)?.role !== "seller") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/orders") || pathname.startsWith("/account")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/seller/:path*", "/checkout", "/orders/:path*", "/account/:path*"],
};
