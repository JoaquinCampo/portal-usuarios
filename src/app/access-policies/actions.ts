"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createClinicAccessPolicy,
  createHealthWorkerAccessPolicy,
  deleteClinicAccessPolicyById,
  deleteHealthWorkerAccessPolicyById,
  createSpecialtyAccessPolicy,
  deleteSpecialtyAccessPolicyById,
  type AddClinicAccessPolicyPayload,
  type AddHealthWorkerAccessPolicyPayload,
  type AddSpecialtyAccessPolicyPayload,
} from "@/lib/access-policies";
import { readSession } from "@/lib/session";
import { GUEST_CI_COOKIE_NAME } from "@/lib/cookie-names";
import { formatHcenError } from "@/lib/hcen-connectivity";

function sanitizeString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length ? s : undefined;
}

export async function submitClinicAccessPolicy(_prevState: unknown, formData: FormData) {
  const session = await readSession();
  const cookieStore = await cookies();
  const guestCi = cookieStore.get(GUEST_CI_COOKIE_NAME)?.value;
  const ci = session?.attributes?.numero_documento ?? session?.healthUser?.id ?? guestCi ?? undefined;

  const payload: AddClinicAccessPolicyPayload = {
    healthUserCi: ci!,
    clinicName: sanitizeString(formData.get("clinicName"))!,
  };

  if (!payload.healthUserCi) return { ok: false, message: "No se encontró CI en la sesión" };
  if (!payload.clinicName) return { ok: false, message: "Nombre de la clínica es requerido" };

  const res = await createClinicAccessPolicy(payload);
  if (!res.ok) {
    return { ok: false, message: formatHcenError(res.status, res.error, "No se pudo crear") };
  }
  revalidatePath("/access-policies");
  return { ok: true, message: "Solicitud hecha correctamente" };
}

export async function submitHealthWorkerAccessPolicy(_prevState: unknown, formData: FormData) {
  const session = await readSession();
  const cookieStore = await cookies();
  const guestCi = cookieStore.get(GUEST_CI_COOKIE_NAME)?.value;
  const ci = session?.attributes?.numero_documento ?? session?.healthUser?.id ?? guestCi ?? undefined;

  const payload: AddHealthWorkerAccessPolicyPayload = {
    healthUserCi: ci!,
    healthWorkerCi: sanitizeString(formData.get("healthWorkerCi"))!,
    clinicName: sanitizeString(formData.get("clinicName"))!,
  };

  if (!payload.healthUserCi) return { ok: false, message: "No se encontró CI en la sesión" };
  if (!payload.healthWorkerCi) return { ok: false, message: "CI del profesional es requerida" };
  if (!payload.clinicName) return { ok: false, message: "Nombre de la clínica es requerido" };

  const res = await createHealthWorkerAccessPolicy(payload);
  if (!res.ok) {
    return { ok: false, message: formatHcenError(res.status, res.error, "No se pudo crear") };
  }
  revalidatePath("/access-policies");
  return { ok: true, message: "Solicitud hecha correctamente" };
}

export async function submitSpecialtyAccessPolicy(_prevState: unknown, formData: FormData) {
  const session = await readSession();
  const cookieStore = await cookies();
  const guestCi = cookieStore.get(GUEST_CI_COOKIE_NAME)?.value;
  const ci = session?.attributes?.numero_documento ?? session?.healthUser?.id ?? guestCi ?? undefined;

  const payload: AddSpecialtyAccessPolicyPayload = {
    healthUserCi: ci!,
    specialtyName: sanitizeString(formData.get("specialtyName"))!,
  };

  if (!payload.healthUserCi) return { ok: false, message: "No se encontró CI en la sesión" };
  if (!payload.specialtyName) return { ok: false, message: "Nombre de la especialidad es requerido" };

  const res = await createSpecialtyAccessPolicy(payload);
  if (!res.ok) {
    return { ok: false, message: formatHcenError(res.status, res.error, "No se pudo crear") };
  }
  revalidatePath("/access-policies");
  return { ok: true, message: "Solicitud hecha correctamente" };
}

export async function deleteClinicAccessPolicyAction(formData: FormData): Promise<void> {
  const policyId = sanitizeString(formData.get("clinicAccessPolicyId"));
  if (!policyId) {
    throw new Error("ID de la politica de clinica es requerido");
  }

  const res = await deleteClinicAccessPolicyById(policyId);
  if (!res.ok) {
    throw new Error(formatHcenError(res.status, res.error, "No se pudo eliminar la politica de clinica"));
  }

  revalidatePath("/access-policies");
}

export async function deleteHealthWorkerAccessPolicyAction(formData: FormData): Promise<void> {
  const policyId = sanitizeString(formData.get("healthWorkerAccessPolicyId"));
  if (!policyId) {
    throw new Error("ID de la politica de profesional es requerido");
  }

  const res = await deleteHealthWorkerAccessPolicyById(policyId);
  if (!res.ok) {
    throw new Error(formatHcenError(res.status, res.error, "No se pudo eliminar la politica de profesional"));
  }

  revalidatePath("/access-policies");
}

export async function deleteSpecialtyAccessPolicyAction(formData: FormData): Promise<void> {
  const policyId = sanitizeString(formData.get("specialtyAccessPolicyId"));
  if (!policyId) {
    throw new Error("ID de la politica de especialidad es requerido");
  }

  const res = await deleteSpecialtyAccessPolicyById(policyId);
  if (!res.ok) {
    throw new Error(formatHcenError(res.status, res.error, "No se pudo eliminar la politica de especialidad"));
  }

  revalidatePath("/access-policies");
}
