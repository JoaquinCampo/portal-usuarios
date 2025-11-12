import { NextResponse } from "next/server";

type ToggleBody = {
  ci?: string;
  enabled?: boolean;
};

function resolveBaseApiUrl(): string {
  const legacy = process.env.HCEN_API_URL
    ? `${process.env.HCEN_API_URL.replace(/\/$/, "")}/api`
    : undefined;
  const base = process.env.HCEN_API_BASE_URL || legacy || "http://localhost:8080/api";
  return base.replace(/\/$/, "");
}

function resolveAuthHeader(): string | undefined {
  const inline = process.env.HCEN_API_BASIC_AUTH;
  if (inline && inline.includes(":")) {
    return `Basic ${Buffer.from(inline, "utf8").toString("base64")}`;
  }
  const user = process.env.HCEN_BASIC_AUTH_USER;
  const pass = process.env.HCEN_BASIC_AUTH_PASS;
  if (user && pass) {
    return `Basic ${Buffer.from(`${user}:${pass}`, "utf8").toString("base64")}`;
  }
  return undefined;
}

export async function POST(request: Request) {
  let body: ToggleBody | null = null;
  try {
    body = (await request.json()) as ToggleBody;
  } catch {
    // ignore, validation below will handle null body
  }

  const ci = body?.ci?.toString().trim();
  const enabled = body?.enabled;

  if (!ci || !/^\d{5,12}$/.test(ci)) {
    return NextResponse.json(
      { error: "Missing or invalid 'ci'. Provide between 5 and 12 digits." },
      { status: 400 },
    );
  }

  if (typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "Missing 'enabled' boolean in body." },
      { status: 400 },
    );
  }

  const baseApi = resolveBaseApiUrl();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const authHeader = resolveAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    // Compose: subscribe/unsubscribe both types to emulate a global toggle
    const types = ["ACCESS_REQUEST", "CLINICAL_HISTORY_ACCESS"]; 
    for (const notificationType of types) {
      const target = `${baseApi}/notification-tokens/${enabled ? "subscribe" : "unsubscribe"}`;
      const resp = await fetch(target, {
        method: "POST",
        headers,
        body: JSON.stringify({ userCi: ci, notificationType }),
        cache: "no-store",
      });
      if (!resp.ok) {
        const text = await resp.text();
        let data: unknown = text;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = text;
        }
        return NextResponse.json(
          {
            error: "HCEN rejected the notification preference change.",
            status: resp.status,
            data,
          },
          { status: resp.status },
        );
      }
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to reach HCEN", detail: err?.message ?? String(err) },
      { status: 502 },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ci = url.searchParams.get("ci");

  if (!ci || !/^\d{5,12}$/.test(ci)) {
    return NextResponse.json(
      { error: "Missing or invalid 'ci'. Provide between 5 and 12 digits." },
      { status: 400 },
    );
  }

  const baseApi = resolveBaseApiUrl();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const authHeader = resolveAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const target = `${baseApi}/notification-tokens/subscription-preferences/${encodeURIComponent(ci)}`;

  try {
    const upstream = await fetch(target, {
      method: "GET",
      headers,
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
      return NextResponse.json(
        {
          error: "HCEN rejected the notification status request.",
          status: upstream.status,
          data,
        },
        { status: upstream.status },
      );
    }

    const enabled = Boolean(data?.subscribedToAccessRequest) && Boolean(data?.subscribedToClinicalHistoryAccess);
    return NextResponse.json(
      {
        userCi: data?.userCi ?? ci,
        enabled,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to reach HCEN", detail: err?.message ?? String(err) },
      { status: 502 },
    );
  }
}
