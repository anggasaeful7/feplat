import { api } from "@/lib/axios";
import type {
  CanvasResponse,
  Floor,
  FloorPayload,
  FloorShape,
  SubjectType,
} from "@/types";

function base(type: SubjectType, id: string) {
  return `/properties/${encodeURIComponent(type)}/${encodeURIComponent(id)}`;
}

export const FloorplanService = {
  getCanvas: async (type: SubjectType, id: string) =>
    api<CanvasResponse>(`${base(type, id)}/canvas`),

  createFloor: async (type: SubjectType, id: string, payload: FloorPayload) =>
    api<Floor>(`${base(type, id)}/floors`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateFloor: async (
    type: SubjectType,
    id: string,
    floorId: string,
    payload: FloorPayload,
  ) =>
    api<void>(`${base(type, id)}/floors/${encodeURIComponent(floorId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteFloor: async (type: SubjectType, id: string, floorId: string) =>
    api<void>(`${base(type, id)}/floors/${encodeURIComponent(floorId)}`, {
      method: "DELETE",
    }),

  /** Mengganti seluruh isi satu lantai sekaligus: kanvas memang memegang
   *  himpunan lengkapnya, jadi menyimpan per-bentuk cuma menambah jalur
   *  sinkronisasi yang bisa gagal separuh jalan. */
  replaceShapes: async (
    type: SubjectType,
    id: string,
    floorId: string,
    shapes: FloorShape[],
  ) =>
    api<CanvasResponse>(
      `${base(type, id)}/floors/${encodeURIComponent(floorId)}/shapes`,
      { method: "PUT", body: JSON.stringify({ shapes }) },
    ),
};
