import { NextResponse } from "next/server";

const DEFAULT_API_BASE = "http://localhost:8080/api";

function normalizeBaseUrl(input?: string | null): string {
  const trimmed = (input && input.trim().length ? input.trim() : DEFAULT_API_BASE).replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function buildQueryString(params: Record<string, string | undefined>, specialties: string[]): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.length) {
      search.append(key, value);
    }
  });
  specialties.forEach((name) => {
    const trimmed = name.trim();
    if (trimmed.length) {
      search.append("specialtyNames", trimmed);
    }
  });
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

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

  const baseUrl = normalizeBaseUrl(process.env.HCEN_API_URL);
  const clinicName = process.env.HCEN_CLINIC_NAME ?? url.searchParams.get("clinicName") ?? undefined;
  const healthWorkerCi =
    process.env.HCEN_HEALTH_WORKER_CI ?? url.searchParams.get("healthWorkerCi") ?? undefined;
  const specialtyFromEnv = process.env.HCEN_SPECIALTY_NAMES
    ? process.env.HCEN_SPECIALTY_NAMES.split(",")
    : [];
  const specialtyFromQuery = url.searchParams.getAll("specialtyNames");
  const specialtyNames = specialtyFromQuery.length ? specialtyFromQuery : specialtyFromEnv;
  const basicUser = process.env.HCEN_BASIC_AUTH_USER || "admin";
  const basicPass = process.env.HCEN_BASIC_AUTH_PASS || "admin";
  const authHeader = `Basic ${Buffer.from(`${basicUser}:${basicPass}`, "utf8").toString("base64")}`;

  const queryString = buildQueryString(
    {
      clinicName,
      healthWorkerCi,
    },
    specialtyNames
  );

  const target = `${baseUrl}/clinical-history/${encodeURIComponent(ci)}${queryString}`;

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
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to contact HCEN", detail: message },
      { status: 502 }
    );
  }
}
