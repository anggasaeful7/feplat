import type { CanvasPoint, FloorShape, UnitStatus } from "@/types";

/**
 * Warna kanvas. Satu-satunya sumber — legenda membaca konstanta yang sama
 * dengan yang dipakai menggambar, jadi tidak mungkin ada versi pastel yang
 * lebih lembut di legenda daripada di kanvas.
 *
 * Hanya STATUS UNIT yang berwarna. Fasilitas netral, kotak workspace memakai
 * warna brand — keduanya tidak pernah berubah, jadi tidak berhak atas warna
 * status.
 */
export const UNIT_STATUS_COLOR: Record<UnitStatus, string> = {
  occupied: "var(--unit-occupied)",
  available: "var(--unit-available)",
  activation: "var(--unit-activation)",
};

export const WORKSPACE_COLOR = "var(--brand)";
export const FACILITY_COLOR = "var(--muted)";

/** Ukuran grid snap, dalam satuan relatif kanvas. 0.005 = 0,5% sisi kanvas. */
export const GRID = 0.005;

export function snap(v: number, enabled: boolean) {
  const clamped = Math.min(1, Math.max(0, v));
  return enabled ? Math.round(clamped / GRID) * GRID : clamped;
}

/**
 * Katalog fasilitas. Daftarnya hidup di frontend, bukan sebagai CHECK di DB:
 * fasilitas tanpa ikon tidak berguna, jadi set ikon ini yang jadi gerbang
 * sebenarnya — dan menambah jenis baru tidak perlu migrasi.
 *
 * Ikon garis satu warna, selalu `currentColor`.
 */
export type FacilitySpec = { code: string; label: string; path: string };

export const FACILITIES: FacilitySpec[] = [
  {
    code: "retail",
    label: "Ritel",
    path: '<path d="M4 9h16l-1 11H5L4 9Z"/><path d="M4 9 6 4h12l2 5"/><path d="M9.5 13a2.5 2.5 0 0 0 5 0"/>',
  },
  {
    code: "umkm",
    label: "UMKM",
    path: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  },
  {
    code: "vending_atm",
    label: "Vending & ATM",
    path: '<rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M9 7h6M9 11h6"/><rect x="9" y="15" width="6" height="3" rx="0.5"/>',
  },
  {
    code: "escalator",
    label: "Eskalator",
    path: '<path d="M3 18h4l10-12h4"/><path d="M3 18v-3M21 6v3"/><circle cx="9" cy="13" r="1.4"/>',
  },
  {
    code: "lift",
    label: "Lift",
    path: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M12 3v18"/><path d="m8.5 9 1-1.5 1 1.5M13.5 15l1 1.5 1-1.5"/>',
  },
  {
    code: "stairs",
    label: "Tangga",
    path: '<path d="M4 20h4v-4h4v-4h4V8h4"/>',
  },
  {
    code: "gate",
    label: "Gate",
    path: '<path d="M4 21V6l8-3 8 3v15"/><path d="M4 21h16"/><path d="M10 21v-6h4v6"/>',
  },
  {
    code: "entrance_exit",
    label: "Entrance / Exit",
    path: '<path d="M3 12h13"/><path d="m12 8 4 4-4 4"/><path d="M18 4h3v16h-3"/>',
  },
  {
    code: "activation_area",
    label: "Area Aktivasi",
    path: '<path d="M4 20V9l8-5 8 5v11"/><path d="M4 20h16"/><path d="M9 20v-5h6v5"/><path d="M12 4V2"/>',
  },
  {
    code: "back_office",
    label: "Back Office",
    path: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
  },
  {
    code: "toilet",
    label: "Toilet",
    path: '<path d="M7 21v-6"/><circle cx="7" cy="5" r="1.8"/><path d="M5 15h4l-1-6H6l-2 6"/><path d="M17 21v-6"/><circle cx="17" cy="5" r="1.8"/><path d="m14.5 15 1.5-6h2l1.5 6h-5Z"/>',
  },
];

export const FACILITY_BY_CODE = new Map(FACILITIES.map((f) => [f.code, f]));

/** Palet warna pilihan untuk override warna icon & label sebuah bentuk.
 *  Dekoratif — kosong berarti pakai warna bawaan grup (status/brand/netral). */
export const SHAPE_COLOR_PALETTE: string[] = [
  "#ffffff", "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#a855f7", "#ec4899", "#64748b", "#0f172a",
];

// ─── Geometri ───────────────────────────────────────────────────────────────

export type Box = { x: number; y: number; w: number; h: number };

export function boundingBox(points: CanvasPoint[]): Box {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export function rectPoints(a: CanvasPoint, b: CanvasPoint): CanvasPoint[] {
  const [x1, y1] = a;
  const [x2, y2] = b;
  return [
    [Math.min(x1, x2), Math.min(y1, y2)],
    [Math.max(x1, x2), Math.min(y1, y2)],
    [Math.max(x1, x2), Math.max(y1, y2)],
    [Math.min(x1, x2), Math.max(y1, y2)],
  ];
}

export function translatePoints(
  points: CanvasPoint[],
  dx: number,
  dy: number,
): CanvasPoint[] {
  return points.map(([x, y]) => [
    Math.min(1, Math.max(0, x + dx)),
    Math.min(1, Math.max(0, y + dy)),
  ]);
}

/** Menskalakan seluruh titik terhadap bounding box lamanya. Untuk `rect` ini
 *  persis resize; untuk poligon, bentuknya ikut meregang proporsional. */
export function scalePoints(
  points: CanvasPoint[],
  from: Box,
  to: Box,
): CanvasPoint[] {
  // Kotak setipis nol tidak punya arah untuk diskalakan; kembalikan apa adanya
  // daripada menghasilkan NaN yang merusak seluruh denah.
  if (from.w === 0 || from.h === 0) return points;
  return points.map(([x, y]) => [
    Math.min(1, Math.max(0, to.x + ((x - from.x) / from.w) * to.w)),
    Math.min(1, Math.max(0, to.y + ((y - from.y) / from.h) * to.h)),
  ]);
}

/**
 * Kotak baru saat sebuah handle sudut ditarik ke `to`.
 *
 * Sudut yang berseberangan jadi jangkar dan tetap diam; urutan sudutnya sama
 * dengan urutan titik `rectPoints`: 0 kiri-atas, 1 kanan-atas, 2 kanan-bawah,
 * 3 kiri-bawah.
 *
 * `from` HARUS kotak saat tarikan dimulai, bukan kotak hasil gerakan sebelumnya
 * — memakai yang terakhir membuat penskalaannya bertumpuk tiap pointermove.
 */
export function resizeBox(from: Box, corner: number, to: CanvasPoint): Box {
  const anchorX = corner === 0 || corner === 3 ? from.x + from.w : from.x;
  const anchorY = corner === 0 || corner === 1 ? from.y + from.h : from.y;
  const [x, y] = to;
  return {
    x: Math.min(anchorX, x),
    y: Math.min(anchorY, y),
    // Tidak boleh menyusut sampai nol: bentuk tanpa luas tidak bisa diambil
    // lagi dengan kursor, dan tidak punya arah untuk diskalakan balik.
    w: Math.max(GRID, Math.abs(x - anchorX)),
    h: Math.max(GRID, Math.abs(y - anchorY)),
  };
}

export function pointsToPath(points: CanvasPoint[], vw: number, vh: number) {
  return points.map(([x, y]) => `${x * vw},${y * vh}`).join(" ");
}

// ─── Klasifikasi bentuk ─────────────────────────────────────────────────────

export type ShapeGroup = "workspace" | "facility" | "unit" | "unassigned";

export function shapeGroup(shape: FloorShape): ShapeGroup {
  if (shape.workspace_id) return "workspace";
  if (shape.facility) return "facility";
  if (shape.unit) return "unit";
  return "unassigned";
}

/** Kunci filter legenda. Fasilitas dipisah per jenis, unit per status —
 *  dua kelompok berbeda, tidak pernah dicampur jadi satu daftar datar. */
export function legendKey(shape: FloorShape): string {
  const group = shapeGroup(shape);
  if (group === "facility") return `facility:${shape.facility}`;
  if (group === "unit") return `status:${shape.unit!.status}`;
  return group;
}

export function shapeColor(shape: FloorShape): string {
  const group = shapeGroup(shape);
  if (group === "unit") return UNIT_STATUS_COLOR[shape.unit!.status];
  if (group === "workspace") return WORKSPACE_COLOR;
  if (group === "facility") return FACILITY_COLOR;
  return "var(--border)";
}

export function shapeLabel(shape: FloorShape): string {
  if (shape.label) return shape.label;
  if (shape.workspace_name) return shape.workspace_name;
  if (shape.unit) return shape.unit.code;
  if (shape.facility) return FACILITY_BY_CODE.get(shape.facility)?.label ?? "";
  return "";
}

/**
 * Membaca dimensi natural sebuah gambar. Dipakai hanya untuk rasio aspek kanvas
 * — koordinat bentuk tetap relatif 0–1 dan tidak peduli resolusi gambarnya.
 */
export function readImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca"));
    };
    img.src = url;
  });
}

/** Mengunggah gambar lewat proxy upload yang sudah ada, mengembalikan URL
 *  publik beserta dimensinya. */
export async function uploadFloorImage(file: File) {
  const size = await readImageSize(file);
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/uploads/images", { method: "POST", body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Unggah gagal");
  return {
    image_url: body.public_url as string,
    image_width: size.width,
    image_height: size.height,
  };
}
