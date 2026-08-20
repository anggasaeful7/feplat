import { NextResponse } from "next/server";
import { apiBaseUrl } from "@/lib/auth/config";
import { getSessionToken } from "@/lib/auth/session";
import type { Envelope, UploadedImage } from "@/types";
import { UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from "@/types";

type ErrorBody = { error: { code: string; message: string } };

function err(
  status: number,
  code: string,
  message: string
): NextResponse<ErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return err(401, "unauthenticated", "Sign in to upload an image.");
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return err(400, "invalid_form", "Expected a multipart form upload.");
  }

  const file = incoming.get("file");
  if (!(file instanceof File)) {
    return err(400, "missing_file", "Attach a file under field name 'file'.");
  }
  if (file.size === 0) {
    return err(400, "empty_file", "The selected file is empty.");
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return err(
      413,
      "file_too_large",
      `File exceeds the ${Math.floor(UPLOAD_MAX_BYTES / (1024 * 1024))} MiB limit.`
    );
  }
  if (file.type && !UPLOAD_ACCEPT.includes(file.type as (typeof UPLOAD_ACCEPT)[number])) {
    return err(
      400,
      "unsupported_type",
      "Only JPEG, PNG, WebP, or GIF images are allowed."
    );
  }

  const forwarded = new FormData();
  forwarded.set("file", file, file.name);

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}/uploads/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: forwarded,
      cache: "no-store",
    });
  } catch {
    return err(
      502,
      "upstream_unreachable",
      "Upload service is unreachable. Please try again."
    );
  }

  let body: Envelope<UploadedImage> | null = null;
  try {
    body = (await upstream.json()) as Envelope<UploadedImage>;
  } catch {
    return err(
      502,
      "upstream_invalid",
      "Upload service returned an invalid response."
    );
  }

  if (!upstream.ok || !body?.data) {
    const code = body?.error?.code ?? "upload_failed";
    const message = body?.error?.message ?? "Upload failed. Please try again.";
    return err(upstream.status, code, message);
  }

  return NextResponse.json(body.data, { status: 201 });
}
