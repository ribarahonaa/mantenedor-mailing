"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

type Props = {
  name: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  placeholder?: string;
  className?: string;
};

export function DateInput({
  name,
  value,
  onChange,
  min,
  max,
  placeholder = "Seleccionar",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = parseYmd(value);
  const minDate = parseYmd(min);
  const maxDate = parseYmd(max);
  const display = selected ? format(selected, "d MMM yyyy", { locale: es }) : "";

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Hidden input para que el form GET envíe el valor */}
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group inline-flex w-full items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-left text-sm transition hover:border-[var(--color-border-strong)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-ring)]"
      >
        <Calendar className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-subtle)]" />
        <span
          className={cn(
            "flex-1 truncate",
            display ? "text-[var(--color-text)]" : "text-[var(--color-text-subtle)]"
          )}
        >
          {display || placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
                onChange("");
              }
            }}
            className="inline-flex h-4 w-4 items-center justify-center rounded text-[var(--color-text-subtle)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
            aria-label="Limpiar"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg">
          <DayPicker
            mode="single"
            locale={es}
            selected={selected}
            defaultMonth={selected ?? minDate ?? undefined}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            onSelect={(d) => {
              onChange(formatYmd(d));
              setOpen(false);
            }}
            className="rdp-themed"
          />
        </div>
      )}
    </div>
  );
}

function parseYmd(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function formatYmd(d: Date | undefined): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
