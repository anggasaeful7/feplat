import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(request, await params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, params: { slug: string[] }) {
  const rawBackendUrl = process.env.PLATFORM_API_BASE_URL || "http://localhost:8080";
  const slugPath = params.slug.join("/");

  // Normalize: strip trailing slash and optional /api/v1 suffix for consistency
  // (axios.ts treats PLATFORM_API_BASE_URL as root without /api/v1)
  const baseUrl = rawBackendUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  const targetUrl = new URL(`${baseUrl}/api/v1/${slugPath}${request.nextUrl.search}`);

  const cookieStore = await cookies();
  const token = cookieStore.get("spc_session")?.value;

  const headers = new Headers(request.headers);
  // Remove host header to avoid SSL/DNS conflicts with the target server
  headers.delete("host");
  // This is a server-to-server call, so CORS does not apply. Strip the browser's
  // origin/referer so the backend's CORS allow-list check does not reject a
  // frontend domain that is not whitelisted (would return an empty-body 403).
  headers.delete("origin");
  headers.delete("referer");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const init: RequestInit = {
      method: request.method,
      headers,
      // Only set body for methods that allow it
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
      // Prevent automatic redirects so we can pass them back to the client
      redirect: "manual",
    };

    const response = await fetch(targetUrl.toString(), init);

    // Create a new response to return to the client
    const responseHeaders = new Headers(response.headers);
    // Don't forward content-encoding as it might confuse the browser if it gets decoded by fetch
    responseHeaders.delete("content-encoding");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API Proxy Error:", error);
    return new NextResponse(
      JSON.stringify({ error: { code: "internal_error", message: "Proxy failed" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
