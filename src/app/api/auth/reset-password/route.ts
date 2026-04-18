import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { token, newPassword } = parsed.data;

  const row = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(eq(schema.passwordResetTokens.token, token))
    .get();

  if (!row) {
    return NextResponse.json({ error: "Token no válido" }, { status: 404 });
  }
  if (row.used) {
    return NextResponse.json({ error: "Token ya utilizado" }, { status: 400 });
  }
  if (new Date(row.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: "Token expirado. Solicita uno nuevo." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(schema.users.id, row.userId));

  await db
    .update(schema.passwordResetTokens)
    .set({ used: true })
    .where(eq(schema.passwordResetTokens.id, row.id));

  return NextResponse.json({ message: "Contraseña restablecida correctamente" });
}
