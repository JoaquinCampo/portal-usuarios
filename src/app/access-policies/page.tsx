export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Button } from "@/components/ui/button";
import { AccessPolicyForms } from "./_components/access-policy-forms";
import { readSession } from "@/lib/session";
import { GUEST_CI_COOKIE_NAME } from "@/lib/cookie-names";
import {
  listClinicAccessPolicies,
  listHealthWorkerAccessPolicies,
  type ClinicAccessPolicy,
  type HealthWorkerAccessPolicy,
} from "@/lib/access-policies";
import { deleteClinicAccessPolicyAction, deleteHealthWorkerAccessPolicyAction } from "./actions";

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
  const cookieStore = await cookies();
  const guestCi = cookieStore.get(GUEST_CI_COOKIE_NAME)?.value;
  const ci = session?.attributes?.numero_documento ?? session?.healthUser?.id ?? guestCi ?? null;
  const email = session?.attributes?.email ?? null;

  let clinicPolicies: ClinicAccessPolicy[] = [];
  let healthWorkerPolicies: HealthWorkerAccessPolicy[] = [];
  let clinicError: string | undefined;
  let workerError: string | undefined;

  if (ci) {
    const [clinicResult, workerResult] = await Promise.all([
      listClinicAccessPolicies(ci),
      listHealthWorkerAccessPolicies(ci),
    ]);

    if (clinicResult.ok && clinicResult.data) {
      clinicPolicies = clinicResult.data;
    } else if (!clinicResult.ok) {
      clinicError = clinicResult.error ?? `HTTP ${clinicResult.status}`;
    }

    if (workerResult.ok && workerResult.data) {
      healthWorkerPolicies = workerResult.data;
    } else if (!workerResult.ok) {
      workerError = workerResult.error ?? `HTTP ${workerResult.status}`;
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
            <header className="flex flex-col gap-1">
              <p className="text-xs uppercase text-muted-foreground">CI consultada</p>
              <p className="text-lg font-semibold">{ci}</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
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
