import { NextResponse } from "next/server";

// Server-only handler to proxy clinical history requests to HCEN
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ci = url.searchParams.get("ci");

  if (!ci || !/^\d{8}$/.test(ci)) {
    return NextResponse.json(
      { error: "Missing or invalid 'ci' (8 digits required)" },
      { status: 400 }
    );
  }

  // Prefer explicit HCEN_API_URL if provided, else derive from HCEN_API_URL
  const baseFromLegacy = process.env.HCEN_API_URL
    ? `${process.env.HCEN_API_URL.replace(/\/$/, "")}/api`
    : undefined;
  const baseUrl =
    process.env.HCEN_API_URL || baseFromLegacy || "http://localhost:8080/api";
  const clinicName = process.env.HCEN_CLINIC_NAME;
  const healthWorkerCi = process.env.HCEN_HEALTH_WORKER_CI;
  const basicUser = process.env.HCEN_BASIC_AUTH_USER || "admin";
  const basicPass = process.env.HCEN_BASIC_AUTH_PASS || "admin";

  if (!clinicName || !healthWorkerCi) {
    return NextResponse.json(
      { error: "Server not configured: set HCEN_CLINIC_NAME and HCEN_HEALTH_WORKER_CI env vars" },
      { status: 500 }
    );
  }

  const authHeader = `Basic ${Buffer.from(`${basicUser}:${basicPass}`).toString("base64")}`;

  const target = `${baseUrl.replace(/\/$/, "")}/health-users/${encodeURIComponent(
    ci
  )}/clinical-history?clinicName=${encodeURIComponent(clinicName)}&healthWorkerCi=${encodeURIComponent(
    healthWorkerCi
  )}`;

  try {
    const resp = await fetch(target, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
      // Avoid Next.js fetch caching for dynamic data
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
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to contact HCEN", detail: message },
      { status: 502 }
    );
  }
}
