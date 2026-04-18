import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const row = await db
    .select({
      id: schema.passwordResetTokens.id,
      userId: schema.passwordResetTokens.userId,
      expiresAt: schema.passwordResetTokens.expiresAt,
      used: schema.passwordResetTokens.used,
      username: schema.users.username,
    })
    .from(schema.passwordResetTokens)
    .innerJoin(schema.users, eq(schema.users.id, schema.passwordResetTokens.userId))
    .where(eq(schema.passwordResetTokens.token, token))
    .get();

  if (!row) {
    return NextResponse.json(
      { valid: false, reason: "Token no encontrado" },
      { status: 404 }
    );
  }
  if (row.used) {
    return NextResponse.json(
      { valid: false, reason: "Token ya utilizado" },
      { status: 400 }
    );
  }
  if (new Date(row.expiresAt) < new Date()) {
    return NextResponse.json(
      { valid: false, reason: "Token expirado" },
      { status: 400 }
    );
  }
  return NextResponse.json({ valid: true, username: row.username });
}
