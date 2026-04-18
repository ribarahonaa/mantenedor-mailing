import { Hammer } from "lucide-react";

export function Placeholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-12 text-center">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Hammer className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}
