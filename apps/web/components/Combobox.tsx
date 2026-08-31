"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface ComboboxOption {
  readonly value: string;
  readonly label: string;
  /** Secondary text shown muted after the label (e.g. country). */
  readonly hint?: string;
}

interface ComboboxProps {
  /** Hidden field name so the value posts with a plain form. */
  readonly name: string;
  readonly options: readonly ComboboxOption[];
  readonly placeholder: string;
  readonly defaultValue?: string;
  readonly ariaLabel: string;
  /** Called when the selection changes (value = "" when cleared). */
  readonly onSelect?: (value: string) => void;
}

/**
 * Themed, accessible combobox with type-to-filter (ARIA 1.2 combobox + listbox).
 * Keyboard: ↓/↑ move, Enter select, Esc close; typing filters. Closes on
 * outside-click. Carries the selected value in a hidden input for form submits.
 */
export function Combobox({ name, options, placeholder, defaultValue = "", ariaLabel, onSelect }: ComboboxProps) {
  const initial = options.find((o) => o.value === defaultValue);
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState(initial?.label ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const selectedLabel = options.find((o) => o.value === value)?.label;
    // When the box still shows the current selection, list everything.
    if (!query || query === selectedLabel) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q));
  }, [options, query, value]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const commit = (option: ComboboxOption) => {
    setValue(option.value);
    setQuery(option.label);
    setOpen(false);
    onSelect?.(option.value);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[active]) {
        e.preventDefault();
        commit(filtered[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <input type="hidden" name={name} value={value} />
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
            if (e.target.value === "") {
              setValue("");
              onSelect?.("");
            }
          }}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.select();
          }}
          onKeyDown={onKeyDown}
          style={fieldInput}
        />
        <span aria-hidden style={{ transition: "transform .15s", transform: open ? "rotate(180deg)" : "none", color: "var(--wb-text-muted, #6b7280)" }}>
          ▾
        </span>
      </div>

      {open ? (
        <ul
          role="listbox"
          id={listId}
          aria-label={ariaLabel}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: -8,
            right: -8,
            zIndex: 30,
            listStyle: "none",
            margin: 0,
            padding: "0.35rem",
            maxHeight: 280,
            overflowY: "auto",
            background: "var(--wb-surface)",
            border: "1px solid var(--wb-border)",
            borderRadius: 16,
            boxShadow: "0 20px 48px -20px rgba(15,26,30,.45)",
          }}
        >
          {filtered.length === 0 ? (
            <li style={{ padding: "0.6rem 0.75rem", color: "var(--wb-text-muted, #6b7280)" }}>No matches</li>
          ) : (
            filtered.map((o, i) => {
              const selected = o.value === value;
              const isActive = i === active;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault(); // keep focus; select before blur
                    commit(o);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    padding: "0.55rem 0.75rem",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: isActive ? "var(--wb-blue)" : "transparent",
                    color: isActive ? "#fff" : "var(--wb-text)",
                  }}
                >
                  <span>
                    {o.label}
                    {o.hint ? <span style={{ opacity: isActive ? 0.85 : 0.6 }}>, {o.hint}</span> : null}
                  </span>
                  {selected ? <span aria-hidden style={{ color: isActive ? "#fff" : "var(--wb-gold)" }}>✓</span> : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

const fieldInput: React.CSSProperties = {
  border: "none",
  background: "transparent",
  font: "inherit",
  color: "var(--wb-text)",
  width: "100%",
  padding: "0.15rem 0",
  outline: "none",
};
