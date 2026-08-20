// Jalankan: node --test "app/(dashboard)/maps/_lib/occupancy.test.ts"
// Tanpa runner tambahan — Node 24 menjalankan TypeScript langsung.
import assert from "node:assert/strict";
import { test } from "node:test";
import { occupancyLevel, occupancyRate, vacantUnits } from "./occupancy.ts";

const at = (occupied: number, total: number) => ({
  occupied_units: occupied,
  total_units: total,
});

test("batas ambang jatuh ke tingkat yang benar", () => {
  assert.equal(occupancyLevel(at(85, 100)), "healthy");
  assert.equal(occupancyLevel(at(84, 100)), "attention");
  assert.equal(occupancyLevel(at(60, 100)), "attention");
  assert.equal(occupancyLevel(at(59, 100)), "critical");
});

test("skala kecil dinilai sama dengan skala besar", () => {
  assert.equal(occupancyLevel(at(7, 8)), "healthy"); // 87.5%
  assert.equal(occupancyLevel(at(175, 200)), "healthy"); // 87.5%
  assert.equal(occupancyLevel(at(194, 200)), "healthy"); // 6 kosong, tetap sehat
});

test("properti tanpa unit tidak menyala kritis", () => {
  assert.equal(occupancyRate(at(0, 0)), 1);
  assert.equal(occupancyLevel(at(0, 0)), "healthy");
  assert.equal(vacantUnits(at(0, 0)), 0);
});

test("data kotor tidak menghasilkan unit kosong negatif", () => {
  assert.equal(vacantUnits(at(12, 10)), 0);
});
