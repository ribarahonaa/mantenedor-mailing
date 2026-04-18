import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: number;
  username?: string;
  email?: string;
  role?: "admin" | "user";
  isLoggedIn: boolean;
}

const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32) {
  throw new Error(
    "SESSION_SECRET no está definido o es menor a 32 caracteres. Define uno en .env.local"
  );
}

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: "mantenedor-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Helper para páginas/API routes que requieren un usuario autenticado.
 * Lanza redirect a /login si no hay sesión activa.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session;
}

/**
 * Similar a requireSession pero además exige rol admin.
 */
export async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "admin") {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return session;
}
