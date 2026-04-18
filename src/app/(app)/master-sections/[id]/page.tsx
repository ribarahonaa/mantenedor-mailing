import { notFound } from "next/navigation";
import { getMasterSection } from "@/lib/actions/master-sections";
import { ViewHeader } from "@/components/view-header";
import { MasterSectionForm } from "@/components/master-section-form";

export default async function EditMasterSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = await getMasterSection(Number(id));
  if (!section || !section.isActive) notFound();

  const html =
    typeof section.content === "object" && section.content
      ? ((section.content as { html?: string }).html ?? "")
      : "";

  return (
    <div className="space-y-6">
      <ViewHeader title={`Editar: ${section.name}`} />
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs">
        <MasterSectionForm
          mode="edit"
          id={section.id}
          initial={{
            name: section.name,
            type: section.type,
            title: section.title,
            html,
          }}
        />
      </div>
    </div>
  );
}
