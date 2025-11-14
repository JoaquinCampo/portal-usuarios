import { NextResponse } from "next/server";
import { resolveAuthHeader, resolveBaseApiUrl } from "@/lib/hcen-api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const userCi = body?.userCi?.toString()?.trim();
    const token = body?.token?.toString()?.trim();
    if (!userCi || !token) {
      return NextResponse.json({ error: "Missing userCi or token" }, { status: 400 });
    }

    const base = resolveBaseApiUrl();
    const url = `${base}/notification-tokens`;
    const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
    const auth = resolveAuthHeader();
    if (auth) headers.Authorization = auth;

    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ userCi, token }),
      cache: "no-store",
    });
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
    return NextResponse.json((data as object) ?? { ok: true }, { status: upstream.status || 201 });
  } catch {
    return NextResponse.json({ error: "Failed to reach HCEN" }, { status: 502 });
  }
}

