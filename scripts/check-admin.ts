import "dotenv/config";
import { db, schema } from "../src/lib/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function main() {
  const admin = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, "admin"))
    .get();

  if (!admin) {
    console.log("admin no existe");
    return;
  }

  console.log("admin:", {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    active: admin.isActive,
    role: admin.role,
    hash_prefix: admin.passwordHash.substring(0, 20),
  });

  for (const pwd of ["admin123", "prueba999", "nuevaClave456"]) {
    const match = await bcrypt.compare(pwd, admin.passwordHash);
    console.log(`  "${pwd}" match?`, match);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
