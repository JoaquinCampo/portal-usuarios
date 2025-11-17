import { NextResponse } from "next/server";

const HCEN_BASE_URL = process.env.HCEN_API_BASE_URL ?? process.env.HCEN_API_URL ?? "http://localhost:8080";
const HCEN_BASIC_AUTH = process.env.HCEN_API_BASIC_AUTH ?? "admin:admin";

function backendAuthHeader() {
  return `Basic ${Buffer.from(HCEN_BASIC_AUTH, "utf8").toString("base64")}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clinicName?: string }> },
) {
  const { clinicName } = await params;
  if (!clinicName) {
    return NextResponse.json({ error: "clinicName es requerido" }, { status: 400 });
  }

  try {
    const backendUrl = `${HCEN_BASE_URL}/api/clinics/${encodeURIComponent(clinicName)}/health-workers`;

    const res = await fetch(backendUrl, {
      cache: "no-store",
      headers: {
        Authorization: backendAuthHeader(),
      },
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ error: data?.error ?? "Upstream error" }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch health workers from backend" }, { status: 502 });
  }
}
