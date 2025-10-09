import type {
  EntityType,
  HealthUser,
  HealthWorker,
  Clinic,
  ClinicalDocument,
} from "./types";

function getAuthHeaders(): Record<string, string> {
  const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
  const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin";
  const credentials = btoa(`${username}:${password}`);

  return {
    Authorization: `Basic ${credentials}`,
    Accept: "application/json",
  };
}

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "";
}

export async function getAllClinics(): Promise<Clinic[]> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(`${apiUrl}/clinics`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = (await res.json()) as Clinic[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function searchClinics(query: string): Promise<Clinic[]> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(
      `${apiUrl}/clinics/search?name=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = (await res.json()) as Clinic[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getAllHealthUsers(): Promise<HealthUser[]> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(`${apiUrl}/health-users`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = (await res.json()) as HealthUser[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function searchHealthUsers(query: string): Promise<HealthUser[]> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(
      `${apiUrl}/health-users/search?name=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = (await res.json()) as HealthUser[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getAllHealthWorkers(): Promise<HealthWorker[]> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(`${apiUrl}/health-workers`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = (await res.json()) as HealthWorker[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function searchHealthWorkers(
  query: string
): Promise<HealthWorker[]> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(
      `${apiUrl}/health-workers/search?name=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    return (await res.json()) as HealthWorker[];
  } catch {
    return [];
  }
}

export async function getAllClinicalDocuments(): Promise<ClinicalDocument[]> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(`${apiUrl}/clinical-documents`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) return [];

    return (await res.json()) as ClinicalDocument[];
  } catch {
    return [];
  }
}

export async function searchClinicalDocuments(
  query: string
): Promise<ClinicalDocument[]> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(
      `${apiUrl}/clinical-documents/search?title=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    return (await res.json()) as ClinicalDocument[];
  } catch {
    return [];
  }
}

export async function getAllEntities(
  entity: EntityType
): Promise<(Clinic | HealthUser | HealthWorker | ClinicalDocument)[]> {
  switch (entity) {
    case "clinics":
      return getAllClinics();
    case "health-users":
      return getAllHealthUsers();
    case "health-workers":
      return getAllHealthWorkers();
    case "clinical-documents":
      return getAllClinicalDocuments();
    default:
      throw new Error(`Unsupported entity: ${entity satisfies never}`);
  }
}

export async function searchEntities(
  entity: EntityType,
  query: string
): Promise<(Clinic | HealthUser | HealthWorker | ClinicalDocument)[]> {
  switch (entity) {
    case "clinics":
      return searchClinics(query);
    case "health-users":
      return searchHealthUsers(query);
    case "health-workers":
      return searchHealthWorkers(query);
    case "clinical-documents":
      return searchClinicalDocuments(query);
    default:
      throw new Error(`Unsupported entity: ${entity satisfies never}`);
  }
}

export async function getActiveUsersCount(): Promise<number> {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(`${apiUrl}/active-users/count`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) return 0;

    const data = (await res.json()) as { count: number };
    return data.count;
  } catch {
    return 0;
  }
}
