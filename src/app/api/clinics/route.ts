import { NextResponse } from "next/server";

const HCEN_BASE_URL = process.env.HCEN_API_URL ?? process.env.HCEN_API_URL ?? "http://localhost:8080";
const HCEN_BASIC_AUTH = process.env.HCEN_API_BASIC_AUTH ?? "admin:admin";

function backendAuthHeader() {
  return `Basic ${Buffer.from(HCEN_BASIC_AUTH, "utf8").toString("base64")}`;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.search || "";
    const backendUrl = `${HCEN_BASE_URL}/api/clinics${search}`;

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
    return NextResponse.json({ error: "Failed to fetch clinics from backend" }, { status: 502 });
  }
}
