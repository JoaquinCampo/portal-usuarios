import type { HealthUser, HealthWorker, Clinic, ClinicalDocument } from "./types";

function getAuthHeaders(): Record<string, string> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
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

// Removed searchClinics (search feature discontinued)

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

// Removed searchHealthUsers (search feature discontinued)

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

// Removed searchHealthWorkers (search feature discontinued)

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

// Removed searchClinicalDocuments (search feature discontinued)

// Removed getAllEntities (generic helper used by search page)

// Removed searchEntities (generic search helper used by search page)

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
