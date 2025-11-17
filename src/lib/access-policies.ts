// Helper para interactuar con los endpoints de HCEN relacionados a politicas de acceso.
// Usa BASIC auth configurable via variables de entorno como cualquier otro cliente del portal.

const HCEN_BASE_URL = process.env.HCEN_API_URL ?? "http://localhost:8080";
const HCEN_BASIC_CREDENTIALS = process.env.HCEN_API_BASIC_AUTH ?? "admin:admin";
const ACCESS_POLICIES_BASE = "/api/access-policies";

function basicAuthHeader(): string {
  const token = Buffer.from(HCEN_BASIC_CREDENTIALS, "utf8").toString("base64");
  return `Basic ${token}`;
}

export interface AddClinicAccessPolicyPayload {
  healthUserCi: string;
  clinicName: string;
  accessRequestId?: string | null;
}

export interface AddHealthWorkerAccessPolicyPayload {
  healthUserCi: string;
  healthWorkerCi: string;
  clinicName: string;
  accessRequestId?: string | null;
}

export interface AddSpecialtyAccessPolicyPayload {
  healthUserCi: string;
  specialtyName: string;
  accessRequestId?: string | null;
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

type ClinicSummary = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

type HealthWorkerSummary = {
  ci?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export interface ClinicAccessPolicy {
  id: string;
  healthUserCi: string;
  clinic?: ClinicSummary | null;
  createdAt?: string;
}

export interface HealthWorkerAccessPolicy {
  id: string;
  healthUserId: string;
  healthWorker?: HealthWorkerSummary | null;
  clinic?: ClinicSummary | null;
  createdAt?: string;
}

export interface SpecialtyAccessPolicy {
  id: string;
  healthUserCi: string;
  specialtyName: string;
  createdAt?: string;
}

async function requestJson<T>(path: string, init: RequestInit): Promise<ApiResult<T>> {
  const url = `${HCEN_BASE_URL}${path}`;
  try {
    const headers = {
      Authorization: basicAuthHeader(),
      ...(init.headers ?? {}),
    };
    const res = await fetch(url, {
      cache: "no-store",
      ...init,
      headers,
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    const errorMessage = res.ok 
      ? undefined 
      : (data as { message?: string })?.message || text;
    return {
      ok: res.ok,
      status: res.status,
      data: data as T | null,
      error: errorMessage,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      status: 0,
      data: null,
      error: message,
    };
  }
}

async function postJson<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return requestJson<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function getJson<T>(path: string): Promise<ApiResult<T>> {
  return requestJson<T>(path, {
    method: "GET",
  });
}

async function deleteJson<T>(path: string): Promise<ApiResult<T>> {
  return requestJson<T>(path, {
    method: "DELETE",
  });
}

export async function createClinicAccessPolicy(payload: AddClinicAccessPolicyPayload): Promise<ApiResult> {
  return postJson(`${ACCESS_POLICIES_BASE}/clinic`, payload);
}

export async function createHealthWorkerAccessPolicy(
  payload: AddHealthWorkerAccessPolicyPayload,
): Promise<ApiResult> {
  return postJson(`${ACCESS_POLICIES_BASE}/health-worker`, payload);
}

export async function listClinicAccessPolicies(healthUserCi: string) {
  return getJson<ClinicAccessPolicy[]>(
    `${ACCESS_POLICIES_BASE}/clinic/health-user/${encodeURIComponent(healthUserCi)}`,
  );
}

export async function listHealthWorkerAccessPolicies(healthUserCi: string) {
  return getJson<HealthWorkerAccessPolicy[]>(
    `${ACCESS_POLICIES_BASE}/health-worker/health-user/${encodeURIComponent(healthUserCi)}`,
  );
}

export async function deleteClinicAccessPolicyById(policyId: string) {
  return deleteJson(`${ACCESS_POLICIES_BASE}/clinic/${encodeURIComponent(policyId)}`);
}

export async function deleteHealthWorkerAccessPolicyById(policyId: string) {
  return deleteJson(`${ACCESS_POLICIES_BASE}/health-worker/${encodeURIComponent(policyId)}`);
}

export async function createSpecialtyAccessPolicy(payload: AddSpecialtyAccessPolicyPayload): Promise<ApiResult> {
  return postJson(`${ACCESS_POLICIES_BASE}/specialty`, payload);
}

export async function listSpecialtyAccessPolicies(healthUserCi: string) {
  return getJson<SpecialtyAccessPolicy[]>(
    `${ACCESS_POLICIES_BASE}/specialty/health-user/${encodeURIComponent(healthUserCi)}`,
  );
}

export async function deleteSpecialtyAccessPolicyById(policyId: string) {
  return deleteJson(`${ACCESS_POLICIES_BASE}/specialty/${encodeURIComponent(policyId)}`);
}

export async function hasSpecialtyAccess(healthUserCi: string, specialtyNames: string[]) {
  const params = new URLSearchParams();
  params.set("healthUserCi", healthUserCi);
  specialtyNames.forEach((name) => params.append("specialtyNames", name));
  return getJson<{ hasAccess: boolean }>(
    `${ACCESS_POLICIES_BASE}/specialty/check-access?${params.toString()}`,
  );
}
