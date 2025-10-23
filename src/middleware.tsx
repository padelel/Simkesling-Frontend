import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt_decode from "jwt-decode";

export function middleware(request: NextRequest) {
  // Generate a per-request CSP nonce
  const nonce = crypto.randomUUID();

  const isProd = process.env.NODE_ENV === "production";
  const isScan = process.env.SCAN_MODE === "1";

  const imageDomains = [
    "randomuser.me",
    "firebasestorage.googleapis.com",
    "lalapan-depok.com",
    "fe-simkesling.lalapan-depok.com",
    "simkesling-depok.com",
    "simkesling.com",
  ];

  // In development, do NOT require a nonce for styles since many Next/webpack styles
  // are injected without one. Keep nonce only for prod/scan.
  const styleSrc = (isProd || isScan)
    ? `style-src 'self' 'nonce-${nonce}'`
    : `style-src 'self' 'unsafe-inline' data: blob:`;

  const base = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `img-src 'self' data: ${imageDomains.join(" ")}`,
    "font-src 'self' data:",
    styleSrc,
  ];
  const dev = [
    `script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'`,
    // Allow HTTP/WS connections used by Next dev server/HMR
    "connect-src 'self' http://127.0.0.1:8000 http://localhost:3002 ws://localhost:3001 ws://localhost:3002",
  ];
  const prod = [
    `script-src 'self' 'nonce-${nonce}'`,
    "connect-src 'self' https://be-simkesling.lalapan-depok.com",
  ];
  const scan = [
    `script-src 'self' 'nonce-${nonce}'`,
    "connect-src 'self' http://localhost:3000 http://localhost:3001 http://localhost:3002 http://localhost:8000 ws://localhost:3001 ws://localhost:3002",
  ];
  const csp = [...base, ...(isProd ? prod : (isScan ? scan : dev))].join("; ") + ";";

  // Helper to attach security headers and expose nonce via cookie
  const withSecurity = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", csp);
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Referrer-Policy", "no-referrer");
    // expose nonce to client for CSS-in-JS and webpack style tags
    res.cookies.set("nonce", nonce, { path: "/", httpOnly: false, sameSite: "lax" });
    // also expose via header for server-side _document.tsx
    res.headers.set("X-CSP-Nonce", nonce);
    return res;
  };

  // jika tidak include dashboard abaikan
  if (!request.nextUrl.pathname.toLowerCase().includes("dashboard")) {
    return withSecurity(NextResponse.next());
  }

  //  jika pathnya pendek /login atau /about/me abaikan
  const pathnya = request.nextUrl.pathname.split("/");
  if (pathnya.length < 3) {
    return withSecurity(NextResponse.next());
  }

  // admin or user
  const pathAccess = pathnya[2];
  if (!["admin", "user"].includes(pathAccess)) {
    return withSecurity(NextResponse.next());
  }

  let token: any = null;
  let user: any = null;
  let level: any = null;
  try {
    token = request.cookies.get("token");
    user = token?.value ? jwt_decode(token.value) : null;
    level = user.level;
  } catch (e) {
    // jika cookienya kosong buang ke login
    if (e instanceof TypeError) {
      return withSecurity(NextResponse.redirect(new URL("/login", request.url)));
    }
  }

  // jika (puskesmas or rs) TIDAK mengakses path user buang
  if (["3", "2"].includes(level) && pathAccess != "user") {
    return withSecurity(NextResponse.redirect(new URL("/login", request.url)));
  }
  if (["1"].includes(level) && pathAccess != "admin") {
    return withSecurity(NextResponse.redirect(new URL("/login", request.url)));
  }

  return withSecurity(NextResponse.next());
}
