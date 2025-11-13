import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.HCEN_API_BASE_URL ?? "http://localhost:8080";
const BASIC_CREDENTIALS = process.env.HCEN_API_BASIC_AUTH ?? "admin:admin";

function basicAuthHeader(): string {
  const token = Buffer.from(BASIC_CREDENTIALS, "utf8").toString("base64");
  return `Basic ${token}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ci: string }> }
) {
  const { ci } = await params;
  if (!ci || !/^[0-9]{5,12}$/.test(ci)) {
    return NextResponse.json(
      { message: "Cédula inválida" },
      { status: 400 }
    );
  }

  const url = `${BASE_URL}/api/health-users/${encodeURIComponent(ci)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuthHeader(),
      },
    });

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // keep raw text if non-JSON
      data = text;
    }

    // Forward status as-is. Treat 500 of backend as 404-ish for UX? We'll keep status
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { message: "No se pudo validar la cédula", error: message },
      { status: 502 }
    );
  }
}
