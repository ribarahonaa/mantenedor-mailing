import "dotenv/config";
import { db, schema } from "../src/lib/db";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";

async function main() {
  const newPassword = process.argv[2] ?? "admin123";
  const hash = await bcrypt.hash(newPassword, 10);
  await db
    .update(schema.users)
    .set({ passwordHash: hash, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(schema.users.username, "admin"));
  console.log(`✓ admin password reseteado a "${newPassword}"`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
