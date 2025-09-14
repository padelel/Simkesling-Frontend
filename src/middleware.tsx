import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt_decode from "jwt-decode";

export function middleware(request: NextRequest) {
  // return NextResponse.next();

  // jika tidak include dashboard abaikan
  if (!request.nextUrl.pathname.toLowerCase().includes("dashboard"))
    return NextResponse.next();
  //  jika pathnya pendek /login atau /about/me abaikan
  let pathnya = request.nextUrl.pathname.split("/");
  if (pathnya.length < 3) return NextResponse.next();

  // admin or user
  let pathAccess = pathnya[2];
  if (!["admin", "user"].includes(pathAccess)) return NextResponse.next();
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
      return NextResponse.redirect(request.nextUrl.origin + "/login");
    }
  }

  console.log(pathAccess);
  // jika (puskesmas or rs) TIDAK mengakses path user buang
  if (["3", "2"].includes(level) && pathAccess != "user") {
    return NextResponse.redirect(request.nextUrl.origin + "/login");
  }
  if (["1"].includes(level) && pathAccess != "admin") {
    return NextResponse.redirect(request.nextUrl.origin + "/login");
  }
  // console.log(user);
  // console.log(request.nextUrl.pathname);
  return NextResponse.next();
}
