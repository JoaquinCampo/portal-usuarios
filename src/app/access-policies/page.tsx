export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Button } from "@/components/ui/button";
import { AccessPolicyForms } from "./_components/access-policy-forms";
import { readSession } from "@/lib/session";
import {
  listClinicAccessPolicies,
  listHealthWorkerAccessPolicies,
  listSpecialtyAccessPolicies,
  type ApiResult,
  type ClinicAccessPolicy,
  type HealthWorkerAccessPolicy,
  type SpecialtyAccessPolicy,
} from "@/lib/access-policies";
import { formatHcenError } from "@/lib/hcen-connectivity";
import {
  deleteClinicAccessPolicyAction,
  deleteHealthWorkerAccessPolicyAction,
  deleteSpecialtyAccessPolicyAction,
} from "./actions";

function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-UY", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function clinicLabel(clinic?: ClinicAccessPolicy["clinic"] | null) {
  if (!clinic) return "Clinica sin datos";
  return clinic.name ?? clinic.id ?? "Clinica sin datos";
}

function workerLabel(worker?: HealthWorkerAccessPolicy["healthWorker"] | null) {
  if (!worker) return "Profesional sin datos";
  const fullName = [worker.firstName, worker.lastName].filter(Boolean).join(" ").trim();
  if (fullName) {
    return worker.ci ? `${fullName} (CI ${worker.ci})` : fullName;
  }
  return worker.ci ? `CI ${worker.ci}` : "Profesional sin datos";
}

function specialtyLabel(policy: SpecialtyAccessPolicy) {
  return policy.specialtyName || "Especialidad sin datos";
}

function sanitizeErrorForDisplay(message?: string, status?: number) {
  if (!message) {
    return status ? `No se pudieron cargar los datos (HTTP ${status}).` : "No se pudieron cargar los datos.";
  }
  const trimmed = message.trim();
  if (!trimmed || trimmed.startsWith("<")) {
    return status ? `No se pudieron cargar los datos (HTTP ${status}).` : "No se pudieron cargar los datos.";
  }
  const singleLine = trimmed.replace(/\s+/g, " ").slice(0, 200).trim();
  return singleLine || (status ? `No se pudieron cargar los datos (HTTP ${status}).` : "No se pudieron cargar los datos.");
}

function formatAccessPolicyError(result?: Pick<ApiResult, "status" | "error">) {
  if (!result) return "No se pudieron cargar los datos.";
  const formatted = formatHcenError(result.status, result.error);
  return sanitizeErrorForDisplay(formatted, result.status);
}

type SectionProps<T> = {
  title: string;
  emptyMessage: string;
  error?: string;
  policies: T[];
  renderItem: (policy: T) => ReactNode;
};

function PoliciesSection<T>({ title, emptyMessage, error, policies, renderItem }: SectionProps<T>) {
  const hasPolicies = policies.length > 0;
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {hasPolicies ? <span className="text-xs text-muted-foreground">{policies.length} registros</span> : null}
      </div>

      {error ? (
        <p className="text-sm text-red-600">No se pudieron cargar los datos: {error}</p>
      ) : hasPolicies ? (
        <ul className="space-y-3 text-sm">{policies.map((policy) => renderItem(policy))}</ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  );
}

export default async function AccessPoliciesPage() {
  const session = await readSession();
  if (!session) {
    redirect("/login?redirectTo=/access-policies");
  }

  const ci = session.attributes?.numero_documento ?? session.healthUser?.id ?? null;
  const email = session.attributes?.email ?? null;

  let clinicPolicies: ClinicAccessPolicy[] = [];
  let healthWorkerPolicies: HealthWorkerAccessPolicy[] = [];
  let specialtyPolicies: SpecialtyAccessPolicy[] = [];
  let clinicError: string | undefined;
  let workerError: string | undefined;
  let specialtyError: string | undefined;

  if (ci) {
    const [clinicResult, workerResult, specialtyResult] = await Promise.all([
      listClinicAccessPolicies(ci),
      listHealthWorkerAccessPolicies(ci),
      listSpecialtyAccessPolicies(ci),
    ]);

    if (clinicResult.ok && clinicResult.data) {
      clinicPolicies = clinicResult.data;
    } else if (!clinicResult.ok) {
      clinicError = formatAccessPolicyError(clinicResult);
    }

    if (workerResult.ok && workerResult.data) {
      healthWorkerPolicies = workerResult.data;
    } else if (!workerResult.ok) {
      workerError = formatAccessPolicyError(workerResult);
    }

    if (specialtyResult.ok && specialtyResult.data) {
      specialtyPolicies = specialtyResult.data;
    } else if (!specialtyResult.ok) {
      specialtyError = formatAccessPolicyError(specialtyResult);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        subtitle="Gestion de politicas de acceso"
        contactInfo={{ document: ci ?? undefined, email: email ?? undefined }}
        rightSlot={<SignOutButton />}
      />
      <main className="container mx-auto px-6 py-8 space-y-8">
        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">Configuracion rapida</h2>
          <p className="text-sm text-muted-foreground">
            Desde aqui podes crear o eliminar politicas de acceso para clinicas y profesionales.
          </p>
          <AccessPolicyForms />
        </section>

        {ci ? (
          <section className="space-y-4">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <PoliciesSection
                title="Politicas para clinicas"
                emptyMessage="No hay clinicas habilitadas."
                error={clinicError}
                policies={clinicPolicies}
                renderItem={(policy) => (
                  <li key={policy.id} className="rounded-md border p-3 space-y-2">
                    <div>
                      <p className="font-medium">{clinicLabel(policy.clinic)}</p>
                      <p className="text-xs text-muted-foreground">
                        ID politica: {policy.id}
                        {policy.createdAt ? ` - Creada ${formatDate(policy.createdAt)}` : null}
                      </p>
                    </div>
                    <form action={deleteClinicAccessPolicyAction} className="flex justify-end">
                      <input type="hidden" name="clinicAccessPolicyId" value={policy.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Eliminar
                      </Button>
                    </form>
                  </li>
                )}
              />

              <PoliciesSection
                title="Politicas para profesionales"
                emptyMessage="No hay profesionales habilitados."
                error={workerError}
                policies={healthWorkerPolicies}
                renderItem={(policy) => (
                  <li key={policy.id} className="rounded-md border p-3 space-y-2">
                    <div>
                      <p className="font-medium">{workerLabel(policy.healthWorker)}</p>
                      <p className="text-xs text-muted-foreground">
                        Clinica: {clinicLabel(policy.clinic)}
                        <br />
                        ID politica: {policy.id}
                        {policy.createdAt ? ` - Creada ${formatDate(policy.createdAt)}` : null}
                      </p>
                    </div>
                    <form action={deleteHealthWorkerAccessPolicyAction} className="flex justify-end">
                      <input type="hidden" name="healthWorkerAccessPolicyId" value={policy.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Eliminar
                      </Button>
                    </form>
                  </li>
                )}
              />

              <PoliciesSection
                title="Politicas por especialidad"
                emptyMessage="No hay especialidades habilitadas."
                error={specialtyError}
                policies={specialtyPolicies}
                renderItem={(policy) => (
                  <li key={policy.id} className="rounded-md border p-3 space-y-2">
                    <div>
                      <p className="font-medium">{specialtyLabel(policy)}</p>
                      <p className="text-xs text-muted-foreground">
                        ID politica: {policy.id}
                        {policy.createdAt ? ` - Creada ${formatDate(policy.createdAt)}` : null}
                      </p>
                    </div>
                    <form action={deleteSpecialtyAccessPolicyAction} className="flex justify-end">
                      <input type="hidden" name="specialtyAccessPolicyId" value={policy.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Eliminar
                      </Button>
                    </form>
                  </li>
                )}
              />
            </div>
          </section>
        ) : (
          <section className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Para listar las politicas de acceso necesitamos una CI en la sesion activa. Inicia sesion nuevamente o
              regresa a la pagina principal.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
