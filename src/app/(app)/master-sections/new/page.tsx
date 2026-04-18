import { requireAdmin } from "@/lib/session";
import { ViewHeader } from "@/components/view-header";
import { MasterSectionForm } from "@/components/master-section-form";

export default async function NewMasterSectionPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <ViewHeader title="Nueva sección maestra" />
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs">
        <MasterSectionForm mode="create" />
      </div>
    </div>
  );
}
