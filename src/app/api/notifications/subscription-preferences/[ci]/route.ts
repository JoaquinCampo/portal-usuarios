import { NextResponse } from "next/server";
import { resolveAuthHeader, resolveBaseApiUrl } from "@/lib/hcen-api";

export async function GET(
  _: Request,
  context: { params: Promise<{ ci: string }> }
) {
  const { ci } = await context.params;
  if (!ci) {
    return NextResponse.json({ error: "Missing ci" }, { status: 400 });
  }
  const base = resolveBaseApiUrl();
  const headers: Record<string, string> = { Accept: "application/json" };
  const auth = resolveAuthHeader();
  if (auth) headers.Authorization = auth;

  const url = `${base}/notification-tokens/subscription-preferences/${encodeURIComponent(ci)}`;
  try {
    const upstream = await fetch(url, { method: "GET", headers, cache: "no-store" });
    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!upstream.ok) {
      let message = "Upstream error";
      if (data && typeof data === "object" && "error" in data) {
        const errVal = (data as { error: unknown }).error;
        if (typeof errVal === "string") message = errVal;
      } else if (typeof data === "string" && data.trim()) {
        message = data;
      }
      return NextResponse.json({ error: message }, { status: upstream.status });
    }
    return NextResponse.json(data ?? {}, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to reach HCEN" }, { status: 502 });
  }
}


