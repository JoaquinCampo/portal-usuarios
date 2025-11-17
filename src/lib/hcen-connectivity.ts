const CONNECTIVITY_HINTS = [
  "fetch failed",
  "failed to fetch",
  "network",
  "timeout",
  "econ",
  "refused",
];

const HTTP_GATEWAY_PATTERN = /http\s+50[234]/;

function normalize(value?: string | null): string {
  return (value ?? "").toLowerCase();
}

export function describeHcenConnectivityIssue(status?: number, message?: string | null): string | null {
  const normalized = normalize(message);
  const statusMatches = status === 0 || status === 502 || status === 503 || status === 504;
  const messageMatches =
    CONNECTIVITY_HINTS.some((hint) => normalized.includes(hint)) || HTTP_GATEWAY_PATTERN.test(normalized);
  return statusMatches || messageMatches ? "Sin conexion a HCEN" : null;
}

export function formatHcenError(status?: number, message?: string | null, fallback?: string): string {
  const friendly = describeHcenConnectivityIssue(status, message);
  if (friendly) {
    return friendly;
  }
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  if (typeof status === "number" && status > 0) {
    return `HTTP ${status}`;
  }
  return fallback ?? "Ocurrio un error inesperado";
}
