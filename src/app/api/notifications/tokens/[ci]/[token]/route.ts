import { NextResponse } from "next/server";
import { resolveAuthHeader, resolveBaseApiUrl } from "@/lib/hcen-api";

export async function DELETE(
  _: Request,
  context: { params: Promise<{ ci: string; token: string }> }
) {
  const { ci, token } = await context.params;
  if (!ci || !token) {
    return NextResponse.json({ error: "Missing ci or token" }, { status: 400 });
  }
  const base = resolveBaseApiUrl();
  const url = `${base}/notification-tokens/${encodeURIComponent(ci)}/${encodeURIComponent(token)}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  const auth = resolveAuthHeader();
  if (auth) headers.Authorization = auth;

  try {
    const upstream = await fetch(url, { method: "DELETE", headers, cache: "no-store" });
    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const text = await upstream.text();
    return NextResponse.json({ error: text || "Upstream error" }, { status: upstream.status });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to reach HCEN" }, { status: 502 });
  }
}


