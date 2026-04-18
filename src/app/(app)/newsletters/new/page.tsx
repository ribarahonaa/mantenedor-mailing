import { ViewHeader } from "@/components/view-header";
import { NewNewsletterForm } from "./form";

export default function NewNewsletterPage() {
  return (
    <div className="space-y-6">
      <ViewHeader title="Crear newsletter" />
      <div className="max-w-2xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-xs">
        <NewNewsletterForm />
      </div>
    </div>
  );
}
