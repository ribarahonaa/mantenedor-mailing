/**
 * Compila el HTML completo de un newsletter a partir de su nombre y el
 * HTML de cada sección. Usado tanto en el editor como en la vista admin.
 */
export function buildFullHtml(name: string, sectionsHtml: string[]): string {
  const body = sectionsHtml.join("\n");
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(name)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;max-width:600px;">
<tr><td>
${body}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
