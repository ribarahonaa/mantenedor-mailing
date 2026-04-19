# Deploy (Fase 7 pendiente)

Guía paso a paso para desplegar el Mantenedor de Mailings en **Vercel** (frontend + API) + **Turso** (base de datos libSQL). Ambas tienen plan gratuito suficiente para este proyecto.

---

## 0. Prerrequisitos

- Cuenta de [GitHub](https://github.com) (push del repo).
- Cuenta de [Vercel](https://vercel.com/signup) (gratis, sign-up con GitHub es lo más rápido).
- Cuenta de [Turso](https://turso.tech) (gratis).
- Opcional: `sqlite3` CLI local para volcar la DB actual (`sudo apt install sqlite3` en WSL/Ubuntu).

---

## 1. Preparar el repo

Merge de la rama de rebuild a `main` y push a GitHub:

```bash
git checkout main
git merge feature/rebuild-nextjs
git push origin main
```

Si el repo aún no tiene remote en GitHub:

```bash
gh repo create mantenedor-mailing --source=. --private --push
```

o crear el repo manualmente en github.com y:

```bash
git remote add origin git@github.com:TU_USUARIO/mantenedor-mailing.git
git push -u origin main
```

---

## 2. Crear la DB en Turso

Instalar el CLI y autenticarse:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
# reiniciar terminal o: source ~/.bashrc
turso auth signup     # o: turso auth login
```

Crear la DB (elige una región cercana, p. ej. `sao` São Paulo o `gru` São Paulo GRU para LATAM):

```bash
turso db create mantenedor-mailing --location gru
```

Obtener URL y generar token de acceso:

```bash
turso db show mantenedor-mailing --url
# ejemplo: libsql://mantenedor-mailing-tuusuario.turso.io

turso db tokens create mantenedor-mailing
# copia el token largo que imprime
```

Guarda ambos valores — los necesitas en Vercel.

---

## 3. Migrar datos de la DB local a Turso

### Opción A — Con `sqlite3` CLI instalado (más simple)

```bash
# 1. Dump de la DB local a un archivo .sql
sqlite3 database/newsletters.db .dump > backup.sql

# 2. Importar a Turso
turso db shell mantenedor-mailing < backup.sql
```

Verificar:

```bash
turso db shell mantenedor-mailing "SELECT COUNT(*) FROM users;"
# Debería devolver 5
turso db shell mantenedor-mailing "SELECT COUNT(*) FROM master_sections;"
# Debería devolver 13
```

### Opción B — Sin `sqlite3` CLI (script Node)

Crear `scripts/migrate-to-turso.ts`:

```ts
import "dotenv/config";
import { createClient } from "@libsql/client";

const local = createClient({ url: "file:./database/newsletters.db" });
const remote = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  const tables = await local.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );

  for (const t of tables.rows) {
    const table = t.name as string;
    const schema = (await local.execute(
      `SELECT sql FROM sqlite_master WHERE name = '${table}'`
    )).rows[0].sql as string;

    await remote.execute(schema);

    const rows = await local.execute(`SELECT * FROM ${table}`);
    if (rows.rows.length === 0) continue;

    const cols = rows.columns;
    const placeholders = cols.map(() => "?").join(",");
    const stmt = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`;
    for (const row of rows.rows) {
      await remote.execute({
        sql: stmt,
        args: cols.map((c) => row[c]),
      });
    }
    console.log(`✓ ${table}: ${rows.rows.length} filas migradas`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Ejecutar:

```bash
TURSO_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx tsx scripts/migrate-to-turso.ts
```

---

## 4. Deploy en Vercel

### 4.1. Conectar el repo

1. Ir a [vercel.com/new](https://vercel.com/new).
2. Seleccionar el repo `mantenedor-mailing`.
3. **Framework Preset**: Next.js (detectado auto).
4. **Build & Output Settings**: dejar por defecto.
5. NO hacer click en Deploy todavía — antes configurar env vars.

### 4.2. Variables de entorno

En *"Environment Variables"* agregar las tres:

| Nombre | Valor | Observación |
|---|---|---|
| `DATABASE_URL` | `libsql://...turso.io` | de `turso db show` |
| `DATABASE_AUTH_TOKEN` | `eyJhb...` | de `turso db tokens create` |
| `SESSION_SECRET` | _(generar)_ | 32+ caracteres, ver abajo |
| `NEXT_PUBLIC_APP_URL` | `https://TU-PROYECTO.vercel.app` | después del primer deploy puedes ajustarla |

Generar `SESSION_SECRET`:

```bash
openssl rand -base64 48
# copiar el output completo
```

Aplicar las vars a los 3 environments: Production, Preview, Development.

### 4.3. Deploy

Click en **Deploy**. Vercel builda y publica en ~2 minutos. URL de ejemplo: `https://mantenedor-mailing-tu-usuario.vercel.app`.

### 4.4. Ajustar NEXT_PUBLIC_APP_URL

Tras el primer deploy, actualiza `NEXT_PUBLIC_APP_URL` en Vercel a la URL real que Vercel te dió. Esto afecta los links de reset de contraseña. Redeploy tras cambiarlo (Vercel lo hace automáticamente al cambiar env vars).

---

## 5. Bootstrap del admin en prod

Si importaste la DB vía dump (opción A o B de la sección 3), ya tienes un admin con el password hasheado que venía en tu DB local. Si ese password ya no lo recuerdas, o estás desplegando sin dump, **corre el script de bootstrap apuntando a Turso**:

```bash
DATABASE_URL="libsql://..." \
DATABASE_AUTH_TOKEN="..." \
  npm run db:create-admin
```

El script es idempotente:
- Si no existe el usuario `admin` → lo crea con role admin y password aleatoria segura (~24 caracteres, base64url).
- Si ya existe → le resetea el password, lo reactiva y se asegura de que sea admin.

La password se imprime UNA sola vez en stdout — cópiala y guárdala en tu password manager.

Para setear un password específico:

```bash
DATABASE_URL="..." DATABASE_AUTH_TOKEN="..." \
  npm run db:create-admin -- "MiPassSuperSeguro!"
```

También puedes sembrar los bloques maestros base con:

```bash
DATABASE_URL="..." DATABASE_AUTH_TOKEN="..." npm run db:seed
```

---

## 6. Verificación post-deploy

```bash
# 1. Home redirige a login
curl -sI https://tu-url.vercel.app/ | grep -i location

# 2. Login funciona (usa la password que imprimió db:create-admin)
curl -s -c /tmp/c.txt -X POST https://tu-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"TU_PASSWORD"}'
```

En navegador: abrir la URL, login con `admin` + tu password, verificar que ves el dashboard.

---

## 7. Pendientes conocidos

### 7.1. Email real para reset de contraseña

Hoy el flujo de reset devuelve el link en pantalla (pragmático para interno). Para prod pública conviene envío por email:

1. Crear cuenta en [Resend](https://resend.com) (free 100 emails/día) o SendGrid.
2. Agregar dep: `npm i resend`.
3. En `src/app/api/auth/forgot-password/route.ts`, después de insertar el token:
   ```ts
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   await resend.emails.send({
     from: 'noreply@tu-dominio.com',
     to: user.email,
     subject: 'Restablecer contraseña',
     html: `<p>Haz click para establecer nueva contraseña: <a href="${resetUrl}">${resetUrl}</a></p>`,
   });
   ```
4. En la respuesta, eliminar `resetUrl` del JSON y solo devolver `{ message }`.
5. Agregar `RESEND_API_KEY` en Vercel env vars.
6. Verificar un dominio en Resend para mejor deliverability (opcional para tests, obligatorio para prod).

### 7.2. Dominio custom

En Vercel → Settings → Domains → Add. Seguir las instrucciones DNS. El SSL es automático. Acordarse de actualizar `NEXT_PUBLIC_APP_URL` al dominio custom.

### 7.3. Observabilidad

Activar gratis en Vercel:
- **Analytics** (Vercel Analytics): 1 click en dashboard, agrega `@vercel/analytics` y un `<Analytics />` en el layout.
- **Logs**: ya viene con Vercel, runtime logs accesibles desde el dashboard.

### 7.4. Backups de la DB

Turso free tier no hace snapshots automáticos. Configurar un job manual (GitHub Actions + cron) que corra `turso db shell ... .dump > backup.sql` y suba a S3 / un repo privado / un gist. Mínimo semanal.

### 7.5. Borrar la DB local del repo (opcional)

El archivo `database/newsletters.db` está en `.gitignore`. Pero si alguna vez lo commiteaste por error, `git filter-branch` o BFG para limpiarlo del historial. Revisar antes de hacer el repo público.

---

## 8. Costos esperados (con free tiers)

| Servicio | Free tier | Suficiente para |
|---|---|---|
| Vercel Hobby | 100GB bandwidth/mes | ~300k visitas a app SSR típica |
| Turso | 9GB storage, 1B row reads/mes, 25M writes/mes | Decenas de miles de newsletters |
| Resend (si se agrega) | 3000 emails/mes (100/día) | Equipos pequeños |

Si se excede: Vercel Pro ($20/mes), Turso Scaler ($29/mes), Resend Pro ($20/mes).

---

## 9. Rollback

Si un deploy rompe algo:

- Vercel → Deployments → click en un deploy previo → "Promote to Production".
- DB Turso no se toca en rollback de app: los schemas son aditivos en este proyecto, una app anterior debería seguir leyendo datos nuevos sin problemas (Drizzle no exige columnas desconocidas).

Si hace falta rollback de schema: Turso no versiona migraciones automáticamente; mantener los `.sql` generados por `drizzle-kit generate` en git y aplicar el reverso manual.
