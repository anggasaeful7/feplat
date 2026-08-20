/**
 * Model data MAPS.
 *
 * Dua lapis yang sengaja dipisah:
 *
 * 1. `Property` — cukup titik lokasi + tipe. Ini saja yang dibutuhkan peta
 *    workspace. Satu workspace = satu properti (lihat `workspace_id`).
 * 2. Lapisan denah (lihat types/floorplan.ts) — OPSIONAL. Punya-denah bukan
 *    pembeda tipe: kost bertingkat memakai jalur yang sama persis dengan
 *    outlet.
 */

/** Tipe fisik properti. Sengaja terpisah dari `TipeWorkspaceCode`, yang
 *  menggambarkan tipe langganan workspace, bukan bentuk asetnya. */
export type PropertyType = "kost" | "residence" | "outlet";

export const PROPERTY_TYPES: PropertyType[] = ["kost", "residence", "outlet"];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  kost: "Kost",
  residence: "Residence",
  outlet: "Outlet",
};

/** Tiga tingkat status okupansi. Hanya ini yang berhak atas warna. */
export type OccupancyLevel = "healthy" | "attention" | "critical";

export const OCCUPANCY_LEVELS: OccupancyLevel[] = [
  "healthy",
  "attention",
  "critical",
];

export const OCCUPANCY_LEVEL_LABELS: Record<OccupancyLevel, string> = {
  healthy: "Sehat",
  attention: "Perlu perhatian",
  critical: "Kritis",
};

/** Batas properti sebagai GeoJSON geometry, dikirim apa adanya dari kolom
 *  `properties.footprint`. Opsional — pin peta hanya butuh satu titik. */
export type PropertyFootprint = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

/** Yang dipetakan: tenant kalau workspace-nya bernaung di bawah tenant, kalau
 *  tidak ya workspace itu sendiri. Satu tenant tetap satu titik walaupun punya
 *  beberapa workspace. */
export type SubjectType = "tenant" | "workspace";

export const SUBJECT_LABELS: Record<SubjectType, string> = {
  tenant: "Tenant",
  workspace: "Workspace",
};

export type Property = {
  /** Null selama subjek ini belum pernah dipetakan — barisnya di tabel
   *  `properties` baru lahir saat lokasinya pertama kali disimpan. Karena itu
   *  kunci yang dipakai di seluruh UI adalah `subject_id`, bukan ini. */
  id: string | null;
  subject_type: SubjectType;
  subject_id: string;
  subject_name: string;
  /** Selalu 1 untuk subjek workspace; bisa lebih untuk tenant. */
  workspace_count: number;
  name: string;
  type: PropertyType;
  address: string;
  /** Null saat properti sudah dibuat tapi lokasinya belum dipetakan. Peta
   *  hanya menggambar yang sudah terisi. */
  latitude: number | null;
  longitude: number | null;
  footprint?: PropertyFootprint | null;
  /** Diturunkan dengan COUNT atas property_units di backend, bukan kolom
   *  simpanan — angka simpanan pasti melenceng dari status unit sebenarnya. */
  total_units: number;
  occupied_units: number;
};

export type UnitStatus = "available" | "occupied" | "activation";

export const UNIT_STATUSES: UnitStatus[] = [
  "available",
  "occupied",
  "activation",
];

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  available: "Tersedia",
  occupied: "Tersewa",
  activation: "Aktivasi",
};

export type Unit = {
  id: string;
  property_id: string;
  code: string;
  area_sqm: number;
  status: UnitStatus;
  price_monthly: number;
  tenant_name?: string | null;
  /** ISO date. Null kalau belum/tidak ada kontrak berjalan. */
  contract_ends_at?: string | null;
};

// Tipe denah (lantai, bentuk, fasilitas) pindah ke types/floorplan.ts saat
// kanvas dibangun — bentuknya berubah cukup jauh dari sketsa awal di sini.

export type PropertyListResponse = {
  items: Property[];
  total: number;
};

/** Payload PUT /properties/{workspace_id}/location. */
export type PropertyLocationPayload = {
  latitude: number;
  longitude: number;
  name?: string;
  type?: PropertyType;
  address?: string;
  footprint?: PropertyFootprint | null;
};
