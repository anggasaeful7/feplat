"use client";

import type { CanvasWorkspaceRef, FloorShape, UnitStatus } from "@/types";
import { UNIT_STATUSES, UNIT_STATUS_LABELS } from "@/types";
import { TrashIcon } from "@/app/_components/icons";
import {
  FACILITIES,
  FACILITY_BY_CODE,
  SHAPE_COLOR_PALETTE,
  UNIT_STATUS_COLOR,
  shapeGroup,
} from "../_lib/canvas";

type Props = {
  shape: FloorShape;
  workspaces: CanvasWorkspaceRef[];
  manage: boolean;
  onChange: (shape: FloorShape) => void;
  onDelete: () => void;
  onClose: () => void;
  onReorder: (direction: "front" | "back") => void;
};

const field =
  "w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-brand";

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function ShapeInspector({
  shape,
  workspaces,
  manage,
  onChange,
  onDelete,
  onClose,
  onReorder,
}: Props) {
  const group = shapeGroup(shape);
  const unit = shape.unit;

  function setUnit(patch: Partial<NonNullable<FloorShape["unit"]>>) {
    const base = unit ?? {
      code: "",
      area_sqm: 0,
      status: "available" as UnitStatus,
      price_monthly: 0,
      tenant_name: "",
    };
    onChange({ ...shape, unit: { ...base, ...patch }, facility: "", workspace_id: null });
  }

  return (
    <aside className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 lg:w-[19rem]">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {group === "workspace" && "Kotak workspace"}
          {group === "facility" && "Fasilitas"}
          {group === "unit" && "Unit"}
          {group === "unassigned" && "Bentuk kosong"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-0.5 text-xs text-muted transition hover:bg-surface-muted hover:text-foreground"
        >
          Tutup
        </button>
      </div>

      {group === "workspace" && (
        <Row label="Workspace" value={shape.workspace_name || "—"} />
      )}

      {group === "facility" && (
        <Row
          label="Jenis"
          value={FACILITY_BY_CODE.get(shape.facility!)?.label ?? shape.facility!}
        />
      )}

      {!manage && unit && (
        <div className="divide-y divide-border">
          <Row label="Kode unit" value={unit.code} />
          <Row label="Luas" value={`${unit.area_sqm} m²`} />
          <Row
            label="Status"
            value={UNIT_STATUS_LABELS[unit.status]}
          />
          <Row label="Harga / bulan" value={money.format(unit.price_monthly)} />
          <Row label="Penyewa" value={unit.tenant_name || "—"} />
          <Row label="Kontrak berakhir" value={unit.contract_ends_at || "—"} />
        </div>
      )}

      {manage && (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted">Label</span>
            <input
              className={field}
              value={shape.label}
              onChange={(e) => onChange({ ...shape, label: e.target.value })}
              placeholder="Nama di kanvas"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted">Ukuran teks</span>
            <input
              className={field}
              type="number"
              min={8}
              max={40}
              value={shape.label_size || 13}
              onChange={(e) =>
                onChange({ ...shape, label_size: Number(e.target.value) || 13 })
              }
            />
          </label>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted">Warna</span>
            <div className="grid grid-cols-6 gap-1.5">
              <button
                type="button"
                onClick={() => onChange({ ...shape, color: undefined })}
                className={`flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-muted text-xs text-muted ${
                  !shape.color ? "ring-2 ring-offset-1 ring-foreground" : ""
                }`}
                title="Default"
              >
                ×
              </button>
              {SHAPE_COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ ...shape, color: c })}
                  style={{ background: c }}
                  className={`h-6 w-6 rounded-full ${
                    shape.color === c ? "ring-2 ring-offset-1 ring-foreground" : ""
                  }`}
                  title={c}
                />
              ))}
            </div>
          </div>

          {group === "workspace" && (
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted">Ikon (opsional)</span>
              <select
                className={field}
                value={shape.icon ?? ""}
                onChange={(e) =>
                  onChange({ ...shape, icon: e.target.value || undefined })
                }
              >
                <option value="">— tanpa ikon —</option>
                {FACILITIES.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {group !== "workspace" && group !== "facility" && (
            <>
              <p className="text-[11px] text-muted">
                Bentuk kosong bisa dibiarkan dulu dan ditempel ke unit
                belakangan — gambar dulu semuanya, isi datanya kemudian.
              </p>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">Kode unit</span>
                <input
                  className={field}
                  value={unit?.code ?? ""}
                  onChange={(e) => setUnit({ code: e.target.value })}
                  placeholder="R-01"
                />
              </label>

              {unit && (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted">Status</span>
                    <div className="flex flex-wrap gap-1.5">
                      {UNIT_STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setUnit({ status: s })}
                          aria-pressed={unit.status === s}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                            unit.status === s
                              ? "border-foreground/30 font-medium"
                              : "border-border text-muted"
                          }`}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: UNIT_STATUS_COLOR[s] }}
                          />
                          {UNIT_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-muted">Luas (m²)</span>
                      <input
                        className={field}
                        inputMode="decimal"
                        value={unit.area_sqm}
                        onChange={(e) =>
                          setUnit({ area_sqm: Number(e.target.value) || 0 })
                        }
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-muted">Harga/bln</span>
                      <input
                        className={field}
                        inputMode="numeric"
                        value={unit.price_monthly}
                        onChange={(e) =>
                          setUnit({ price_monthly: Number(e.target.value) || 0 })
                        }
                      />
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted">Penyewa</span>
                    <input
                      className={field}
                      value={unit.tenant_name}
                      onChange={(e) => setUnit({ tenant_name: e.target.value })}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted">
                      Kontrak berakhir
                    </span>
                    <input
                      className={field}
                      type="date"
                      value={unit.contract_ends_at ?? ""}
                      onChange={(e) => setUnit({ contract_ends_at: e.target.value })}
                    />
                  </label>
                </>
              )}

              {workspaces.length > 0 && (
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted">
                    Atau tempel ke workspace
                  </span>
                  <select
                    className={field}
                    value={shape.workspace_id ?? ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      const ws = workspaces.find((w) => w.id === id);
                      onChange({
                        ...shape,
                        workspace_id: id || null,
                        workspace_name: ws?.name ?? "",
                        // Satu bentuk menunjuk paling banyak satu hal.
                        unit: id ? null : shape.unit,
                        facility: id ? "" : shape.facility,
                      });
                    }}
                  >
                    <option value="">— tidak ditempel —</option>
                    {workspaces.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onReorder("front")}
              className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-surface-muted"
            >
              Kirim ke depan
            </button>
            <button
              type="button"
              onClick={() => onReorder("back")}
              className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-surface-muted"
            >
              Kirim ke belakang
            </button>
          </div>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger-soft"
          >
            <TrashIcon className="h-4 w-4" />
            Hapus bentuk
          </button>
        </div>
      )}
    </aside>
  );
}
