import { NextResponse } from "next/server";

// GET /api/clinical-history-access?ci=XXXXXXXX
// Proxies to HCEN: /clinical-history/health-users/{ci}/access-history
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ci = url.searchParams.get("ci");

  if (!ci || !/^\d{8}$/.test(ci)) {
    return NextResponse.json(
      { error: "Missing or invalid 'ci' (8 digits required)" },
      { status: 400 }
    );
  }

  // Prefer explicit HCEN_API_BASE_URL if provided, else derive from HCEN_API_URL
  const baseFromLegacy = process.env.HCEN_API_URL
    ? `${process.env.HCEN_API_URL.replace(/\/$/, "")}/api`
    : undefined;
  let baseUrl =
    process.env.HCEN_API_BASE_URL || baseFromLegacy || "http://localhost:8080/api";
  // Normalize: strip trailing slash and ensure single /api segment
  baseUrl = baseUrl.replace(/\/$/, "");
  if (!baseUrl.endsWith("/api")) {
    baseUrl = `${baseUrl}/api`;
  }

  const basicUser = process.env.HCEN_BASIC_AUTH_USER || "admin";
  const basicPass = process.env.HCEN_BASIC_AUTH_PASS || "admin";
  const authHeader = `Basic ${Buffer.from(`${basicUser}:${basicPass}`,"utf8").toString("base64")}`;

  const target = `${baseUrl}/clinical-history/health-users/${encodeURIComponent(
    ci
  )}/access-history`;

  try {
    const resp = await fetch(target, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    const text = await resp.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!resp.ok) {
      return NextResponse.json(
        { error: "Upstream error", status: resp.status, data },
        { status: resp.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Failed to contact HCEN",
        detail: err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown error",
      },
      { status: 502 }
    );
  }
}
