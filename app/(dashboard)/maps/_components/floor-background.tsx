"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Floor, SubjectType } from "@/types";
import { UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateFloor } from "@/hooks/api/use-floorplan";
import { uploadFloorImage } from "../_lib/canvas";

type Props = {
  subjectType: SubjectType;
  subjectId: string;
  floor: Floor;
  /** Teks tombol saat belum ada latar; halaman kosong memakai kalimat berbeda. */
  label?: string;
};

const ACCEPT = UPLOAD_ACCEPT.join(",");
const MAX_MB = Math.floor(UPLOAD_MAX_BYTES / (1024 * 1024));

export function FloorBackground({
  subjectType,
  subjectId,
  floor,
  label = "Unggah latar",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const updateFloor = useUpdateFloor(subjectType, subjectId);

  async function upload(file: File) {
    if (file.size > UPLOAD_MAX_BYTES) {
      toast.error(`Gambar melebihi ${MAX_MB} MB`);
      return;
    }
    setBusy(true);
    try {
      const uploaded = await uploadFloorImage(file);
      updateFloor.mutate({ floorId: floor.id, name: floor.name, ...uploaded });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unggah gagal");
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    // Dimensi ikut dinolkan: tanpa itu kanvas tetap memakai rasio gambar yang
    // sudah tidak ada.
    updateFloor.mutate({
      floorId: floor.id,
      name: floor.name,
      image_url: "",
      image_width: 0,
      image_height: 0,
    });
  }

  const pending = busy || updateFloor.isPending;

  return (
    <>
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground disabled:opacity-50"
      >
        {pending && <Spinner className="h-3 w-3" />}
        {floor.image_url ? "Ganti latar" : label}
      </button>
      {floor.image_url && (
        <button
          type="button"
          onClick={clear}
          disabled={pending}
          className="rounded-lg px-2 py-1.5 text-xs text-muted transition hover:text-danger disabled:opacity-50"
        >
          Hapus latar
        </button>
      )}
    </>
  );
}
