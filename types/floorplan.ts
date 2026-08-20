import type { Property, UnitStatus } from "./property";

/** Titik dalam koordinat relatif 0–1 terhadap kanvas, bukan piksel. Bentuknya
 *  array supaya identik dengan yang tersimpan di kolom jsonb. */
export type CanvasPoint = [number, number];

export type FloorUnit = {
  id?: string;
  code: string;
  area_sqm: number;
  status: UnitStatus;
  price_monthly: number;
  tenant_name: string;
  /** YYYY-MM-DD, string kosong berarti tidak ada kontrak berjalan. */
  contract_ends_at?: string;
};

/**
 * Sebuah bentuk menunjuk paling banyak satu hal:
 *   - `workspace_id` → kotak workspace di bawah tenant ini
 *   - `facility`     → eskalator, gate, ATM, … dari palet
 *   - `unit`         → kotak unit yang digambar sendiri
 * Ketiganya kosong berarti bentuk polos yang belum ditempel ke apa pun — sah,
 * dan itu yang membuat "gambar 20 kotak dulu, tempel belakangan" mungkin.
 */
export type FloorShape = {
  id?: string;
  kind: "rect" | "polygon";
  points: CanvasPoint[];
  label: string;
  sort_order: number;
  workspace_id?: string | null;
  workspace_name?: string;
  facility?: string;
  unit?: FloorUnit | null;
  /** Ikon dekoratif dari katalog FACILITIES, murni tampilan — tidak
   *  mengubah exclusivity workspace/facility/unit di atas. */
  icon?: string;
  /** Ukuran font label di kanvas. 0/undefined berarti default 13. */
  label_size?: number;
  /** Hex warna override buat icon + label, dekoratif. Kosong = warna
   *  bawaan grup (status/brand/netral). */
  color?: string;
};

export type Floor = {
  id: string;
  level: number;
  name: string;
  image_url: string;
  image_width: number;
  image_height: number;
  shapes: FloorShape[];
};

export type CanvasWorkspaceRef = {
  id: string;
  name: string;
  /** Sudah digambar di salah satu lantai. */
  placed: boolean;
};

export type CanvasResponse = {
  property: Property;
  workspaces: CanvasWorkspaceRef[];
  floors: Floor[];
};

export type FloorPayload = {
  /** 0 berarti "taruh setelah lantai terakhir". */
  level?: number;
  name?: string;
  image_url?: string;
  image_width?: number;
  image_height?: number;
};
