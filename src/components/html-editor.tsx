"use client";

import { useState } from "react";
import { Code, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "code" | "preview";

export function HtmlEditor({
  name,
  defaultValue = "",
  onChange,
}: {
  name?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("code");
  const [html, setHtml] = useState(defaultValue);

  function update(value: string) {
    setHtml(value);
    onChange?.(value);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] focus-within:border-[var(--color-accent)] focus-within:ring-3 focus-within:ring-[var(--color-accent-ring)] transition">
      <div className="flex items-center justify-between bg-[#1e293b] px-3 py-2">
        <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          HTML
        </span>
        <div className="inline-flex gap-1 rounded-md bg-slate-800 p-0.5">
          <ToolbarBtn active={mode === "code"} onClick={() => setMode("code")} icon={Code} label="Código" />
          <ToolbarBtn active={mode === "preview"} onClick={() => setMode("preview")} icon={Eye} label="Preview" />
        </div>
      </div>

      {mode === "code" ? (
        <textarea
          name={name}
          value={html}
          onChange={(e) => update(e.target.value)}
          spellCheck={false}
          className="block w-full resize-y bg-[#0f172a] p-4 font-mono text-sm text-slate-200 focus:outline-none"
          style={{ minHeight: 360, tabSize: 2 }}
        />
      ) : (
        <>
          <div
            className="min-h-[360px] bg-white p-4 text-black"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {name && <input type="hidden" name={name} value={html} />}
        </>
      )}
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition",
        active
          ? "bg-[var(--color-accent)] text-white"
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
