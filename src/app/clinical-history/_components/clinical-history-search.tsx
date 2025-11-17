"use client";

import { useCallback, useEffect, useState } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type HealthUser = {
  ci: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
};

type ClinicalHistoryAccessLog = {
  id: string;
  healthUserCi: string;
  healthWorkerCi?: string | null;
  clinicName?: string | null;
  requestedAt?: string | null;
  viewed?: boolean | null;
  decisionReason?: string | null;
};

type ClinicalHistoryAccessResponse = {
  healthUser: HealthUser;
  accessHistory: ClinicalHistoryAccessLog[];
};

type ClinicalHistorySearchProps = {
  ci?: string | null;
};

function toLocalDate(input: string): Date {
  // Fallback local parser for ISO-like strings without timezone
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? new Date(Date.parse(input)) : d;
}

function formatDecision(reason?: string | null): string {
  const normalized = reason?.toUpperCase() ?? "";
  switch (normalized) {
    case "SELF_ACCESS":
      return "Acceso propio";
    case "BY_CLINIC":
      return "Autorizado por clínica";
    case "BY_HEALTH_WORKER":
      return "Autorizado por profesional";
    case "BY_SPECIALTY":
      return "Autorizado por especialidad";
    default:
      return reason ?? "Sin especificar";
  }
}

function formatRequester(log: ClinicalHistoryAccessLog): string {
  if (log.healthWorkerCi) {
    return `Profesional CI ${log.healthWorkerCi}`;
  }
  return "Usuario titular";
}

export function ClinicalHistorySearch({ ci }: ClinicalHistorySearchProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthUser, setHealthUser] = useState<HealthUser | null>(null);
  const [accessHistory, setAccessHistory] = useState<ClinicalHistoryAccessLog[]>([]);

  const normalizedCi = ci?.trim() ?? "";

  const fetchHistory = useCallback(async () => {
    setError(null);
    setAccessHistory([]);
    setHealthUser(null);

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
      const resp = await fetch(`/api/clinical-history-access?ci=${encodeURIComponent(normalizedCi)}`, {
        method: "GET",
      });
      const data = (await resp.json()) as ClinicalHistoryAccessResponse | { error?: string };
      if (!resp.ok) {
        const msg = (data as { error?: string })?.error || `Error ${resp.status}`;
        setError(msg);
        return;
      }

      const result = data as ClinicalHistoryAccessResponse;
      setHealthUser(result.healthUser);
      setAccessHistory(result.accessHistory ?? []);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historia Clínica</h1>
        <p className="text-muted-foreground mt-2">
          Consultá los accesos registrados a tu historia clínica.
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
        </div>
      ) : null}

      {/* Tabla de historial de accesos */}
      <div className="overflow-hidden rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b">
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Fecha</th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Clínica</th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Solicitado por</th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Tipo de acceso</th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Detalle</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {accessHistory.length ? (
              accessHistory.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50 border-b transition-colors">
                  <td className="p-2 align-middle whitespace-nowrap">
                    {log.requestedAt
                      ? format(toLocalDate(log.requestedAt), "d 'de' MMMM 'de' yyyy HH:mm", { locale: es })
                      : "Sin fecha"}
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{log.clinicName ?? "No especificada"}</div>
                      {log.healthUserCi ? (
                        <div className="text-muted-foreground text-xs">Paciente CI {log.healthUserCi}</div>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{formatRequester(log)}</div>
                      {log.healthWorkerCi ? (
                        <div className="text-muted-foreground text-xs">Autorizado</div>
                      ) : (
                        <div className="text-muted-foreground text-xs">Acceso directo del usuario</div>
                      )}
                    </div>
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                      {formatDecision(log.decisionReason)}
                    </Badge>
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={log.viewed ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}
                    >
                      {log.viewed ? "Consultado por titular" : "Acceso de terceros"}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="h-24 text-center p-2" colSpan={5}>
                  {healthUser ? "No hay registros de acceso." : "Necesitamos tu cédula para mostrar tu historial."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
