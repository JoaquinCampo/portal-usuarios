"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  fetchNotificationsPreference,
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/lib/notifications";
import { readGuestProfile } from "@/lib/guest-profile";

type Status = "idle" | "loading" | "saving" | "success" | "error";

interface NotificationPreferenceToggleProps {
  sessionCi?: string | null;
  isAuthenticated: boolean;
}

export function NotificationPreferenceToggle({
  sessionCi,
  isAuthenticated,
}: NotificationPreferenceToggleProps) {
  const [ci, setCi] = useState<string | null>(sessionCi ?? null);
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(getNotificationsEnabled());
    setMounted(true);

    if (sessionCi) {
      setCi(sessionCi);
      return;
    }

    const profile = readGuestProfile();
    if (profile?.ci) {
      setCi(profile.ci);
    }
  }, [sessionCi]);

  useEffect(() => {
    if (!ci) return;
    let cancelled = false;

    const sync = async () => {
      setStatus((prev) => (prev === "saving" ? prev : "loading"));
      setError(null);
      try {
        const remoteEnabled = await fetchNotificationsPreference(ci);
        if (cancelled) return;
        setEnabled(remoteEnabled);
        setStatus("success");
      } catch (err: any) {
        if (cancelled) return;
        setStatus("error");
        setError(err?.message ?? "No se pudo sincronizar la preferencia.");
      }
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [ci]);

  const toggle = async () => {
    if (!ci) {
      setStatus("error");
      setError(
        isAuthenticated
          ? "No se pudo determinar tu cedula desde la sesion. Intenta nuevamente."
          : "Valida tu cedula en la pantalla de inicio para gestionar notificaciones.",
      );
      return;
    }

    const nextState = !enabled;
    setEnabled(nextState);
    setStatus("saving");
    setError(null);

    try {
      await setNotificationsEnabled(ci, nextState);
      setStatus("success");
    } catch (err: any) {
      setEnabled(!nextState);
      setStatus("error");
      setError(err?.message ?? "No se pudo actualizar la preferencia.");
    }
  };

  const buttonDisabled = status === "saving" || status === "loading" || !ci;
  const buttonLabel = status === "saving" ? "Guardando..." : enabled ? "Deshabilitar" : "Habilitar";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
        <div>
          <p className="font-medium text-foreground">Recibir notificaciones</p>
          <p className="text-sm text-muted-foreground">
            {enabled
              ? "Actualmente las notificaciones estan habilitadas."
              : "Actualmente las notificaciones estan deshabilitadas."}
          </p>
          {!ci ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {isAuthenticated
                ? "No pudimos obtener tu cedula desde la sesion. Reintenta iniciar sesion."
                : "Valida tu cedula desde la pantalla principal para habilitar esta opcion."}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={toggle} variant={enabled ? "default" : "outline"} disabled={buttonDisabled}>
            {buttonLabel}
          </Button>
        </div>
      </div>

      {status === "loading" ? (
        <p className="text-xs text-muted-foreground">Sincronizando preferencia con HCEN...</p>
      ) : null}
      {status === "saving" ? (
        <p className="text-xs text-muted-foreground">Guardando preferencia...</p>
      ) : null}
      {status === "success" && mounted ? (
        <p className="text-xs text-green-500">Preferencia sincronizada.</p>
      ) : null}
      {status === "error" && error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
      {status === "idle" ? (
        <p className="text-xs text-muted-foreground">
          {mounted ? "Preferencia cargada desde el dispositivo." : "Cargando preferencia..."}
        </p>
      ) : null}
    </div>
  );
}
