import type { OccupancyLevel, Property } from "@/types";

/**
 * Ambang okupansi, berbasis rasio terisi — bukan jumlah kosong absolut, supaya
 * properti 8 unit dan 200 unit dinilai dengan ukuran yang sama.
 *
 *   ≥ 85%        sehat
 *   60% – 84%    perlu perhatian
 *   < 60%        kritis
 */
export const OCCUPANCY_THRESHOLDS = {
  healthy: 0.85,
  attention: 0.6,
} as const;

/** Satu-satunya sumber warna status. Peta, daftar, dan legenda semuanya baca
 *  dari sini supaya warnanya persis sama, bukan versi pastel yang lebih lembut. */
export const OCCUPANCY_COLOR: Record<OccupancyLevel, string> = {
  healthy: "var(--success)",
  attention: "var(--warning)",
  critical: "var(--danger)",
};

export const OCCUPANCY_COLOR_SOFT: Record<OccupancyLevel, string> = {
  healthy: "var(--success-soft)",
  attention: "var(--warning-soft)",
  critical: "var(--danger-soft)",
};

export function vacantUnits(p: Pick<Property, "total_units" | "occupied_units">) {
  return Math.max(0, p.total_units - p.occupied_units);
}

export function occupancyRate(
  p: Pick<Property, "total_units" | "occupied_units">,
) {
  // Properti tanpa unit tidak punya apa-apa untuk diurus, jadi dihitung penuh
  // — bukan 0, yang akan membuatnya menyala merah tanpa alasan.
  if (p.total_units <= 0) return 1;
  return p.occupied_units / p.total_units;
}

export function occupancyLevel(
  p: Pick<Property, "total_units" | "occupied_units">,
): OccupancyLevel {
  const rate = occupancyRate(p);
  if (rate >= OCCUPANCY_THRESHOLDS.healthy) return "healthy";
  if (rate >= OCCUPANCY_THRESHOLDS.attention) return "attention";
  return "critical";
}

export function formatRate(rate: number) {
  return `${Math.round(rate * 100)}%`;
}
