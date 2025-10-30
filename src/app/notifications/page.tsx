"use client";

import { useEffect, useState } from "react";

import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/lib/notifications";

export default function NotificationsPage() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(getNotificationsEnabled());
  }, []);

  const toggle = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    setNotificationsEnabled(nextState);
  };

  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader
        subtitle="Gestion de notificaciones"
        rightSlot={<SignOutButton />}
      />

      <main className="container mx-auto px-6 py-8">
        <Card className="border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Preferencias
              </h2>
              <p className="text-sm text-muted-foreground">
                Activa o desactiva el envio de notificaciones. Podes cambiarlo
                en cualquier momento.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
              <div>
                <p className="font-medium text-foreground">
                  Recibir notificaciones
                </p>
                <p className="text-sm text-muted-foreground">
                  {enabled
                    ? "Actualmente las notificaciones estan habilitadas."
                    : "Actualmente las notificaciones estan deshabilitadas."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={toggle}
                  variant={enabled ? "default" : "outline"}
                >
                  {enabled ? "Deshabilitar" : "Habilitar"}
                </Button>
              </div>
            </div>

            {mounted ? (
              <p className="text-xs text-muted-foreground">Preferencia guardada.</p>
            ) : null}
          </div>
        </Card>
      </main>
    </div>
  );
}
