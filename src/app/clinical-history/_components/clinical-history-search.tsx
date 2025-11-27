"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentCard, type ClinicalDocument } from "./document-card";

type HealthUser = {
  ci: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  clinics?: Array<{
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  }>;
};

type ClinicalHistoryResponse = {
  healthUser?: HealthUser | null;
  documents?: ClinicalDocument[] | null;
  hasAccess?: boolean | null;
  accessMessage?: string | null;
};

type ClinicalHistorySearchProps = {
  ci?: string | null;
};

function toLocalDate(input: string): Date {
  // Fallback local parser for ISO-like strings without timezone
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? new Date(Date.parse(input)) : d;
}

export function ClinicalHistorySearch({ ci }: ClinicalHistorySearchProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthUser, setHealthUser] = useState<HealthUser | null>(null);
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  const normalizedCi = ci?.trim() ?? "";

  const fetchHistory = useCallback(async () => {
    setError(null);
    setDocuments([]);
    setHealthUser(null);
    setHasAccess(null);
    setAccessMessage(null);

    if (!normalizedCi) {
      setError("No pudimos obtener tu cédula desde la sesión.");
      return;
    }
    if (!/^\d{8}$/.test(normalizedCi)) {
      setError("La cédula asociada a tu cuenta no es válida (deben ser 8 dígitos).");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`/api/clinical-history?ci=${encodeURIComponent(normalizedCi)}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await resp.json()) as ClinicalHistoryResponse | { error?: string };
      if (!resp.ok) {
        const msg = (data as { error?: string })?.error || `Error ${resp.status}`;
        setError(msg);
        return;
      }

      const result = data as ClinicalHistoryResponse;
      setHealthUser(result.healthUser ?? null);
      setDocuments(Array.isArray(result.documents) ? (result.documents as ClinicalDocument[]) : []);
      setHasAccess(typeof result.hasAccess === "boolean" ? result.hasAccess : null);
      setAccessMessage(result.accessMessage ?? null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [normalizedCi]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const handleRetry = () => {
    void fetchHistory();
  };

  const accessVariant = useMemo(() => {
    if (hasAccess === false) {
      return {
        badge: "Sin permisos",
        styles: "border-amber-300 bg-amber-50 text-amber-900",
      };
    }
    if (hasAccess === true) {
      return {
        badge: "Acceso concedido",
        styles: "border-emerald-300 bg-emerald-50 text-emerald-900",
      };
    }
    return {
      badge: "Estado desconocido",
      styles: "border-slate-200 bg-slate-50 text-slate-800",
    };
  }, [hasAccess]);

  const shouldShowAccessNotice = !error && hasAccess !== true && (hasAccess !== null || accessMessage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historia Clínica</h1>
        <p className="text-muted-foreground mt-2">
          Consultá los documentos cargados en tu historia clínica electrónica.
        </p>
      </div>


      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex-1 min-w-0">{error}</span>
          {normalizedCi ? (
            <Button type="button" variant="outline" size="sm" onClick={handleRetry} disabled={loading}>
              Reintentar
            </Button>
          ) : null}
        </div>
      ) : null}

      {loading ? <div className="text-sm text-muted-foreground">Cargando historial...</div> : null}

      {shouldShowAccessNotice ? (
        <div className={`rounded-xl border px-4 py-3 text-sm ${accessVariant.styles}`}>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-current text-current">
              {accessVariant.badge}
            </Badge>
            <span className="flex-1 min-w-0">
              {accessMessage ?? (hasAccess ? "Podés ver los documentos disponibles." : "Solicitá acceso para continuar.")}
            </span>
          </div>
        </div>
      ) : null}

      {healthUser ? (
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Información del Usuario</h2>
            <p className="text-muted-foreground text-sm">
              Datos personales del usuario de salud
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Nombre Completo</p>
              <p className="text-base font-semibold">
                {healthUser.firstName} {healthUser.lastName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">CI</p>
              <p className="font-mono text-base font-semibold">{healthUser.ci}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Email</p>
              <p className="text-base">{healthUser.email ?? "No disponible"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Teléfono</p>
              <p className="text-base">{healthUser.phone ?? "No disponible"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Dirección</p>
              <p className="text-base">{healthUser.address ?? "No disponible"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Fecha de Nacimiento</p>
              <p className="text-base">
                {healthUser.dateOfBirth
                  ? format(toLocalDate(healthUser.dateOfBirth), "d 'de' MMMM 'de' yyyy", { locale: es })
                  : "No disponible"}
              </p>
            </div>
          </div>
          {healthUser.clinics?.length ? (
            <div className="mt-6">
              <p className="text-muted-foreground text-sm font-medium">Clínicas asociadas</p>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                {healthUser.clinics.map((clinic) => (
                  <li key={clinic.id ?? clinic.name} className="rounded-full border px-3 py-1">
                    {clinic.name ?? "Sin nombre"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Documentos disponibles</h2>
            <p className="text-sm text-muted-foreground">Listado de documentos que componen tu historia clínica.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleRetry} disabled={loading}>
            Actualizar
          </Button>
        </div>

        {documents.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((doc) => (
              <DocumentCard key={doc.id ?? `${doc.title}-${doc.createdAt}`} document={doc} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            {healthUser
              ? hasAccess === false
                ? "No tenés permisos vigentes para ver documentos."
                : "No encontramos documentos asociados a tu historia clínica."
              : "Recuperando datos de tu historia clínica."}
          </div>
        )}
      </section>
    </div>
  );
}
