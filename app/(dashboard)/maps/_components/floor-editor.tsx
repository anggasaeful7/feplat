"use client";

import { useState } from "react";
import type {
  CanvasPoint,
  CanvasWorkspaceRef,
  Floor,
  FloorShape,
  SubjectType,
} from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { useSaveShapes } from "@/hooks/api/use-floorplan";
import { rectPoints } from "../_lib/canvas";
import { CanvasLegend } from "./canvas-legend";
import { FloorBackground } from "./floor-background";
import { FloorCanvas } from "./floor-canvas";
import { ShapeInspector } from "./shape-inspector";
import { ShapePalette, decodeDrag } from "./shape-palette";

/** Ukuran default sesuatu yang dijatuhkan dari palet, dalam satuan relatif. */
const DROP_W = 0.07;
const DROP_H = 0.07;
const MAX_HISTORY = 50;

type Props = {
  subjectType: SubjectType;
  subjectId: string;
  floor: Floor;
  /** Semua lantai, dipakai fitur salin. Lantai 2 dan 3 kost biasanya identik. */
  floors: Floor[];
  workspaces: CanvasWorkspaceRef[];
  manage: boolean;
};

/**
 * Seluruh keadaan menggambar hidup di sini, dan komponen ini di-`key` per
 * lantai oleh induknya. Itu yang menggantikan efek sinkronisasi draft: pindah
 * lantai me-remount, jadi tidak ada jalur yang bisa diam-diam menimpa gambar
 * yang belum tersimpan.
 */
export function FloorEditor({
  subjectType,
  subjectId,
  floor,
  floors,
  workspaces,
  manage,
}: Props) {
  const saveShapes = useSaveShapes(subjectType, subjectId);

  const [shapes, setShapes] = useState<FloorShape[]>(floor.shapes);
  const [history, setHistory] = useState<FloorShape[][]>([]);
  const [dirty, setDirty] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [tool, setTool] = useState<"select" | "draw">("select");
  const [snapping, setSnapping] = useState(true);
  const [dimmedKeys, setDimmedKeys] = useState<Set<string>>(new Set());

  /** Menandai awal sebuah perubahan: keadaan sekarang masuk riwayat, sebelum
   *  ada yang menyentuhnya. Dipisah dari `setShapes` karena satu tarikan mouse
   *  menghasilkan puluhan pembaruan tapi hanya boleh jadi satu langkah undo. */
  function beginChange() {
    setHistory((h) => [...h.slice(-MAX_HISTORY + 1), shapes]);
    setDirty(true);
  }

  function commit(next: FloorShape[]) {
    setShapes(next);
    setDirty(true);
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setShapes(h[h.length - 1]);
      setSelected(null);
      setDirty(true);
      return h.slice(0, -1);
    });
  }

  function handleDrop(payload: string, at: CanvasPoint) {
    const parsed = decodeDrag(payload);
    if (!parsed) return;

    const base: FloorShape = {
      kind: "rect",
      points: rectPoints(at, [at[0] + DROP_W, at[1] + DROP_H]),
      label: "",
      sort_order: shapes.length,
    };

    const next =
      parsed.kind === "facility"
        ? { ...base, facility: parsed.value }
        : (() => {
            const [id, name] = parsed.value.split("|");
            return { ...base, workspace_id: id, workspace_name: name };
          })();

    beginChange();
    commit([...shapes, next]);
    setSelected(shapes.length);
  }

  /**
   * Menyalin geometri dari lantai lain. Tautan unit dan workspace sengaja
   * DIBUANG: satu unit tidak boleh muncul di dua lantai sebagai unit yang sama,
   * dan lantai hasil salinan justru ingin diisi unit barunya sendiri. Yang
   * disalin bentuk, label, dan fasilitasnya — sisanya ditempel belakangan.
   */
  function copyFrom(sourceId: string) {
    const source = floors.find((f) => f.id === sourceId);
    if (!source) return;
    const copied: FloorShape[] = source.shapes.map((sh, i) => ({
      kind: sh.kind,
      points: sh.points,
      label: sh.label,
      facility: sh.facility,
      sort_order: shapes.length + i,
    }));
    beginChange();
    commit([...shapes, ...copied]);
  }

  /** Memindah bentuk terpilih ke ujung array (yang menentukan urutan gambar
   *  di SVG), lalu menomori ulang `sort_order` semua bentuk sesuai posisi
   *  barunya supaya urutannya tersimpan persis seperti yang terlihat. */
  function reorder(direction: "front" | "back") {
    if (selected === null) return;
    const arr = shapes.slice();
    const [moved] = arr.splice(selected, 1);
    if (direction === "front") arr.push(moved);
    else arr.unshift(moved);
    const next = arr.map((s, i) => ({ ...s, sort_order: i }));
    beginChange();
    commit(next);
    setSelected(direction === "front" ? shapes.length - 1 : 0);
  }

  function toggleLegend(key: string) {
    setDimmedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function save() {
    saveShapes.mutate(
      { floorId: floor.id, shapes },
      {
        onSuccess: (canvas) => {
          // Bentuk baru baru punya id setelah tersimpan; tanpa mengambil balik
          // hasilnya, simpan kedua akan menganggapnya baru lagi dan menggandakan.
          const saved = canvas?.floors.find((f) => f.id === floor.id);
          if (saved) setShapes(saved.shapes);
          setHistory([]);
          setDirty(false);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Kanvas diberi ruang paling besar: kalau legenda berakhir lebih
          menonjol daripada denahnya sendiri, proporsinya salah. */}
      <div className="min-w-0 flex-1 space-y-3">
        {manage && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-2">
            {(["select", "draw"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTool(t)}
                aria-pressed={tool === t}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tool === t
                    ? "bg-brand-soft text-brand"
                    : "text-muted hover:bg-surface-muted"
                }`}
              >
                {t === "select" ? "Pilih & geser" : "Gambar kotak"}
              </button>
            ))}
            <label className="flex items-center gap-1.5 px-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={snapping}
                onChange={(e) => setSnapping(e.target.checked)}
              />
              Snap grid
            </label>
            <FloorBackground
              subjectType={subjectType}
              subjectId={subjectId}
              floor={floor}
            />
            {floors.length > 1 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) copyFrom(e.target.value);
                  e.target.value = "";
                }}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-muted"
              >
                <option value="">Salin dari lantai…</option>
                {floors
                  .filter((f) => f.id !== floor.id)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            )}
            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0}
              className="rounded-lg px-3 py-1.5 text-xs text-muted transition hover:bg-surface-muted disabled:opacity-40"
            >
              Undo
            </button>
            <div className="ml-auto flex items-center gap-2">
              {dirty && <span className="text-xs text-warning">Belum disimpan</span>}
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saveShapes.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-1.5 text-xs font-medium text-white transition hover:bg-brand-strong disabled:opacity-50"
              >
                {saveShapes.isPending && <Spinner className="h-3 w-3" />}
                Simpan denah
              </button>
            </div>
          </div>
        )}

        <FloorCanvas
          floor={floor}
          shapes={shapes}
          selectedIndex={selected}
          manage={manage}
          tool={tool}
          snapping={snapping}
          dimmedKeys={dimmedKeys}
          onSelect={setSelected}
          onBeginChange={beginChange}
          onChange={commit}
          onDrop={handleDrop}
        />

        <p className="text-xs text-muted">
          Scroll untuk zoom, tarik area kosong untuk menggeser.
          {manage && " Tombol tengah selalu menggeser, apa pun alatnya."}
        </p>
      </div>

      <div className="w-full space-y-4 lg:w-[18rem] lg:shrink-0">
        {manage && <ShapePalette workspaces={workspaces} />}
        <CanvasLegend
          shapes={shapes}
          dimmedKeys={dimmedKeys}
          onToggle={toggleLegend}
        />
        {selected !== null && shapes[selected] && (
          <ShapeInspector
            shape={shapes[selected]}
            workspaces={workspaces}
            manage={manage}
            onChange={(next) => {
              const arr = shapes.slice();
              arr[selected] = next;
              beginChange();
              commit(arr);
            }}
            onDelete={() => {
              beginChange();
              commit(shapes.filter((_, i) => i !== selected));
              setSelected(null);
            }}
            onClose={() => setSelected(null)}
            onReorder={reorder}
          />
        )}
      </div>
    </div>
  );
}
