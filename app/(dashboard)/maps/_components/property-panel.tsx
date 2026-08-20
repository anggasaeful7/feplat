"use client";

import { useEffect, useRef } from "react";
import { PencilIcon, SearchIcon } from "@/app/_components/icons";
import type { OccupancyLevel, Property, PropertyType } from "@/types";
import {
  OCCUPANCY_LEVELS,
  OCCUPANCY_LEVEL_LABELS,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
} from "@/types";
import {
  OCCUPANCY_COLOR,
  formatRate,
  occupancyLevel,
  occupancyRate,
  vacantUnits,
} from "../_lib/occupancy";
import { PropertyTypeIcon } from "./property-type-icon";

type Props = {
  properties: Property[];
  visible: Property[];
  search: string;
  types: Set<PropertyType>;
  levels: Set<OccupancyLevel>;
  selectedId: string | null;
  hoveredId: string | null;
  /** Diisi saat sedang mengedit; menggantikan blok filter di kepala panel. */
  editor?: React.ReactNode;
  onSearchChange: (value: string) => void;
  onToggleType: (type: PropertyType) => void;
  onToggleLevel: (level: OccupancyLevel) => void;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onEdit: (id: string) => void;
};

function Chip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-brand bg-brand-soft text-brand"
          : "border-border bg-surface text-muted hover:text-foreground"
      }`}
    >
      {color && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: color }}
        />
      )}
      {children}
    </button>
  );
}

export function PropertyPanel({
  properties,
  visible,
  search,
  types,
  levels,
  selectedId,
  hoveredId,
  editor,
  onSearchChange,
  onToggleType,
  onToggleLevel,
  onSelect,
  onHover,
  onEdit,
}: Props) {
  const rowsRef = useRef(new Map<string, HTMLButtonElement>());

  // Klik balok di peta harus menyorot baris DAN membawanya ke layar; tanpa ini
  // panel diam-diam menyorot baris yang sedang tergulung di luar viewport.
  useEffect(() => {
    if (!selectedId) return;
    rowsRef.current.get(selectedId)?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedId]);

  const totalVacant = visible.reduce((sum, p) => sum + vacantUnits(p), 0);
  const unmapped = properties.filter((p) => p.latitude === null).length;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      {editor ?? (
        <div className="space-y-3 border-b border-border p-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nama atau alamat…"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PROPERTY_TYPES.map((type) => (
              <Chip
                key={type}
                active={types.has(type)}
                onClick={() => onToggleType(type)}
              >
                <PropertyTypeIcon type={type} className="h-3.5 w-3.5" />
                {PROPERTY_TYPE_LABELS[type]}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {OCCUPANCY_LEVELS.map((level) => (
              <Chip
                key={level}
                active={levels.has(level)}
                onClick={() => onToggleLevel(level)}
                color={OCCUPANCY_COLOR[level]}
              >
                {OCCUPANCY_LEVEL_LABELS[level]}
              </Chip>
            ))}
          </div>

          <p className="text-xs text-muted">
            {visible.length} dari {properties.length} titik ·{" "}
            <strong className="font-semibold text-foreground">
              {totalVacant}
            </strong>{" "}
            unit kosong
            {unmapped > 0 && ` · ${unmapped} belum dipetakan`}
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">
            Tidak ada titik yang cocok dengan filter ini.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((p) => {
              const level = occupancyLevel(p);
              const vacant = vacantUnits(p);
              const rate = occupancyRate(p);
              const active = p.subject_id === selectedId;
              const hovered = p.subject_id === hoveredId;
              const mapped = p.latitude !== null;

              return (
                <li
                  key={p.subject_id}
                  className={`flex items-stretch transition ${
                    active
                      ? "bg-brand-soft"
                      : hovered
                        ? "bg-surface-muted"
                        : "hover:bg-surface-muted"
                  }`}
                  onMouseEnter={() => onHover(p.subject_id)}
                  onMouseLeave={() => onHover(null)}
                >
                  <button
                    ref={(node) => {
                      if (node) rowsRef.current.set(p.subject_id, node);
                      else rowsRef.current.delete(p.subject_id);
                    }}
                    type="button"
                    onClick={() => onSelect(mapped ? p.subject_id : null)}
                    onFocus={() => onHover(p.subject_id)}
                    onBlur={() => onHover(null)}
                    aria-current={active ? "true" : undefined}
                    // Yang belum punya koordinat tidak bisa diterbangi; tombol
                    // Edit di sebelahnya yang jadi jalan masuknya.
                    disabled={!mapped}
                    className="flex min-w-0 flex-1 items-start gap-3 p-4 text-left disabled:cursor-default"
                  >
                    <span
                      className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white"
                      style={{
                        background: mapped
                          ? OCCUPANCY_COLOR[level]
                          : "var(--muted)",
                      }}
                    >
                      <PropertyTypeIcon type={p.type} className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-sm font-semibold">
                            {p.name}
                          </span>
                          {p.subject_type === "tenant" && (
                            <span
                              className="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-medium text-brand"
                              title={`Tenant dengan ${p.workspace_count} workspace`}
                            >
                              {p.workspace_count} ws
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {mapped ? vacant : "—"}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-baseline justify-between gap-2">
                        <span className="truncate text-xs text-muted">
                          {PROPERTY_TYPE_LABELS[p.type]} ·{" "}
                          {mapped
                            ? p.address || "Alamat belum diisi"
                            : "Lokasi belum dipetakan"}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted">
                          kosong
                        </span>
                      </span>
                      <span className="mt-2 flex items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: mapped ? `${Math.min(100, rate * 100)}%` : "0%",
                              background: OCCUPANCY_COLOR[level],
                            }}
                          />
                        </span>
                        <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted">
                          {mapped ? `${formatRate(rate)} terisi` : "—"}
                        </span>
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(p.subject_id)}
                    aria-label={`Ubah lokasi ${p.name}`}
                    title="Ubah lokasi"
                    className="shrink-0 border-l border-border px-3 text-muted transition hover:bg-surface-muted hover:text-brand"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
