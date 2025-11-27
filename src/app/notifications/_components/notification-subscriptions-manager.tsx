"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "loading" | "saving" | "success" | "error";
type NotificationType = "ACCESS_REQUEST" | "CLINICAL_HISTORY_ACCESS";

interface Props {
  sessionCi?: string | null;
}

const GENERIC_FETCH_ERROR = "No se pudieron obtener las preferencias.";

function buildFriendlyError(message: string | null | undefined, status?: number) {
  if (!message) {
    return status ? `${GENERIC_FETCH_ERROR} (HTTP ${status})` : GENERIC_FETCH_ERROR;
  }
  const trimmed = message.trim();
  if (!trimmed || trimmed.startsWith("<")) {
    return status ? `${GENERIC_FETCH_ERROR} (HTTP ${status})` : GENERIC_FETCH_ERROR;
  }
  const singleLine = trimmed.replace(/\s+/g, " ").slice(0, 160).trim();
  return singleLine || GENERIC_FETCH_ERROR;
}

export function NotificationSubscriptionsManager({ sessionCi }: Props) {
  const [ci, setCi] = useState<string | null>(sessionCi ?? null);
  const [mounted, setMounted] = useState(false);

  const [accessReqEnabled, setAccessReqEnabled] = useState(false);
  const [clinicalEnabled, setClinicalEnabled] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setCi(sessionCi ?? null);
  }, [sessionCi]);

  useEffect(() => {
    if (!ci) return;
    let cancelled = false;
    async function fetchPrefs() {
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch(`/api/notifications/subscription-preferences/${encodeURIComponent(ci!)}`, {
          cache: "no-store",
        });
        const text = await res.text();
        let data: unknown = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = text;
        }
        if (!res.ok) {
          let message: string | undefined;
          if (data && typeof data === "object" && "error" in data) {
            const errVal = (data as { error?: unknown }).error;
            if (typeof errVal === "string") message = errVal;
          } else if (typeof data === "string") {
            message = data;
          }
          throw new Error(buildFriendlyError(message, res.status));
        }
        if (cancelled) return;
        if (data && typeof data === "object") {
          const accessPref = (data as { subscribedToAccessRequest?: unknown }).subscribedToAccessRequest;
          const clinicalPref = (data as { subscribedToClinicalHistoryAccess?: unknown }).subscribedToClinicalHistoryAccess;
          setAccessReqEnabled(Boolean(accessPref));
          setClinicalEnabled(Boolean(clinicalPref));
        } else {
          setAccessReqEnabled(false);
          setClinicalEnabled(false);
        }
        setStatus("success");
      } catch (e: unknown) {
        if (cancelled) return;
        setStatus("error");
        if (e instanceof Error) {
          setError(buildFriendlyError(e.message));
        } else {
          setError(GENERIC_FETCH_ERROR);
        }
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
      setError("No se pudo determinar tu CI desde la sesion. Reintenta iniciar sesion.");
      return;
    }

    const endpoint = next ? "/api/notifications/subscribe" : "/api/notifications/unsubscribe";
    const current = type === "ACCESS_REQUEST" ? accessReqEnabled : clinicalEnabled;
    // optimistic update
    if (type === "ACCESS_REQUEST") {
      setAccessReqEnabled(next);
    } else {
      setClinicalEnabled(next);
    }
    setStatus("saving");
    setError(null);

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCi: ci, notificationType: type }),
      });
      if (!resp.ok) throw new Error(`No se pudo actualizar la preferencia (HTTP ${resp.status})`);
      setStatus("success");
    } catch (e: unknown) {
      // rollback
      if (type === "ACCESS_REQUEST") {
        setAccessReqEnabled(current);
      } else {
        setClinicalEnabled(current);
      }
      setStatus("error");
      if (e instanceof Error) {
        setError(buildFriendlyError(e.message));
      } else {
        setError("No se pudo actualizar la preferencia.");
      }
    }
  }

  const disabled = status === "loading" || status === "saving" || !ci;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Notificaciones de solicitudes de acceso</p>
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
          No pudimos obtener tu CI desde la sesion. Reintenta iniciar sesion.
        </p>
      ) : null}
    </div>
  );
}

