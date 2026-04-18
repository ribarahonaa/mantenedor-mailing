import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";

const GENERIC_MESSAGE =
  "Si el email está registrado, recibirás instrucciones para restablecer la contraseña.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Email inválido" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  const user = await db
    .select({ id: schema.users.id, username: schema.users.username })
    .from(schema.users)
    .where(and(eq(schema.users.email, email), eq(schema.users.isActive, true)))
    .get();

  // No revelamos si el email existe: misma respuesta en ambos casos.
  // Si existe, además incluimos el resetUrl (en prod vendría por email).
  if (!user) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await db.insert(schema.passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  return NextResponse.json({
    message: GENERIC_MESSAGE,
    resetUrl,
    expiresAt,
    username: user.username,
  });
}
