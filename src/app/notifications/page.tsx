import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Card } from "@/components/ui/card";
import { NotificationSubscriptionsManager } from "./_components/notification-subscriptions-manager";
import { readSession } from "@/lib/session";
import { cookies } from "next/headers";
import { GUEST_CI_COOKIE_NAME, GUEST_PROFILE_COOKIE_NAME } from "@/lib/cookie-names";
import { parseGuestProfileCookie } from "@/lib/guest-cookie";

export default async function NotificationsPage() {
  const session = await readSession();
  const cookieStore = await cookies();
  const guestCi = cookieStore.get(GUEST_CI_COOKIE_NAME)?.value;
  const guestProfile = parseGuestProfileCookie(cookieStore.get(GUEST_PROFILE_COOKIE_NAME)?.value);
  const documentNumber =
    session?.attributes?.numero_documento ?? session?.healthUser?.id ?? guestProfile?.ci ?? guestCi ?? null;
  const email = session?.attributes?.email ?? guestProfile?.email ?? null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        subtitle="Gestion de notificaciones"
        contactInfo={{ document: documentNumber ?? undefined, email: email ?? undefined }}
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
              <h2 className="text-xl font-semibold text-foreground">Preferencias de notificaciones</h2>
              <p className="text-sm text-muted-foreground">
                Administrá qué tipos de notificaciones querés recibir. No necesitás volver a ingresar tu CI.
              </p>
            </div>
            <NotificationSubscriptionsManager sessionCi={documentNumber} isAuthenticated={Boolean(session)} />
          </div>
        </Card>
      </main>
    </div>
  );
}
