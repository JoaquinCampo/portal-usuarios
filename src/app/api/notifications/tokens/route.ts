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
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!upstream.ok) {
      return NextResponse.json({ error: data?.error ?? data ?? "Upstream error" }, { status: upstream.status });
    }
    return NextResponse.json(data ?? { ok: true }, { status: upstream.status || 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to reach HCEN" }, { status: 502 });
  }
}

