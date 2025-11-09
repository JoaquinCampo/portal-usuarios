const STORAGE_KEY = "notifications-enabled";
const API_ENDPOINT = "/api/notifications/preferences";

function persistLocal(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

export function getNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) === true : false;
  } catch {
    return false;
  }
}

export async function fetchNotificationsPreference(ci: string): Promise<boolean> {
  const url = `${API_ENDPOINT}?ci=${encodeURIComponent(ci)}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!resp.ok) {
    let message = "No se pudo obtener la preferencia de notificaciones.";
    try {
      const data = await resp.json();
      if (typeof (data as any)?.error === "string") {
        message = (data as any).error;
      }
    } catch {
      // ignore parsing errors
    }
    throw new Error(message);
  }

  const data = (await resp.json()) as { enabled?: boolean };
  const enabled = data?.enabled === true;
  persistLocal(enabled);
  return enabled;
}

export async function setNotificationsEnabled(ci: string, value: boolean): Promise<void> {
  const payload = {
    ci,
    enabled: value,
  };

  const resp = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    let message = "No se pudo actualizar la preferencia de notificaciones.";
    try {
      const data = await resp.json();
      if (typeof (data as any)?.error === "string") {
        message = (data as any).error;
      }
    } catch {
      // ignore parsing errors
    }
    throw new Error(message);
  }

  persistLocal(value);
}
