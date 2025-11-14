import { NextResponse } from "next/server";
import { resolveAuthHeader, resolveBaseApiUrl } from "@/lib/hcen-api";

export async function POST(request: Request) {
  const base = resolveBaseApiUrl();
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  const auth = resolveAuthHeader();
  if (auth) headers.Authorization = auth;

  try {
    const body = await request.json().catch(() => null);
    const userCi = body?.userCi?.toString()?.trim();
    const notificationType = body?.notificationType?.toString()?.trim();
    if (!userCi || !notificationType) {
      return NextResponse.json({ error: "Missing userCi or notificationType" }, { status: 400 });
    }
    const upstream = await fetch(`${base}/notification-tokens/unsubscribe`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({ userCi, notificationType }),
    });
    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json({ error: text || "Upstream error" }, { status: upstream.status });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to reach HCEN" }, { status: 502 });
  }
}

