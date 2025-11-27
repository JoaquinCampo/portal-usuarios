"use client";

import { useEffect, useMemo, useState } from "react";
import { History as HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AccessLog = {
  id: string;
  healthUserCi: string;
  healthWorkerCi: string | null;
  clinicName: string | null;
  requestedAt: string | null;
  viewed: boolean | null;
  decisionReason?: string | null;
};

type HealthUser = {
  id: string;
  ci: string;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
};

type AccessHistoryResponse = {
  healthUser: HealthUser;
  accessHistory: AccessLog[];
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const DECISION_REASON_LABELS: Record<string, string> = {
  SELF_ACCESS: "Acceso propio",
  BY_CLINIC: "Clínica autorizada",
  BY_HEALTH_WORKER: "Profesional autorizado",
  BY_SPECIALTY: "Especialidad autorizada",
  UNKNOWN: "Motivo desconocido",
};

function formatDecisionReason(reason?: string | null): string {
  if (!reason) return "-";
  return DECISION_REASON_LABELS[reason as keyof typeof DECISION_REASON_LABELS] ?? reason;
}

interface ClinicalHistoryAccessClientProps {
  ci?: string | null;
}

export function ClinicalHistoryAccessClient({ ci }: ClinicalHistoryAccessClientProps) {
  const [activeCi, setActiveCi] = useState<string | null>(ci ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AccessHistoryResponse | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [lastFetchedCount, setLastFetchedCount] = useState(0);

  useEffect(() => {
    setActiveCi(ci ?? null);
    setPageIndex(0);
  }, [ci]);

  useEffect(() => {
    if (!activeCi) {
      setData(null);
      return;
    }
    const ciParam = activeCi;

    const controller = new AbortController();
    async function run() {
      setLoading(true);
      setError(null);
      setLastFetchedCount(0);
      try {
        const params = new URLSearchParams({
          ci: ciParam,
          pageIndex: pageIndex.toString(),
          pageSize: pageSize.toString(),
        });
        const resp = await fetch(`/api/clinical-history-access?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await resp.json();
        if (!resp.ok) {
          const msg = json?.error || `Error ${resp.status}`;
          setError(typeof msg === "string" ? msg : JSON.stringify(json));
          return;
        }
        setData(json as AccessHistoryResponse);
        const history = (json as AccessHistoryResponse)?.accessHistory ?? [];
        setLastFetchedCount(history.length);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = err instanceof Error ? err.message : "Error inesperado";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [activeCi, pageIndex, pageSize]);

  const access = useMemo(() => data?.accessHistory ?? [], [data]);
  const fullName = useMemo(() => {
    const fn = data?.healthUser?.firstName ?? "";
    const ln = data?.healthUser?.lastName ?? "";
    return `${fn} ${ln}`.trim();
  }, [data]);
  const documentValue = data?.healthUser?.ci ?? activeCi ?? undefined;
  const emailValue = data?.healthUser?.email ?? undefined;
  const hasNextPage = !loading && lastFetchedCount === pageSize && access.length === pageSize;
  const hasPreviousPage = !loading && pageIndex > 0;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 text-muted-foreground">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-4 w-4" />
          <span className="text-sm">Accesos recientes a tu historia clínica</span>
        </div>
        {!activeCi ? (
          <span className="text-xs text-destructive">No se pudo determinar la CI desde la sesión.</span>
        ) : null}
        {loading && <span className="text-xs">Cargando…</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Profesional (CI)</TableHead>
            <TableHead>Clínica</TableHead>
            <TableHead>Visto</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {access.map((entry) => {
            const date = entry.requestedAt ? new Date(entry.requestedAt).toLocaleString() : "-";
            return (
              <TableRow key={entry.id}>
                <TableCell className="text-foreground">{date}</TableCell>
                <TableCell className="text-foreground">{entry.healthWorkerCi ?? "-"}</TableCell>
                <TableCell className="text-foreground">{entry.clinicName ?? "-"}</TableCell>
                <TableCell className="text-foreground">{entry.viewed ? "Sí" : "No"}</TableCell>
                <TableCell className="text-foreground">{formatDecisionReason(entry.decisionReason)}</TableCell>
              </TableRow>
            );
          })}
          {!loading && access.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Sin accesos registrados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Tamaño de página:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              const numericValue = Number.parseInt(value, 10) as (typeof PAGE_SIZE_OPTIONS)[number];
              setPageSize(numericValue);
              setPageIndex(0);
            }}
          >
            <SelectTrigger size="sm" aria-label="Seleccionar tamaño de página">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option} registros
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span>Página {pageIndex + 1}</span>
          <Button variant="outline" size="sm" onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))} disabled={!hasPreviousPage}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPageIndex((prev) => prev + 1)} disabled={!hasNextPage}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
