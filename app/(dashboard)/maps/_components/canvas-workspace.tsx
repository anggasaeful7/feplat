"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { SubjectType } from "@/types";
import { SUBJECT_LABELS, UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from "@/types";
import { ErrorState } from "@/components/error-state";
import { Spinner } from "@/components/ui/spinner";
import { PencilIcon, PlusIcon, TrashIcon } from "@/app/_components/icons";
import {
  useCanvas,
  useCreateFloor,
  useDeleteFloor,
  useUpdateFloor,
} from "@/hooks/api/use-floorplan";
import { uploadFloorImage } from "../_lib/canvas";
import { staticMapUrl } from "../_lib/mapbox";
import { FloorEditor } from "./floor-editor";

type Props = { subjectType: SubjectType; subjectId: string };

export function CanvasWorkspace({ subjectType, subjectId }: Props) {
  const { data, isPending, isError, error } = useCanvas(subjectType, subjectId);
  const createFloor = useCreateFloor(subjectType, subjectId);
  const deleteFloor = useDeleteFloor(subjectType, subjectId);
  const updateFloor = useUpdateFloor(subjectType, subjectId);

  const [floorId, setFloorId] = useState<string | null>(null);
  const [manage, setManage] = useState(false);

  const floors = useMemo(() => data?.floors ?? [], [data]);
  const activeFloor = floors.find((f) => f.id === floorId) ?? floors[0] ?? null;

  if (isPending) {
    return (
      <div className="grid h-[60vh] place-items-center rounded-2xl border border-border bg-surface">
        <Spinner className="h-6 w-6 text-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Couldn't load canvas"
        message={error instanceof Error ? error.message : "Coba lagi sebentar."}
      />
    );
  }

  const property = data.property;
  const located = property.latitude !== null && property.longitude !== null;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Peta menciut jadi thumbnail yang bisa diklik untuk kembali. Gambar
              statis Mapbox: satu <img>, tidak memuat GL JS di halaman ini. */}
          {located && (
            <Link
              href="/maps"
              title="Kembali ke peta"
              className="hidden shrink-0 overflow-hidden rounded-xl border border-border transition hover:border-brand sm:block"
            >
              <Image
                src={staticMapUrl(property.longitude!, property.latitude!, {
                  width: 132,
                  height: 96,
                })}
                alt={`Lokasi ${property.name} di peta`}
                width={132}
                height={96}
                unoptimized
                className="block h-[96px] w-[132px] object-cover"
              />
            </Link>
          )}

          <div className="space-y-1">
            <Link
              href="/maps"
              className="text-xs font-medium text-muted transition hover:text-foreground"
            >
              ← Kembali ke peta
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              {property.name}
            </h1>
            <p className="text-sm text-muted">
              {SUBJECT_LABELS[property.subject_type]}
              {property.subject_type === "tenant" &&
                ` · ${property.workspace_count} workspace`}
              {` · ${property.total_units} unit`}
              {!located && " · lokasi belum dipetakan"}
            </p>
          </div>
        </div>

        {/* Menggambar bentuk di layar sentuh menyiksa dan tidak sepadan; viewer
            tetap jalan di mana saja, editornya saja yang desktop. */}
        <button
          type="button"
          onClick={() => setManage((m) => !m)}
          className={`hidden rounded-xl px-4 py-2 text-sm font-medium transition lg:inline-flex ${
            manage
              ? "bg-brand text-white hover:bg-brand-strong"
              : "border border-border hover:bg-surface-muted"
          }`}
        >
          {manage ? "Selesai mengelola" : "Mode kelola"}
        </button>
      </header>

      {floors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {floors.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFloorId(f.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                activeFloor?.id === f.id
                  ? "bg-brand-soft font-medium text-brand"
                  : "text-muted hover:bg-surface-muted"
              }`}
            >
              {f.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              createFloor.mutate({ name: `Lantai ${floors.length + 1}` })
            }
            disabled={createFloor.isPending}
            className="hidden items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground disabled:opacity-50 lg:inline-flex"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Lantai
          </button>
          {activeFloor && (
            <button
              type="button"
              onClick={() => {
                const name = prompt("Nama lantai baru", activeFloor.name)?.trim();
                if (!name || name === activeFloor.name) return;
                // Update lantai itu full-replace, bukan partial — ikutkan field
                // gambar yang sudah ada supaya rename tidak menghapus latarnya.
                updateFloor.mutate({
                  floorId: activeFloor.id,
                  name,
                  image_url: activeFloor.image_url,
                  image_width: activeFloor.image_width,
                  image_height: activeFloor.image_height,
                });
              }}
              title="Ganti nama lantai"
              className="hidden rounded-lg px-2 py-1.5 text-muted transition hover:text-foreground lg:block"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
          )}
          {activeFloor && floors.length > 1 && (
            <button
              type="button"
              onClick={() => {
                if (!confirm(`Hapus ${activeFloor.name} beserta isinya?`)) return;
                setFloorId(null);
                deleteFloor.mutate(activeFloor.id);
              }}
              title="Hapus lantai ini"
              className="hidden rounded-lg px-2 py-1.5 text-muted transition hover:text-danger lg:block"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {activeFloor ? (
        <FloorEditor
          // Di-key per lantai: pindah lantai me-remount editornya, jadi draft
          // satu lantai tidak pernah bocor ke lantai lain.
          key={activeFloor.id}
          subjectType={subjectType}
          subjectId={subjectId}
          floor={activeFloor}
          floors={floors}
          workspaces={data.workspaces}
          manage={manage}
        />
      ) : (
        <StartCanvas
          onStart={(payload) => createFloor.mutate({ name: "Denah Utama", ...payload })}
          pending={createFloor.isPending}
        />
      )}
    </div>
  );
}

const ACCEPT = UPLOAD_ACCEPT.join(",");
const MAX_MB = Math.floor(UPLOAD_MAX_BYTES / (1024 * 1024));

type StartPayload = {
  image_url?: string;
  image_width?: number;
  image_height?: number;
};

/**
 * Belum ada denah? Jangan tampilkan kanvas kosong begitu saja — ajak mengunggah
 * denahnya, tapi sediakan jalan melanjutkan tanpa itu. Kalau menggambar dikunci
 * di balik unggahan, orang akan menggambar asal-asalan cuma untuk membuka kunci.
 */
function StartCanvas({
  onStart,
  pending,
}: {
  onStart: (payload: StartPayload) => void;
  pending: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (file.size > UPLOAD_MAX_BYTES) {
      toast.error(`Gambar melebihi ${MAX_MB} MB`);
      return;
    }
    setBusy(true);
    try {
      onStart(await uploadFloorImage(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unggah gagal");
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || pending;

  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
        <PlusIcon className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">Belum ada denah</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
        Unggah gambar denah sebagai latar, lalu gambar kotak unit di atasnya.
        Bisa juga langsung mulai tanpa gambar — kanvas kosong pun sudah cukup
        untuk menyusun workspace dan fasilitas.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong disabled:opacity-50"
        >
          {busy && <Spinner className="h-4 w-4" />}
          Unggah denah
        </button>
        <button
          type="button"
          onClick={() => onStart({})}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-surface-muted disabled:opacity-50"
        >
          Mulai tanpa gambar
        </button>
      </div>
    </div>
  );
}
