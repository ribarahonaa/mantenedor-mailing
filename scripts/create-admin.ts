import "dotenv/config";
import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db, schema } from "../src/lib/db";

/**
 * Crea o resetea la cuenta admin de forma idempotente.
 *
 * Si el usuario "admin" no existe → lo crea.
 * Si existe → le resetea la password, lo reactiva (isActive=true) y
 * se asegura de que su role sea "admin" (por si alguien lo degradó).
 *
 * Uso:
 *   npm run db:create-admin
 *     → genera una password aleatoria segura (la imprime una sola vez)
 *   npm run db:create-admin -- "MiPass123!"
 *     → usa la password provista
 *   npm run db:create-admin -- "MiPass123!" "admin@mi-org.com"
 *     → password + email (el email solo se usa si el admin no existe aún)
 */

function generateStrongPassword(): string {
  // 18 bytes base64url ≈ 24 caracteres · ~144 bits de entropía
  return randomBytes(18).toString("base64url");
}

async function main() {
  const USERNAME = "admin";
  const providedPassword = process.argv[2];
  const email = process.argv[3] || "admin@example.com";
  const password = providedPassword || generateStrongPassword();

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, USERNAME))
    .get();

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    await db
      .update(schema.users)
      .set({
        passwordHash,
        role: "admin",
        isActive: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(schema.users.id, existing.id));
    console.log(`✓ admin existente actualizado (id=${existing.id})`);
  } else {
    const inserted = await db
      .insert(schema.users)
      .values({
        username: USERNAME,
        email,
        passwordHash,
        role: "admin",
        isActive: true,
      })
      .returning({ id: schema.users.id })
      .get();
    console.log(`✓ admin creado (id=${inserted.id}, email=${email})`);
  }

  console.log("");
  console.log(`  username: ${USERNAME}`);
  console.log(`  password: ${password}`);
  if (!providedPassword) {
    console.log("");
    console.log("  ⚠  Guárdala ahora — no se volverá a mostrar.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✗", e);
    process.exit(1);
  });
