export function resolveBaseApiUrl(): string {
  const legacy = process.env.HCEN_API_URL ? `${process.env.HCEN_API_URL.replace(/\/$/, "")}/api` : undefined;
  const base = process.env.HCEN_API_BASE_URL || legacy || "http://localhost:8080/api";
  return base.replace(/\/$/, "");
}

export function resolveAuthHeader(): string | undefined {
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

