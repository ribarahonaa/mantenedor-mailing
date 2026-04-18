import { Placeholder } from "@/components/placeholder";
import { ViewHeader } from "@/components/view-header";

export default function NewNewsletterPage() {
  return (
    <div className="space-y-8">
      <ViewHeader title="Crear newsletter" />
      <Placeholder
        title="Form de creación en Fase 4"
        description="Nombre + descripción, crea el newsletter en estado draft y te lleva al editor."
      />
    </div>
  );
}
