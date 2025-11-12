"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { readGuestProfile } from "@/lib/guest-profile";

type Status = "idle" | "loading" | "saving" | "success" | "error";
type NotificationType = "ACCESS_REQUEST" | "CLINICAL_HISTORY_ACCESS";

interface Props {
  sessionCi?: string | null;
  isAuthenticated: boolean;
}

export function NotificationSubscriptionsManager({ sessionCi, isAuthenticated }: Props) {
  const [ci, setCi] = useState<string | null>(sessionCi ?? null);
  const [mounted, setMounted] = useState(false);

  const [accessReqEnabled, setAccessReqEnabled] = useState(false);
  const [clinicalEnabled, setClinicalEnabled] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (sessionCi) {
      setCi(sessionCi);
      return;
    }
    const profile = readGuestProfile();
    if (profile?.ci) setCi(profile.ci);
  }, [sessionCi]);

  useEffect(() => {
    if (!ci) return;
    let cancelled = false;
    async function fetchPrefs() {
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch(`/api/notifications/subscription-preferences/${encodeURIComponent(ci)}`, {
          cache: "no-store",
        });
        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = text;
        }
        if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : `HTTP ${res.status}`);
        if (cancelled) return;
        setAccessReqEnabled(Boolean(data?.subscribedToAccessRequest));
        setClinicalEnabled(Boolean(data?.subscribedToClinicalHistoryAccess));
        setStatus("success");
      } catch (e: any) {
        if (cancelled) return;
        setStatus("error");
        setError(e?.message ?? "No se pudieron obtener las preferencias.");
      }
    }
    fetchPrefs();
    return () => {
      cancelled = true;
    };
  }, [ci]);

  async function toggle(type: NotificationType, next: boolean) {
    if (!ci) {
      setStatus("error");
      setError(
        isAuthenticated
          ? "No se pudo determinar tu CI desde la sesion. Reintenta iniciar sesion."
          : "Valida tu CI en la pantalla de inicio para gestionar notificaciones.",
      );
      return;
    }

    const endpoint = next ? "/api/notifications/subscribe" : "/api/notifications/unsubscribe";
    const current = type === "ACCESS_REQUEST" ? accessReqEnabled : clinicalEnabled;
    // optimistic update
    type === "ACCESS_REQUEST" ? setAccessReqEnabled(next) : setClinicalEnabled(next);
    setStatus("saving");
    setError(null);

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCi: ci, notificationType: type }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setStatus("success");
    } catch (e: any) {
      // rollback
      type === "ACCESS_REQUEST" ? setAccessReqEnabled(current) : setClinicalEnabled(current);
      setStatus("error");
      setError(e?.message ?? "No se pudo actualizar la preferencia.");
    }
  }

  const disabled = status === "loading" || status === "saving" || !ci;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Notificaciones de solicitudes de acceso</p>
            <p className="text-xs text-muted-foreground">Tipo: ACCESS_REQUEST</p>
          </div>
          <Button
            onClick={() => toggle("ACCESS_REQUEST", !accessReqEnabled)}
            variant={accessReqEnabled ? "default" : "outline"}
            disabled={disabled}
          >
            {status === "saving" ? "Guardando..." : accessReqEnabled ? "Deshabilitar" : "Habilitar"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Notificaciones de acceso a historia clínica</p>
            <p className="text-xs text-muted-foreground">Tipo: CLINICAL_HISTORY_ACCESS</p>
          </div>
          <Button
            onClick={() => toggle("CLINICAL_HISTORY_ACCESS", !clinicalEnabled)}
            variant={clinicalEnabled ? "default" : "outline"}
            disabled={disabled}
          >
            {status === "saving" ? "Guardando..." : clinicalEnabled ? "Deshabilitar" : "Habilitar"}
          </Button>
        </div>
      </div>

      {status === "loading" ? (
        <p className="text-xs text-muted-foreground">Cargando preferencias...</p>
      ) : null}
      {status === "error" && error ? <p className="text-xs text-destructive">{error}</p> : null}
      {status === "success" && mounted ? (
        <p className="text-xs text-muted-foreground">Preferencias sincronizadas con HCEN.</p>
      ) : null}
      {!ci ? (
        <p className="text-xs text-muted-foreground">
          {isAuthenticated
            ? "No pudimos obtener tu CI desde la sesion. Reintenta iniciar sesion."
            : "Valida tu CI desde la pantalla principal para habilitar esta opcion."}
        </p>
      ) : null}
    </div>
  );
}

