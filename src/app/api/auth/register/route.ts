import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { or, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/session";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { username, email, password } = parsed.data;

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(or(eq(schema.users.username, username), eq(schema.users.email, email)))
    .get();

  if (existing) {
    return NextResponse.json(
      { error: "El usuario o email ya existen" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const inserted = await db
    .insert(schema.users)
    .values({ username, email, passwordHash, role: "user" })
    .returning()
    .get();

  const session = await getSession();
  session.userId = inserted.id;
  session.username = inserted.username;
  session.email = inserted.email;
  session.role = inserted.role;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({
    user: {
      id: inserted.id,
      username: inserted.username,
      email: inserted.email,
      role: inserted.role,
    },
  });
}
