"use client";

import type { FloorShape } from "@/types";
import { UNIT_STATUS_LABELS, UNIT_STATUSES } from "@/types";
import {
  FACILITY_BY_CODE,
  FACILITY_COLOR,
  UNIT_STATUS_COLOR,
  WORKSPACE_COLOR,
} from "../_lib/canvas";

type Props = {
  shapes: FloorShape[];
  dimmedKeys: Set<string>;
  onToggle: (key: string) => void;
};

function FacilityGlyph({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}

function Entry({
  active,
  onClick,
  swatch,
  glyph,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  swatch?: string;
  glyph?: string;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs transition ${
        active ? "hover:bg-surface-muted" : "opacity-40 hover:opacity-70"
      }`}
    >
      {swatch ? (
        // Warna legenda dibaca dari konstanta yang sama dengan yang dipakai
        // menggambar — bukan versi pastel yang lebih lembut.
        <span
          className="h-4 w-4 shrink-0 rounded"
          style={{ background: swatch }}
        />
      ) : (
        <span className="text-muted">
          {glyph && <FacilityGlyph path={glyph} />}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span className="shrink-0 tabular-nums text-muted">{count}</span>
    </button>
  );
}

/**
 * Legenda dipecah dua kelompok dan berfungsi sebagai filter. Kelompok pertama
 * Fasilitas — ikon garis netral. Kelompok kedua Status unit — ini yang berwarna.
 * Klik salah satu, sisanya meredup di kanvas.
 */
export function CanvasLegend({ shapes, dimmedKeys, onToggle }: Props) {
  const facilityCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>();
  let workspaceCount = 0;
  let unassignedCount = 0;

  for (const s of shapes) {
    if (s.workspace_id) workspaceCount++;
    else if (s.facility)
      facilityCounts.set(s.facility, (facilityCounts.get(s.facility) ?? 0) + 1);
    else if (s.unit)
      statusCounts.set(s.unit.status, (statusCounts.get(s.unit.status) ?? 0) + 1);
    else unassignedCount++;
  }

  const facilities = [...facilityCounts.keys()].sort();

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-3">
      {facilities.length > 0 && (
        <section>
          <h3 className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Fasilitas
          </h3>
          {facilities.map((code) => (
            <Entry
              key={code}
              active={!dimmedKeys.has(`facility:${code}`)}
              onClick={() => onToggle(`facility:${code}`)}
              glyph={FACILITY_BY_CODE.get(code)?.path}
              count={facilityCounts.get(code) ?? 0}
            >
              {FACILITY_BY_CODE.get(code)?.label ?? code}
            </Entry>
          ))}
        </section>
      )}

      <section>
        <h3 className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Status unit
        </h3>
        {UNIT_STATUSES.map((status) => (
          <Entry
            key={status}
            active={!dimmedKeys.has(`status:${status}`)}
            onClick={() => onToggle(`status:${status}`)}
            swatch={UNIT_STATUS_COLOR[status]}
            count={statusCounts.get(status) ?? 0}
          >
            {UNIT_STATUS_LABELS[status]}
          </Entry>
        ))}
      </section>

      {(workspaceCount > 0 || unassignedCount > 0) && (
        <section>
          <h3 className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Lainnya
          </h3>
          {workspaceCount > 0 && (
            <Entry
              active={!dimmedKeys.has("workspace")}
              onClick={() => onToggle("workspace")}
              swatch={WORKSPACE_COLOR}
              count={workspaceCount}
            >
              Workspace
            </Entry>
          )}
          {unassignedCount > 0 && (
            <Entry
              active={!dimmedKeys.has("unassigned")}
              onClick={() => onToggle("unassigned")}
              swatch={FACILITY_COLOR}
              count={unassignedCount}
            >
              Belum ditempel
            </Entry>
          )}
        </section>
      )}
    </div>
  );
}
