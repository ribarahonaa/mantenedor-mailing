import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../src/lib/db";

/**
 * Siembra los bloques maestros base del Mantenedor de Mailings.
 * Idempotente: salta los bloques que ya existan con el mismo (name, type).
 * HTML neutro — sin branding; el usuario personaliza desde la UI.
 *
 * Uso: npm run db:seed
 */

type SeedBlock = {
  name: string;
  type: string;
  title: string;
  html: string;
};

const LOGO_PLACEHOLDER = "https://placehold.co/200x60?text=Tu+Logo";
const YEAR = new Date().getFullYear();

const BLOCKS: SeedBlock[] = [
  {
    name: "Header con Logo",
    type: "header",
    title: "Header con Logo",
    html: `<div style="padding: 0; text-align: center;">
  <div style="text-align: center; padding: 20px 0;">
    <img src="${LOGO_PLACEHOLDER}" alt="Logo" style="width: auto; height: auto; display: block; margin: 0 auto; max-height: 80px;">
  </div>
</div>`,
  },
  {
    name: "Saludo Personalizado",
    type: "saludo",
    title: "Saludo Personalizado",
    html: `<div style="margin-bottom: 30px; padding: 0 20px;">
  <div style="background-color: #F6F6FE; padding: 20px; border-radius: 8px;">
    <h1 style="color: #4747F3; font-size: 22px; margin: 0 0 15px 0; border-bottom: 2px solid #E6E6FA; padding-bottom: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Título principal del saludo</h1>
    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Bajada introductoria del newsletter. Presenta el tema principal y engancha al lector:</p>
    <ul style="margin: 0; padding-left: 20px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <li style="margin-bottom: 8px;">Primer punto clave.</li>
      <li style="margin-bottom: 8px;">Segundo punto clave.</li>
      <li style="margin-bottom: 8px;">Tercer punto clave.</li>
    </ul>
  </div>
</div>`,
  },
  {
    name: "Destacado",
    type: "destacado",
    title: "Destacado",
    html: `<div style="margin-bottom: 30px; padding: 0 20px;">
  <h2 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">🔥 Destacado de la semana</h2>
  <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Novedad:</strong> Descripción breve del destacado principal que quieres comunicar en este envío.</p>
  <a href="#" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Descubrir más</a>
</div>`,
  },
  {
    name: "Artículos",
    type: "articulos",
    title: "Artículos",
    html: `<div style="margin-bottom: 30px; padding: 0 20px;">
  <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📚 Artículos recomendados</h2>
  <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>1. Título del primer artículo</strong><br>
  Resumen corto del primer artículo recomendado.</p>

  <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>2. Título del segundo artículo</strong><br>
  Resumen corto del segundo artículo recomendado.</p>

  <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>3. Título del tercer artículo</strong><br>
  Resumen corto del tercer artículo recomendado.</p>
</div>`,
  },
  {
    name: "Eventos",
    type: "eventos",
    title: "Eventos",
    html: `<div style="margin-bottom: 30px; padding: 0 20px;">
  <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📅 Próximos eventos</h2>
  <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Nombre del evento</strong><br>
  <em>Fecha:</em> DD de MM, AAAA<br>
  <em>Hora:</em> HH:MM - HH:MM<br>
  <em>Registro:</em> <a href="#" style="color: #20B2AA; text-decoration: none;">Inscríbete aquí</a></p>
</div>`,
  },
  {
    name: "Call to Action",
    type: "cta",
    title: "Call to Action",
    html: `<div style="margin-bottom: 30px; padding: 0 20px; text-align: center;">
  <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Título del llamado a la acción</h2>
  <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Texto motivador que invita al lector a hacer clic en el botón.</p>
  <a href="#" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Comenzar ahora</a>
</div>`,
  },
  {
    name: "Dos Columnas - Texto",
    type: "dos-columnas-texto",
    title: "Dos Columnas - Texto",
    html: `<div style="margin-bottom: 30px; padding: 0 20px;">
  <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Título general de la sección</h2>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
    <tr>
      <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
        <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Subtítulo columna izquierda</h3>
        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Párrafo de la columna izquierda.</p>
        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Segundo párrafo de la columna izquierda.</p>
      </td>
      <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
        <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Subtítulo columna derecha</h3>
        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Párrafo de la columna derecha.</p>
        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Segundo párrafo de la columna derecha.</p>
      </td>
    </tr>
  </table>
</div>`,
  },
  {
    name: "Dos Columnas - Foto Derecha",
    type: "dos-columnas-foto-derecha",
    title: "Dos Columnas - Foto Derecha",
    html: `<div style="margin-bottom: 30px; padding: 0 20px;">
  <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Título general de la sección</h2>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
    <tr>
      <td width="60%" style="width: 60%; padding: 0 15px 0 0; vertical-align: top;">
        <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Subtítulo</h3>
        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Descripción introductoria del contenido.</p>
        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Puntos destacados:</strong></p>
        <ul style="margin: 0; padding-left: 20px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <li>Primer punto.</li>
          <li>Segundo punto.</li>
          <li>Tercer punto.</li>
          <li>Cuarto punto.</li>
        </ul>
      </td>
      <td width="40%" style="width: 40%; padding: 0 0 0 15px; vertical-align: top;">
        <img src="https://placehold.co/400x300?text=Imagen" alt="Imagen" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      </td>
    </tr>
  </table>
</div>`,
  },
  {
    name: "Dos Columnas - Foto Izquierda",
    type: "dos-columnas-foto-izquierda",
    title: "Dos Columnas - Foto Izquierda",
    html: `<div style="margin-bottom: 30px; padding: 0 20px;">
  <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Título general de la sección</h2>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
    <tr>
      <td width="40%" style="width: 40%; padding: 0 15px 0 0; vertical-align: top;">
        <img src="https://placehold.co/400x300?text=Imagen" alt="Imagen" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      </td>
      <td width="60%" style="width: 60%; padding: 0 0 0 15px; vertical-align: top;">
        <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Subtítulo</h3>
        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Descripción introductoria del contenido.</p>
        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Puntos destacados:</strong></p>
        <ul style="margin: 0; padding-left: 20px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <li>Primer punto.</li>
          <li>Segundo punto.</li>
          <li>Tercer punto.</li>
          <li>Cuarto punto.</li>
        </ul>
      </td>
    </tr>
  </table>
</div>`,
  },
  {
    name: "Dos Columnas - Fotos",
    type: "dos-columnas-fotos",
    title: "Dos Columnas - Fotos",
    html: `<div style="margin-bottom: 30px; padding: 0 20px;">
  <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Título general de la sección</h2>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
    <tr>
      <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
        <img src="https://placehold.co/400x300?text=Imagen+1" alt="Imagen 1" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 10px;">
        <h3 style="color: #4A90E2; margin: 0 0 10px 0; font-size: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Título 1</h3>
        <p style="margin: 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Descripción corta de la primera imagen.</p>
      </td>
      <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
        <img src="https://placehold.co/400x300?text=Imagen+2" alt="Imagen 2" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 10px;">
        <h3 style="color: #4A90E2; margin: 0 0 10px 0; font-size: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Título 2</h3>
        <p style="margin: 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Descripción corta de la segunda imagen.</p>
      </td>
    </tr>
  </table>
</div>`,
  },
  {
    name: "Footer",
    type: "footer",
    title: "Footer",
    html: `<div style="background-color: #2c3e50; color: white; padding: 30px 20px; text-align: center;">
  <div style="margin-bottom: 20px;">
    <img src="${LOGO_PLACEHOLDER}" alt="Logo" style="width: auto; height: auto; max-height: 60px; margin-bottom: 15px;">
    <p style="margin: 0; font-size: 16px; color: #bdc3c7;">Tu tagline aquí</p>
  </div>
  <div style="margin-bottom: 20px;">
    <h3 style="color: #3498db; margin: 0 0 15px 0; font-size: 18px;">Síguenos</h3>
    <div style="display: flex; justify-content: center; gap: 20px;">
      <a href="#" style="color: #3498db; text-decoration: none; font-size: 20px;">📧</a>
      <a href="#" style="color: #3498db; text-decoration: none; font-size: 20px;">📱</a>
      <a href="#" style="color: #3498db; text-decoration: none; font-size: 20px;">💼</a>
      <a href="#" style="color: #3498db; text-decoration: none; font-size: 20px;">🌐</a>
    </div>
  </div>
  <div style="border-top: 1px solid #34495e; padding-top: 20px;">
    <p style="margin: 0; color: #bdc3c7; font-size: 14px;">© ${YEAR} Tu Empresa. Todos los derechos reservados.</p>
    <p style="margin: 5px 0 0 0; color: #bdc3c7; font-size: 12px;">Este email fue enviado a [email] | <a href="#" style="color: #3498db;">Darse de baja</a></p>
  </div>
</div>`,
  },
];

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const b of BLOCKS) {
    const existing = await db
      .select({ id: schema.masterSections.id })
      .from(schema.masterSections)
      .where(
        and(
          eq(schema.masterSections.name, b.name),
          eq(schema.masterSections.type, b.type)
        )
      )
      .get();

    if (existing) {
      console.log(`  = ${b.type} · ${b.name} (ya existe id=${existing.id})`);
      skipped++;
      continue;
    }

    await db.insert(schema.masterSections).values({
      name: b.name,
      type: b.type,
      title: b.title,
      content: { html: b.html },
      isActive: true,
    });
    console.log(`  + ${b.type} · ${b.name}`);
    inserted++;
  }

  console.log(`\n✓ seed completado — ${inserted} insertados, ${skipped} saltados`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗", err);
    process.exit(1);
  });
