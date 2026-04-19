"use client";

import Select, { type StylesConfig } from "react-select";

export type UserOption = {
  value: string; // username
  label: string;
  email: string;
};

const styles: StylesConfig<UserOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 34,
    borderRadius: 6,
    borderColor: state.isFocused ? "var(--color-accent)" : "var(--color-border)",
    boxShadow: state.isFocused ? "0 0 0 3px var(--color-accent-ring)" : "none",
    backgroundColor: "var(--color-surface)",
    fontSize: 14,
    "&:hover": {
      borderColor: state.isFocused ? "var(--color-accent)" : "var(--color-border-strong)",
    },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 10px" }),
  input: (base) => ({ ...base, margin: 0, padding: 0, color: "var(--color-text)" }),
  placeholder: (base) => ({ ...base, color: "var(--color-text-subtle)" }),
  singleValue: (base) => ({ ...base, color: "var(--color-text)" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 4,
    color: "var(--color-text-subtle)",
    "&:hover": { color: "var(--color-text)" },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 4,
    color: "var(--color-text-subtle)",
    "&:hover": { color: "var(--color-danger)" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    backgroundColor: "var(--color-surface)",
    overflow: "hidden",
    zIndex: 40,
  }),
  option: (base, state) => ({
    ...base,
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "var(--color-accent-soft)"
      : state.isFocused
        ? "var(--color-surface-3)"
        : "var(--color-surface)",
    color: state.isSelected ? "var(--color-accent)" : "var(--color-text)",
    "&:active": { backgroundColor: "var(--color-accent-soft)" },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--color-text-subtle)",
    fontSize: 13,
  }),
};

export function UserSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Todos",
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: UserOption[];
  placeholder?: string;
}) {
  const current = options.find((o) => o.value === value) ?? null;

  return (
    <Select<UserOption, false>
      name={name}
      value={current}
      onChange={(opt) => onChange(opt?.value ?? "")}
      options={options}
      placeholder={placeholder}
      isClearable
      noOptionsMessage={() => "Sin resultados"}
      styles={styles}
      formatOptionLabel={(u) => (
        <div className="flex flex-col">
          <span className="font-medium">{u.label}</span>
          <span className="text-xs text-[var(--color-text-subtle)]">{u.email}</span>
        </div>
      )}
      instanceId={`user-select-${name}`}
    />
  );
}
