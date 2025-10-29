"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/app/_components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNotificationsEnabled, setNotificationsEnabled } from "@/lib/notifications";

export default function NotificationsPage() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(getNotificationsEnabled());
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setNotificationsEnabled(next);
  };

  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader subtitle="Gestión de notificaciones" />

      <main className="container mx-auto px-6 py-8">
        <Card className="border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Preferencias</h2>
              <p className="text-sm text-muted-foreground">
                Activá o desactivá el envío de notificaciones. Podés cambiarlo en cualquier momento.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
              <div>
                <p className="font-medium text-foreground">Recibir notificaciones</p>
                <p className="text-sm text-muted-foreground">
                  {enabled ? "Actualmente las notificaciones están habilitadas." : "Actualmente las notificaciones están deshabilitadas."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Simple toggle using a button for consistency with existing UI */}
                <Button onClick={toggle} variant={enabled ? "default" : "outline"}>
                  {enabled ? "Deshabilitar" : "Habilitar"}
                </Button>
              </div>
            </div>

            {mounted && (
              <p className="text-xs text-muted-foreground">
                Preferencia guardada.
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
