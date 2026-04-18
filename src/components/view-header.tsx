export function ViewHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="relative pl-4">
        <span
          className="absolute left-0 top-2 bottom-2 w-1 rounded"
          style={{
            background: "linear-gradient(180deg, #4f46e5 0%, #8b5cf6 100%)",
          }}
        />
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
