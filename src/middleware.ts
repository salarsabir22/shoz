import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const AUTH_COOKIE = "auth_token";

function getSecret(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

async function readPayload(
  token: string
): Promise<{ userId: string; role: string; email: string } | null> {
  const secret = getSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const userId = payload.userId as string | undefined;
    const role = payload.role as string | undefined;
    const email = payload.email as string | undefined;
    if (!userId || !role || !email) return null;
    return { userId, role, email };
  } catch {
    return null;
  }
}

function clearAuthCookieResponse(res: NextResponse): NextResponse {
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value ?? null;
  const payload = token ? await readPayload(token) : null;

  const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");
  const needsAuth =
    pathname.startsWith("/explore") ||
    pathname.startsWith("/listing") ||
    pathname.startsWith("/customer/dashboard") ||
    pathname.startsWith("/business/dashboard");

  const needsBusiness = pathname.startsWith("/business/dashboard");

  if (isAuthPage && payload) {
    const url = request.nextUrl.clone();
    url.pathname = payload.role === "business" ? "/business/dashboard" : "/explore";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (needsAuth) {
    if (!token || !payload) {
      const login = request.nextUrl.clone();
      login.pathname = "/auth/login";
      login.searchParams.set("next", pathname);
      if (token && !payload) {
        return clearAuthCookieResponse(NextResponse.redirect(login));
      }
      return NextResponse.redirect(login);
    }

    if (needsBusiness && payload.role !== "business") {
      const url = request.nextUrl.clone();
      url.pathname = "/explore";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/explore/:path*",
    "/listing/:path*",
    "/customer/dashboard/:path*",
    "/business/dashboard/:path*",
    "/auth/login",
    "/auth/signup",
  ],
};
