import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, apiBaseUrl } from "@/lib/auth/config";
import type { Envelope, LoginResponse } from "@/types";

const SUPERADMIN_ROLE = "superadmin";

type ClientErrorBody = { error: { code: string; message: string } };

function clientError(
  status: number,
  code: string,
  message: string
): NextResponse<ClientErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let payload: { email?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return clientError(400, "invalid_body", "Badan permintaan harus berupa JSON.");
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";

  if (!email || !password) {
    return clientError(
      400,
      "validation_error",
      "Email dan password wajib diisi."
    );
  }
  if (password.length < 8) {
    return clientError(
      400,
      "validation_error",
      "password minimal 8 karakter."
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return clientError(
      502,
      "upstream_unreachable",
      "Layanan autentikasi tidak dapat dijangkau. Silakan coba lagi."
    );
  }

  let body: Envelope<LoginResponse> | null = null;
  try {
    body = (await upstream.json()) as Envelope<LoginResponse>;
  } catch {
    return clientError(
      502,
      "upstream_invalid",
      "Layanan autentikasi mengembalikan respons yang tidak valid."
    );
  }

  if (!upstream.ok || !body?.data) {
    const code = body?.error?.code ?? "auth_failed";
    const message =
      body?.error?.message ??
      (upstream.status === 401
        ? "Email atau password salah."
        : "Gagal masuk. Silakan coba lagi.");
    return clientError(upstream.status === 401 ? 401 : upstream.status, code, message);
  }

  const { access_token, expires_at, user } = body.data;

  if (user.role !== SUPERADMIN_ROLE) {
    return clientError(
      403,
      "forbidden_role",
      "Portal ini terbatas untuk superadministrator."
    );
  }
  if (!user.is_active) {
    return clientError(
      403,
      "account_inactive",
      "Akun Anda telah dinonaktifkan. Hubungi dukungan platform."
    );
  }

  const expiresDate = new Date(expires_at);
  const maxAge = Number.isFinite(expiresDate.getTime())
    ? Math.max(0, Math.floor((expiresDate.getTime() - Date.now()) / 1000))
    : 60 * 60 * 8;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ data: { user } });
}
