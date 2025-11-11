"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createClinicAccessPolicy,
  createHealthWorkerAccessPolicy,
  deleteClinicAccessPolicyById,
  deleteHealthWorkerAccessPolicyById,
  type AddClinicAccessPolicyPayload,
  type AddHealthWorkerAccessPolicyPayload,
} from "@/lib/access-policies";
import { readSession } from "@/lib/session";
import { GUEST_CI_COOKIE_NAME } from "@/lib/cookie-names";

function sanitizeString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length ? s : undefined;
}

export async function submitClinicAccessPolicy(_: any, formData: FormData) {
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
    return { ok: false, message: res.error || "No se pudo crear" };
  }
  revalidatePath("/access-policies");
  return { ok: true, message: "Solicitud hecha correctamente" };
}

export async function submitHealthWorkerAccessPolicy(_: any, formData: FormData) {
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
    return { ok: false, message: res.error || "No se pudo crear" };
  }
  revalidatePath("/access-policies");
  return { ok: true, message: "Solicitud hecha correctamente" };
}

export async function deleteClinicAccessPolicyAction(formData: FormData) {
  const policyId = sanitizeString(formData.get("clinicAccessPolicyId"));
  if (!policyId) {
    return { ok: false, message: "ID de la politica de clinica es requerido" };
  }

  const res = await deleteClinicAccessPolicyById(policyId);
  if (!res.ok) {
    return { ok: false, message: res.error || "No se pudo eliminar la politica de clinica" };
  }

  revalidatePath("/access-policies");
  return { ok: true, message: "Politica de clinica eliminada correctamente" };
}

export async function deleteHealthWorkerAccessPolicyAction(formData: FormData) {
  const policyId = sanitizeString(formData.get("healthWorkerAccessPolicyId"));
  if (!policyId) {
    return { ok: false, message: "ID de la politica de profesional es requerido" };
  }

  const res = await deleteHealthWorkerAccessPolicyById(policyId);
  if (!res.ok) {
    return { ok: false, message: res.error || "No se pudo eliminar la politica de profesional" };
  }

  revalidatePath("/access-policies");
  return { ok: true, message: "Politica de profesional eliminada correctamente" };
}
