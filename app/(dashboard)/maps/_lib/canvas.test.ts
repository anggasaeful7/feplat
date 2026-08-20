// Jalankan: node --test "app/(dashboard)/maps/_lib/canvas.test.ts"
import assert from "node:assert/strict";
import { test } from "node:test";
import type { CanvasPoint } from "../../../../types/floorplan.ts";
import {
  GRID,
  boundingBox,
  legendKey,
  rectPoints,
  resizeBox,
  scalePoints,
  snap,
  translatePoints,
} from "./canvas.ts";

test("rectPoints menormalkan arah tarikan", () => {
  const dragged = rectPoints([0.4, 0.6], [0.1, 0.2]); // ditarik ke kiri-atas
  assert.deepEqual(dragged, [
    [0.1, 0.2],
    [0.4, 0.2],
    [0.4, 0.6],
    [0.1, 0.6],
  ]);
});

test("snap menempel ke grid dan tetap di dalam kanvas", () => {
  assert.equal(snap(0.1234, true), 0.125);
  assert.equal(snap(0.1234, false), 0.1234);
  assert.equal(snap(-3, false), 0);
  assert.equal(snap(9, true), 1);
});

test("translatePoints tidak mendorong bentuk keluar kanvas", () => {
  const pts: CanvasPoint[] = [
    [0.9, 0.9],
    [1, 0.9],
    [1, 1],
  ];
  assert.deepEqual(translatePoints(pts, 0.5, 0.5), [
    [1, 1],
    [1, 1],
    [1, 1],
  ]);
});

test("scalePoints memakai bounding box lama sebagai acuan", () => {
  const pts: CanvasPoint[] = [
    [0.2, 0.2],
    [0.4, 0.2],
    [0.4, 0.4],
    [0.2, 0.4],
  ];
  const from = boundingBox(pts);
  const scaled = scalePoints(pts, from, { x: 0, y: 0, w: 0.4, h: 0.4 });
  assert.deepEqual(scaled, [
    [0, 0],
    [0.4, 0],
    [0.4, 0.4],
    [0, 0.4],
  ]);
});

test("bentuk setipis nol tidak menghasilkan NaN", () => {
  const flat: CanvasPoint[] = [
    [0.3, 0.3],
    [0.3, 0.3],
    [0.3, 0.3],
  ];
  const from = boundingBox(flat);
  assert.deepEqual(scalePoints(flat, from, { x: 0, y: 0, w: 0.5, h: 0.5 }), flat);
});

test("legenda memisahkan fasilitas dari status unit", () => {
  const base = { kind: "rect" as const, points: [], label: "", sort_order: 0 };
  assert.equal(legendKey({ ...base, facility: "escalator" }), "facility:escalator");
  assert.equal(
    legendKey({
      ...base,
      unit: {
        code: "A1",
        status: "occupied",
        area_sqm: 0,
        price_monthly: 0,
        tenant_name: "",
      },
    }),
    "status:occupied",
  );
  assert.equal(legendKey({ ...base, workspace_id: "w1" }), "workspace");
  assert.equal(legendKey(base), "unassigned");
});

/** Koordinat kanvas hasil aritmetika float; 0.6 - 0.1 bukan tepat 0.5. */
function near(actual: number, expected: number, what: string) {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${what}: ${actual} \u2260 ${expected}`,
  );
}

test("resizeBox menahan sudut yang berseberangan", () => {
  const from = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 }; // 0.2..0.6

  // tarik sudut kiri-atas (0): kanan-bawah (0.6, 0.6) harus diam
  const topLeft = resizeBox(from, 0, [0.1, 0.1]);
  near(topLeft.x, 0.1, "x");
  near(topLeft.y, 0.1, "y");
  near(topLeft.x + topLeft.w, 0.6, "tepi kanan tetap");
  near(topLeft.y + topLeft.h, 0.6, "tepi bawah tetap");

  // tarik sudut kanan-bawah (2): kiri-atas (0.2, 0.2) harus diam
  const bottomRight = resizeBox(from, 2, [0.9, 0.7]);
  near(bottomRight.x, 0.2, "x");
  near(bottomRight.y, 0.2, "y");
  near(bottomRight.x + bottomRight.w, 0.9, "tepi kanan ikut kursor");
  near(bottomRight.y + bottomRight.h, 0.7, "tepi bawah ikut kursor");

  // tarik sudut kanan-atas (1): kiri-bawah (0.2, 0.6) harus diam
  const topRight = resizeBox(from, 1, [0.8, 0.3]);
  near(topRight.x, 0.2, "x");
  near(topRight.y, 0.3, "y");
  near(topRight.y + topRight.h, 0.6, "tepi bawah tetap");
});

test("resizeBox tidak membiarkan kotak menyusut sampai nol", () => {
  const from = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 };
  // ditarik tepat ke sudut jangkarnya sendiri
  const collapsed = resizeBox(from, 0, [0.6, 0.6]);
  assert.equal(collapsed.w, GRID);
  assert.equal(collapsed.h, GRID);
});

test("resize berulang tidak bertumpuk selama acuannya titik awal", () => {
  const start: CanvasPoint[] = [
    [0.2, 0.2],
    [0.6, 0.2],
    [0.6, 0.6],
    [0.2, 0.6],
  ];
  const from = boundingBox(start);

  // Dua gerakan berturut-turut ke titik yang sama harus menghasilkan bentuk
  // yang sama — inilah yang dulu gagal, karena gerakan kedua menskalakan hasil
  // gerakan pertama alih-alih titik awalnya.
  const once = scalePoints(start, from, resizeBox(from, 2, [0.8, 0.8]));
  const twice = scalePoints(start, from, resizeBox(from, 2, [0.8, 0.8]));
  assert.deepEqual(once, twice);
  near(once[2][0], 0.8, "sudut yang ditarik mendarat di kursor");
  near(once[2][1], 0.8, "sudut yang ditarik mendarat di kursor");

  // Sedangkan cara lama — memakai hasil sebelumnya sebagai acuan — melenceng.
  const compounded = scalePoints(once, from, resizeBox(from, 2, [0.8, 0.8]));
  assert.notDeepEqual(compounded, once);
});
