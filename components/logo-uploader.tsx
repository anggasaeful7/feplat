"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import {
  UPLOAD_ACCEPT,
  UPLOAD_MAX_BYTES,
  type UploadedImage,
} from "@/types/upload";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  name?: string;
  initialUrl?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (url: string) => void;
};

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; previewUrl: string }
  | { kind: "error"; message: string };

const ACCEPT_ATTR = UPLOAD_ACCEPT.join(",");
const MAX_MB = UPLOAD_MAX_BYTES / (1024 * 1024);

export function LogoUploader({
  name = "logo",
  initialUrl = "",
  disabled = false,
  value,
  onChange,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);

  // Use prop 'value' if defined (controlled), otherwise fall back to local state 'url' (uncontrolled)
  const currentUrl = value !== undefined ? value : url;

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function setPreview(file: File) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const obj = URL.createObjectURL(file);
    objectUrlRef.current = obj;
    return obj;
  }

  function clearPreview() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  async function upload(file: File) {
    if (
      file.type &&
      !UPLOAD_ACCEPT.includes(file.type as (typeof UPLOAD_ACCEPT)[number])
    ) {
      setStatus({
        kind: "error",
        message: "Only JPEG, PNG, WebP, or GIF images are allowed.",
      });
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      setStatus({
        kind: "error",
        message: `File exceeds the ${MAX_MB} MiB limit.`,
      });
      return;
    }

    const previewUrl = setPreview(file);
    setStatus({ kind: "uploading", previewUrl });

    try {
      const fd = new FormData();
      fd.set("file", file, file.name);
      const res = await fetch("/api/uploads/images", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        setStatus({
          kind: "error",
          message: body.error?.message ?? "Upload failed. Please try again.",
        });
        clearPreview();
        return;
      }

      const data = (await res.json()) as UploadedImage;
      setUrl(data.public_url);
      onChange?.(data.public_url);
      setStatus({ kind: "idle" });
      clearPreview();
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Please try again.",
      });
      clearPreview();
    }
  }

  function onSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) upload(file);
    event.target.value = "";
  }

  function onDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  function remove() {
    setUrl("");
    onChange?.("");
    setStatus({ kind: "idle" });
    clearPreview();
  }

  const previewSrc =
    status.kind === "uploading" ? status.previewUrl : currentUrl || null;
  const isUploading = status.kind === "uploading";
  const hasImage = Boolean(previewSrc);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={currentUrl} />
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={onSelect}
        className="sr-only"
        disabled={disabled || isUploading}
      />

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        aria-disabled={disabled || isUploading}
        className={`group flex items-center gap-4 rounded-xl border border-dashed bg-surface p-4 transition cursor-pointer ${
          dragOver
            ? "border-brand bg-brand-soft/40"
            : "border-border hover:border-brand/40"
        } ${disabled || isUploading ? "cursor-not-allowed opacity-70" : ""}`}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted ring-1 ring-border">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc!}
              alt="Logo preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted">
              <ImageIcon className="h-7 w-7" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
              <Spinner className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-sm font-medium">
            {hasImage
              ? "Replace logo"
              : "Click to upload, or drop an image here"}
          </div>
          <div className="text-xs text-muted">
            JPEG · PNG · WebP · GIF — up to {MAX_MB} MiB.
          </div>
          {status.kind === "error" && (
            <div className="text-xs text-danger">{status.message}</div>
          )}
        </div>

        {hasImage && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              remove();
            }}
            disabled={disabled}
            className="rounded-md px-2 py-1 text-xs font-medium text-foreground/60 transition hover:bg-surface-muted hover:text-danger"
          >
            Remove
          </button>
        )}
      </label>
    </div>
  );
}

function ImageIcon(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m4 18 5-5 4 4 3-3 4 4" />
    </svg>
  );
}


