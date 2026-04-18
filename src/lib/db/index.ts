import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Cliente DB compartido. Funciona con:
 *  - DB local: DATABASE_URL="file:./database/newsletters.db"
 *  - Turso:    DATABASE_URL="libsql://<name>.turso.io" + DATABASE_AUTH_TOKEN
 */

const url = process.env.DATABASE_URL ?? "file:./database/newsletters.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };
