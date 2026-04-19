import "dotenv/config";
import { db, schema } from "../src/lib/db";

async function main() {
  const users = await db.select().from(schema.users).all();
  const sections = await db.select().from(schema.masterSections).all();
  const newsletters = await db.select().from(schema.newsletters).all();

  console.log(`✓ users: ${users.length}`);
  users.forEach((u) => console.log(`  - ${u.username} (${u.role}) ${u.email}`));

  console.log(`✓ master_sections: ${sections.length}`);
  sections.slice(0, 5).forEach((s) =>
    console.log(`  - [${s.type}] ${s.name} — ${s.title}`)
  );

  console.log(`✓ newsletters: ${newsletters.length}`);
  newsletters.forEach((n) =>
    console.log(`  - ${n.name} · user_id=${n.userId}`)
  );
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("✗", err);
  process.exit(1);
});
