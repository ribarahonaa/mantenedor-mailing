import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/reset-password"];
const PUBLIC_API_PREFIXES = ["/api/auth/"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const res = NextResponse.next();
  // Overload (req, res): lee la cookie del Cookie header del request y
  // escribe Set-Cookie en el response. req.cookies (RequestCookies) no
  // sirve — es read-only y su tipo no calza. res.cookies tampoco — está
  // vacío al inicio del middleware.
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (isPublic(pathname)) {
    // Si ya está logueado y entra a /login, lo mandamos al home
    if (pathname === "/login" && session.isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return res;
  }

  // Rutas privadas — requieren sesión
  if (!session.isLoggedIn) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    // Proteger todo excepto assets estáticos, _next, favicon
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
