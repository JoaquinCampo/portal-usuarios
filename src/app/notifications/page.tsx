import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Card } from "@/components/ui/card";
import { NotificationPreferenceToggle } from "./_components/notification-preference-toggle";
import { readSession } from "@/lib/session";

export default async function NotificationsPage() {
  const session = await readSession();
  const documentNumber =
    session?.attributes?.numero_documento ?? session?.healthUser?.id ?? null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        subtitle="Gestion de notificaciones"
        rightSlot={
          session ? (
            <SignOutButton />
          ) : (
            <a
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Iniciar Sesion
            </a>
          )
        }
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
            <NotificationPreferenceToggle
              sessionCi={documentNumber}
              isAuthenticated={Boolean(session)}
            />
          </div>
        </Card>
      </main>
    </div>
  );
}
