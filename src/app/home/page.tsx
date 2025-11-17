export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { Bell, FileText, History, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { OptionCard } from "./_components/option-card";
import { readSession } from "@/lib/session";
import HomeGuest from "./_components/home-guest";
import { GUEST_CI_COOKIE_NAME, GUEST_PROFILE_COOKIE_NAME } from "@/lib/cookie-names";
import { parseGuestProfileCookie } from "@/lib/guest-cookie";

export default async function HomePage() {
  const session = await readSession();
  const cookieStore = await cookies();
  const guestCi = cookieStore.get(GUEST_CI_COOKIE_NAME)?.value ?? null;
  const guestProfile = parseGuestProfileCookie(cookieStore.get(GUEST_PROFILE_COOKIE_NAME)?.value);
  const guestDocument = guestProfile?.ci ?? guestCi ?? undefined;
  const guestEmail = guestProfile?.email ?? undefined;
  const guestName = [guestProfile?.firstName, guestProfile?.lastName]
    .filter((value) => Boolean(value?.trim()))
    .join(" ")
    .trim();

  if (!session) {
    // Modo invitado completo con datos persistidos del navegador
    return (
      <HomeGuest
        guestName={guestName || undefined}
        contactInfo={{
          document: guestDocument,
          email: guestEmail,
        }}
      />
    );
  }

  const subtitle = `Bienvenido ${session.healthUser.name}.`;
  const attributes = session.attributes ?? {};
  const documentNumber = attributes.numero_documento ?? session.healthUser.id ?? guestDocument;
  const email = attributes.email ?? guestEmail ?? "No disponible";
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <AppHeader
        subtitle={subtitle}
        contactInfo={{ document: documentNumber, email }}
        rightSlot={
          session ? (
            <SignOutButton />
          ) : (
            <a
              href="/login"
              className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              Iniciar Sesión
            </a>
          )
        }
      />

      <main className="container mx-auto px-6 py-12 space-y-10">
        <section className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Acceso autorizado
          </p>
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Clínica {session.clinic.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {session.access.source} · {session.access.message}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Controla tus notificaciones y accesos
            </h2>
            <p className="text-sm text-muted-foreground">
              Accede rápidamente a las funciones clave del portal.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <OptionCard
              title="Gestión de notificaciones"
              description="Activa o desactiva el envío de notificaciones."
              href="/notifications"
              ctaLabel="Gestionar"
              icon={<Bell className="h-10 w-10" />}
            />

            <OptionCard
              title="Visualización de historia clínica"
              description="Accede a documentos clínicos y sus detalles."
              href="/clinical-history"
              ctaLabel="Historia"
              icon={<FileText className="h-10 w-10" />}
            />

            <OptionCard
              title="Visualización de accesos"
              description="Listado de accesos a documentos clínicos."
              href="/clinical-history-access"
              ctaLabel="Accesos"
              icon={<History className="h-10 w-10" />}
            />

            <OptionCard
              title="Políticas de acceso"
              description="Revisa y resuelve solicitudes de acceso a la historia clínica."
              href="/access-policies"
              ctaLabel="Políticas"
              icon={<ShieldCheck className="h-10 w-10" />}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
