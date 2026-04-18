import { requireAdmin } from "@/lib/session";
import { Placeholder } from "@/components/placeholder";
import { ViewHeader } from "@/components/view-header";

export default async function MasterSectionsPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <ViewHeader title="Secciones maestras" />
      <Placeholder
        title="CRUD de secciones maestras en Fase 5"
        description="Tarjetas de cada sección, editor HTML unificado (1 modal en vez de 2), soft-delete."
      />
    </div>
  );
}
