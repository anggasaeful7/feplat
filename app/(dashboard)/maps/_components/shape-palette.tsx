"use client";

import type { CanvasWorkspaceRef } from "@/types";
import { FACILITIES, WORKSPACE_COLOR } from "../_lib/canvas";

type Props = {
  workspaces: CanvasWorkspaceRef[];
};

/** Payload drag dikodekan sebagai string tunggal karena `DataTransfer` hanya
 *  menjamin `text/plain` lintas browser. */
export function encodeDrag(kind: "facility" | "workspace", value: string) {
  return `${kind}:${value}`;
}

export function decodeDrag(payload: string) {
  const index = payload.indexOf(":");
  if (index < 0) return null;
  const kind = payload.slice(0, index);
  const value = payload.slice(index + 1);
  if (kind !== "facility" && kind !== "workspace") return null;
  return { kind, value } as const;
}

export function ShapePalette({ workspaces }: Props) {
  const unplaced = workspaces.filter((w) => !w.placed);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-3">
      {unplaced.length > 0 && (
        <section className="space-y-1">
          <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Workspace belum digambar
          </h3>
          {unplaced.map((w) => (
            <div
              key={w.id}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData(
                  "text/plain",
                  encodeDrag("workspace", `${w.id}|${w.name}`),
                )
              }
              className="flex cursor-grab items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-xs active:cursor-grabbing"
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-sm"
                style={{ background: WORKSPACE_COLOR }}
              />
              <span className="truncate">{w.name}</span>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-1">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Fasilitas
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {FACILITIES.map((f) => (
            <div
              key={f.code}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("text/plain", encodeDrag("facility", f.code))
              }
              title={f.label}
              className="flex cursor-grab items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-[11px] text-muted transition hover:text-foreground active:cursor-grabbing"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: f.path }}
              />
              <span className="truncate">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="px-1 text-[11px] text-muted">
        Tarik ke kanvas untuk menaruhnya.
      </p>
    </div>
  );
}
