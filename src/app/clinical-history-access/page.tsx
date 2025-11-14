"use client";

import { useEffect, useMemo, useState } from "react";
import { History as HistoryIcon } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AccessLog = {
  id: number;
  healthUserCi: string;
  healthWorkerCi: string | null;
  clinicName: string | null;
  requestedAt: string | null; // ISO string from API; we'll display as local string
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

function parseCookieCi(): string | null {
  try {
    const cookie = typeof document !== "undefined" ? document.cookie : "";
    const match = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("guest_ci="));
    if (!match) return null;
    const value = decodeURIComponent(match.split("=")[1] ?? "");
    const digits = value.replace(/\D+/g, "");
    return digits.length === 8 ? digits : null;
  } catch {
    return null;
  }
}

function parseLocalStorageCi(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("guest_health_user");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    const ci = (obj?.ci ?? obj?.CI ?? obj?.document)?.toString?.() ?? "";
    const digits = ci.replace(/\D+/g, "");
    return digits.length === 8 ? digits : null;
  } catch {
    return null;
  }
}

export default function ClinicalHistoryAccessPage() {
  const [ci, setCi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AccessHistoryResponse | null>(null);

  useEffect(() => {
    // Obtain CI from cookie first, fallback to localStorage
    const fromCookie = parseCookieCi();
    const fromLs = fromCookie ? null : parseLocalStorageCi();
    const resolved = fromCookie || fromLs;
    setCi(resolved);
  }, []);

  useEffect(() => {
    if (!ci) return;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`/api/clinical-history-access?ci=${encodeURIComponent(ci)}`, {
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
      } catch (e: unknown) {
        // In browsers, aborting fetch may throw a DOMException with name 'AbortError'
        if (typeof e === "object" && e !== null && "name" in e && (e as { name?: unknown }).name === "AbortError") {
          return;
        }
        const message = e instanceof Error ? e.message : "Error inesperado";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [ci]);

  const access = useMemo(() => data?.accessHistory ?? [], [data]);
  const fullName = useMemo(() => {
    const fn = data?.healthUser?.firstName ?? "";
    const ln = data?.healthUser?.lastName ?? "";
    return `${fn} ${ln}`.trim();
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        subtitle="Visualizacion de accesos a historia clinica"
        rightSlot={<SignOutButton />}
      />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-4 flex flex-col gap-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4" />
            <span className="text-sm">Accesos recientes a tu historia clínica</span>
          </div>
          {ci ? (
            <span className="text-xs">CI detectada: <span className="font-mono text-foreground">{ci}</span></span>
          ) : (
            <span className="text-xs text-destructive">No se pudo detectar la CI (cookie guest_ci o localStorage guest_health_user)</span>
          )}
          {data?.healthUser && (
            <div className="text-xs">
              Paciente: <span className="text-foreground">{fullName || "(sin nombre)"}</span> — CI: <span className="font-mono text-foreground">{data.healthUser.ci}</span>
            </div>
          )}
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
                  <TableCell className="text-foreground">{entry.decisionReason ?? "-"}</TableCell>
                </TableRow>
              );
            })}
            {!loading && access.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">Sin accesos registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
