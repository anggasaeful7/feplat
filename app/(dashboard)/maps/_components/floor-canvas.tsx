"use client";

import { useRef, useState } from "react";
import type { CanvasPoint, Floor, FloorShape } from "@/types";
import {
  FACILITY_BY_CODE,
  boundingBox,
  legendKey,
  pointsToPath,
  rectPoints,
  scalePoints,
  shapeColor,
  shapeGroup,
  shapeLabel,
  resizeBox,
  snap,
  translatePoints,
  type Box,
} from "../_lib/canvas";

/** Ukuran koordinat internal SVG. Bentuk disimpan relatif 0–1, angka ini cuma
 *  memberi presisi yang enak dilihat di atribut SVG. */
const DEFAULT_VW = 1600;
const DEFAULT_VH = 1000;

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 8;

/** Kotak default saat sesuatu dijatuhkan dari palet, dalam satuan relatif. */
const DROP_W = 0.07;
const DROP_H = 0.07;

type View = { x: number; y: number; k: number };

type Drag =
  | { mode: "pan"; startX: number; startY: number; origin: View }
  | { mode: "draw"; from: CanvasPoint; to: CanvasPoint }
  | { mode: "move"; index: number; last: CanvasPoint }
  | {
      mode: "resize";
      index: number;
      corner: number;
      from: Box;
      /** Titik saat drag dimulai. Menskalakan dari titik yang sudah diskalakan
       *  gerakan sebelumnya membuat efeknya bertumpuk; acuannya harus tetap. */
      origin: CanvasPoint[];
    }
  | null;

type Props = {
  floor: Floor;
  shapes: FloorShape[];
  selectedIndex: number | null;
  manage: boolean;
  tool: "select" | "draw";
  snapping: boolean;
  /** Kunci legenda yang sedang diredupkan. Bentuknya tetap digambar — memutus
   *  konteks spasial lebih mahal daripada sedikit ramai. */
  dimmedKeys: Set<string>;
  onSelect: (index: number | null) => void;
  /** Dipanggil sekali di awal tiap interaksi yang mengubah bentuk. Riwayat
   *  undo didorong di sini, saat `shapes` masih berisi keadaan sebelum diubah —
   *  kalau didorong saat interaksi selesai, yang tersimpan justru hasil akhir
   *  dan undo tidak mengembalikan apa pun. */
  onBeginChange: () => void;
  onChange: (shapes: FloorShape[]) => void;
  onDrop: (payload: string, at: CanvasPoint) => void;
};

export function FloorCanvas({
  floor,
  shapes,
  selectedIndex,
  manage,
  tool,
  snapping,
  dimmedKeys,
  onSelect,
  onBeginChange,
  onChange,
  onDrop,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const [drag, setDrag] = useState<Drag>(null);

  const vw = floor.image_width > 0 ? floor.image_width : DEFAULT_VW;
  const vh = floor.image_height > 0 ? floor.image_height : DEFAULT_VH;

  /** Koordinat layar → koordinat relatif kanvas. Container-nya dikunci rasio
   *  aspek yang sama dengan viewBox, jadi tidak ada letterbox yang perlu
   *  dikompensasi di sini. */
  function toRelative(clientX: number, clientY: number): CanvasPoint {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * vw;
    const py = ((clientY - rect.top) / rect.height) * vh;
    return [(px - view.x) / view.k / vw, (py - view.y) / view.k / vh];
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * vw;
    const py = ((e.clientY - rect.top) / rect.height) * vh;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setView((v) => {
      const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.k * factor));
      // Titik di bawah kursor harus tetap di tempatnya setelah zoom.
      return { k, x: px - ((px - v.x) / v.k) * k, y: py - ((py - v.y) / v.k) * k };
    });
  }

  /** Pointer capture menjaga drag tetap hidup saat kursor keluar dari SVG.
   *  Dipanggil SETELAH state drag diset dan dibungkus try: kalau capture gagal
   *  (pointer sudah tidak aktif), drag-nya cuma kehilangan jangkauan — bukan
   *  mati diam-diam sebelum sempat dimulai. */
  function capture(e: React.PointerEvent) {
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // pointer sudah lepas; tidak ada yang bisa ditambal di sini
    }
  }

  function beginPan(e: React.PointerEvent) {
    setDrag({ mode: "pan", startX: e.clientX, startY: e.clientY, origin: view });
    capture(e);
  }

  function handleBackgroundDown(e: React.PointerEvent) {
    // Tombol tengah selalu menggeser, apa pun alatnya — kebiasaan yang sudah
    // ada di setiap editor kanvas.
    if (e.button === 1 || !manage || tool !== "draw") {
      onSelect(null);
      beginPan(e);
      return;
    }
    const at = toRelative(e.clientX, e.clientY);
    const p: CanvasPoint = [snap(at[0], snapping), snap(at[1], snapping)];
    setDrag({ mode: "draw", from: p, to: p });
    capture(e);
  }

  function handleShapeDown(e: React.PointerEvent, index: number) {
    e.stopPropagation();
    onSelect(index);
    if (!manage || tool !== "select") return;
    onBeginChange();
    setDrag({ mode: "move", index, last: toRelative(e.clientX, e.clientY) });
    capture(e);
  }

  function handleHandleDown(e: React.PointerEvent, index: number, corner: number) {
    e.stopPropagation();
    onBeginChange();
    setDrag({
      mode: "resize",
      index,
      corner,
      from: boundingBox(shapes[index].points),
      origin: shapes[index].points,
    });
    capture(e);
  }

  function handleMove(e: React.PointerEvent) {
    if (!drag) return;

    if (drag.mode === "pan") {
      const rect = svgRef.current!.getBoundingClientRect();
      const dx = ((e.clientX - drag.startX) / rect.width) * vw;
      const dy = ((e.clientY - drag.startY) / rect.height) * vh;
      setView({ ...drag.origin, x: drag.origin.x + dx, y: drag.origin.y + dy });
      return;
    }

    const at = toRelative(e.clientX, e.clientY);

    if (drag.mode === "draw") {
      setDrag({ ...drag, to: [snap(at[0], snapping), snap(at[1], snapping)] });
      return;
    }

    if (drag.mode === "move") {
      const dx = at[0] - drag.last[0];
      const dy = at[1] - drag.last[1];
      const next = shapes.slice();
      next[drag.index] = {
        ...next[drag.index],
        points: translatePoints(next[drag.index].points, dx, dy),
      };
      onChange(next);
      setDrag({ ...drag, last: at });
      return;
    }

    if (drag.mode === "resize") {
      const to = resizeBox(drag.from, drag.corner, [
        snap(at[0], snapping),
        snap(at[1], snapping),
      ]);
      const next = shapes.slice();
      next[drag.index] = {
        ...next[drag.index],
        // Acuannya titik saat tarikan dimulai, bukan titik hasil gerakan
        // sebelumnya — kalau tidak, penskalaannya bertumpuk tiap pointermove.
        points: scalePoints(drag.origin, drag.from, to),
      };
      onChange(next);
    }
  }

  function handleUp(e: React.PointerEvent) {
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // tidak pernah ter-capture; lanjut membereskan drag-nya
    }
    if (!drag) return;

    if (drag.mode === "draw") {
      const [x1, y1] = drag.from;
      const [x2, y2] = drag.to;
      // Klik tanpa tarikan bukan kotak; abaikan daripada membuat bentuk nol.
      if (Math.abs(x2 - x1) > 0.005 && Math.abs(y2 - y1) > 0.005) {
        const shape: FloorShape = {
          kind: "rect",
          points: rectPoints(drag.from, drag.to),
          label: "",
          sort_order: shapes.length,
        };
        onBeginChange();
        onChange([...shapes, shape]);
        onSelect(shapes.length);
      }
    }
    setDrag(null);
  }

  const previewRect =
    drag?.mode === "draw" ? rectPoints(drag.from, drag.to) : null;

  const cursor = drag?.mode === "pan"
    ? "grabbing"
    : manage && tool === "draw"
      ? "crosshair"
      : "grab";

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-border bg-surface"
      style={{ aspectRatio: `${vw} / ${vh}` }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const payload = e.dataTransfer.getData("text/plain");
        if (!payload) return;
        const at = toRelative(e.clientX, e.clientY);
        onDrop(payload, [
          snap(at[0] - DROP_W / 2, snapping),
          snap(at[1] - DROP_H / 2, snapping),
        ]);
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${vw} ${vh}`}
        className="h-full w-full touch-none select-none"
        style={{ cursor }}
        onWheel={handleWheel}
        onPointerDown={handleBackgroundDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      >
        <defs>
          <pattern
            id="canvas-grid"
            width={vw / 40}
            height={vh / 25}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${vw / 40} 0 L 0 0 0 ${vh / 25}`}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <rect width={vw} height={vh} fill="var(--background)" />
          {floor.image_url ? (
            // Gambar latar opsional: kanvas boleh digambar dari nol.
            <image
              href={floor.image_url}
              width={vw}
              height={vh}
              preserveAspectRatio="none"
            />
          ) : (
            <rect width={vw} height={vh} fill="url(#canvas-grid)" />
          )}

          {shapes.map((shape, index) => {
            const dimmed = dimmedKeys.has(legendKey(shape));
            const selected = index === selectedIndex;
            const color = shapeColor(shape);
            const resolvedColor = shape.color || color;
            const group = shapeGroup(shape);
            const box = boundingBox(shape.points);
            const label = shapeLabel(shape);
            const facility = shape.facility
              ? FACILITY_BY_CODE.get(shape.facility)
              : undefined;
            const decorativeIcon = shape.icon
              ? FACILITY_BY_CODE.get(shape.icon)
              : undefined;
            const iconSize = Math.min(box.w * vw, box.h * vh) * 0.45;

            return (
              <g
                key={shape.id ?? `new-${index}`}
                opacity={dimmed ? 0.15 : 1}
                onPointerDown={(e) => handleShapeDown(e, index)}
                style={{ cursor: manage ? "move" : "pointer" }}
              >
                <polygon
                  points={pointsToPath(shape.points, vw, vh)}
                  fill={color}
                  fillOpacity={group === "facility" ? 0.12 : 0.85}
                  stroke={selected ? "var(--foreground)" : color}
                  strokeWidth={(selected ? 3 : 1.5) / view.k}
                  strokeDasharray={group === "unassigned" ? `${6 / view.k}` : undefined}
                />

                {facility && iconSize > 6 && (
                  <g
                    transform={`translate(${(box.x + box.w / 2) * vw - iconSize / 2} ${
                      (box.y + box.h / 2) * vh - iconSize / 2
                    }) scale(${iconSize / 24})`}
                    fill="none"
                    stroke={resolvedColor}
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pointerEvents="none"
                    dangerouslySetInnerHTML={{ __html: facility.path }}
                  />
                )}

                {!facility && decorativeIcon && iconSize > 6 && (
                  <>
                    <g
                      transform={`translate(${(box.x + box.w / 2) * vw - (iconSize * 0.7) / 2} ${
                        (box.y + box.h * 0.32) * vh - (iconSize * 0.7) / 2
                      }) scale(${(iconSize * 0.7) / 24})`}
                      fill="none"
                      stroke={resolvedColor}
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pointerEvents="none"
                      dangerouslySetInnerHTML={{ __html: decorativeIcon.path }}
                    />
                    {label && (
                      <text
                        x={(box.x + box.w / 2) * vw}
                        y={(box.y + box.h * 0.72) * vh}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={shape.label_size || 13}
                        fontWeight={600}
                        fill={shape.color || "#fff"}
                        pointerEvents="none"
                      >
                        {label}
                      </text>
                    )}
                  </>
                )}

                {label && !facility && !(decorativeIcon && iconSize > 6) && (
                  <text
                    x={(box.x + box.w / 2) * vw}
                    y={(box.y + box.h / 2) * vh}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={shape.label_size || 13}
                    fontWeight={600}
                    fill={shape.color || "#fff"}
                    pointerEvents="none"
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}

          {previewRect && (
            <polygon
              points={pointsToPath(previewRect, vw, vh)}
              fill="var(--brand)"
              fillOpacity={0.25}
              stroke="var(--brand)"
              strokeWidth={2 / view.k}
            />
          )}

          {manage && selectedIndex !== null && shapes[selectedIndex] && (
            <ResizeHandles
              box={boundingBox(shapes[selectedIndex].points)}
              vw={vw}
              vh={vh}
              scale={view.k}
              onDown={(e, corner) => handleHandleDown(e, selectedIndex, corner)}
            />
          )}
        </g>
      </svg>
    </div>
  );
}

function ResizeHandles({
  box,
  vw,
  vh,
  scale,
  onDown,
}: {
  box: Box;
  vw: number;
  vh: number;
  scale: number;
  onDown: (e: React.PointerEvent, corner: number) => void;
}) {
  const corners: [number, number][] = [
    [box.x, box.y],
    [box.x + box.w, box.y],
    [box.x + box.w, box.y + box.h],
    [box.x, box.y + box.h],
  ];
  const r = 6 / scale;
  return (
    <>
      {corners.map(([x, y], i) => (
        <rect
          key={i}
          x={x * vw - r}
          y={y * vh - r}
          width={r * 2}
          height={r * 2}
          fill="var(--surface)"
          stroke="var(--foreground)"
          strokeWidth={1.5 / scale}
          style={{ cursor: i % 2 === 0 ? "nwse-resize" : "nesw-resize" }}
          onPointerDown={(e) => onDown(e, i)}
        />
      ))}
    </>
  );
}
