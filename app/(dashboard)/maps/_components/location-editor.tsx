"use client";

import { useEffect, useRef, useState } from "react";
import type { Property, PropertyType } from "@/types";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS, SUBJECT_LABELS } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { useSetPropertyLocation } from "@/hooks/api/use-property";
import { PropertyTypeIcon } from "./property-type-icon";

type Draft = { latitude: number; longitude: number };

type Props = {
  property: Property;
  draft: Draft | null;
  onDraftChange: (draft: Draft) => void;
  onClose: () => void;
};

const fieldClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm tabular-nums outline-none transition focus:border-brand";

/** Angka di luar rentang ini bukan koordinat, apa pun yang diketik. */
function clampLat(v: number) {
  return Math.min(90, Math.max(-90, v));
}
function clampLng(v: number) {
  return Math.min(180, Math.max(-180, v));
}

export function LocationEditor({
  property,
  draft,
  onDraftChange,
  onClose,
}: Props) {
  const save = useSetPropertyLocation();
  const [type, setType] = useState<PropertyType>(property.type);
  const [address, setAddress] = useState(property.address);

  // Teks field adalah sumber kebenaran selama diketik — angka setengah jadi
  // ("-6.", "10") tidak boleh diformat ulang di tengah ketikan.
  const [latText, setLatText] = useState(
    draft ? String(draft.latitude) : (property.latitude?.toString() ?? ""),
  );
  const [lngText, setLngText] = useState(
    draft ? String(draft.longitude) : (property.longitude?.toString() ?? ""),
  );

  // Draft terakhir yang kita kirim sendiri. Tanpa penanda ini, tiap ketikan
  // memantul balik sebagai teks terformat dan menimpa sisa angka yang belum
  // selesai diketik — "106.8230" berakhir jadi "1.000002".
  const emittedRef = useRef<Draft | null>(null);

  useEffect(() => {
    if (!draft) return;
    const mine = emittedRef.current;
    if (
      mine &&
      mine.latitude === draft.latitude &&
      mine.longitude === draft.longitude
    ) {
      return;
    }
    // Sampai sini berarti drafnya datang dari peta (klik atau geser pin).
    setLatText(draft.latitude.toFixed(6));
    setLngText(draft.longitude.toFixed(6));
  }, [draft]);

  function commitText(nextLat: string, nextLng: string) {
    const lat = Number.parseFloat(nextLat);
    const lng = Number.parseFloat(nextLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const next = { latitude: clampLat(lat), longitude: clampLng(lng) };
    emittedRef.current = next;
    onDraftChange(next);
  }

  const canSave = draft !== null && !save.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    save.mutate(
      {
        subjectType: property.subject_type,
        subjectId: property.subject_id,
        latitude: draft.latitude,
        longitude: draft.longitude,
        type,
        address: address.trim(),
      },
      { onSuccess: onClose },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-b border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{property.name}</h2>
          <p className="truncate text-xs text-muted">
            {property.subject_type === "tenant"
              ? `${SUBJECT_LABELS.tenant} · ${property.workspace_count} workspace`
              : SUBJECT_LABELS.workspace}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-surface-muted hover:text-foreground"
        >
          Batal
        </button>
      </div>

      <p className="rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand">
        Klik di peta untuk menaruh titik, atau geser pin yang muncul. Bisa juga
        tempel koordinat di bawah.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted">Latitude</span>
          <input
            className={fieldClass}
            inputMode="decimal"
            value={latText}
            onChange={(e) => {
              setLatText(e.target.value);
              commitText(e.target.value, lngText);
            }}
            placeholder="-6.195400"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted">Longitude</span>
          <input
            className={fieldClass}
            inputMode="decimal"
            value={lngText}
            onChange={(e) => {
              setLngText(e.target.value);
              commitText(latText, e.target.value);
            }}
            placeholder="106.831800"
          />
        </label>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-medium text-muted">Tipe properti</span>
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                type === t
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              <PropertyTypeIcon type={t} className="h-3.5 w-3.5" />
              {PROPERTY_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted">Alamat</span>
        <input
          className={fieldClass}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Jl. …"
        />
      </label>

      <button
        type="submit"
        disabled={!canSave}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        {save.isPending && <Spinner className="h-4 w-4" />}
        {draft ? "Simpan lokasi" : "Tentukan titik dulu"}
      </button>
    </form>
  );
}
