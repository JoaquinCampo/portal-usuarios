import { Bell, FileText, History, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { OptionCard } from "./_components/option-card";
import { readSession } from "@/lib/session";
import HomeGuest from "./_components/home-guest";

export default async function HomePage() {
  const session = await readSession();

  if (!session) {
    // Modo invitado completo en componente cliente
    return <HomeGuest />;
  }

  const subtitle = `Bienvenido ${session.healthUser.name}.`;
  const attributes = session.attributes ?? {};
  const documentNumber = attributes.numero_documento ?? session.healthUser.id;
  const email = attributes.email ?? "No disponible";
  

  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader subtitle={subtitle} rightSlot={session ? <SignOutButton /> : <a href="/login" className="text-sm text-muted-foreground hover:text-foreground">Iniciar Sesión</a>} />

      <main className="container mx-auto px-6 py-12 space-y-6">
        <div className="rounded-lg border border-border bg-card/40 p-6 text-sm text-muted-foreground">
          <p>
            Acceso autorizado para la clinica {session.clinic.name}. Decision:
            {` ${session.access.source} - ${session.access.message}`}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-foreground">Documento</h3>
            <p className="mt-1 text-lg text-muted-foreground">{documentNumber}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-foreground">Correo</h3>
            <p className="mt-1 text-lg text-muted-foreground break-all">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <OptionCard
            title="Gestion de notificaciones"
            description="Activa o desactiva el envio de notificaciones."
            href="/notifications"
            ctaLabel="Gestionar"
            icon={<Bell className="h-4 w-4" />}
          />

          <OptionCard
            title="Visualizacion de historia clinica"
            description="Accede a documentos clinicos y sus detalles."
            href="/clinical-history"
            ctaLabel="Historia"
            icon={<FileText className="h-4 w-4" />}
          />

          <OptionCard
            title="Visualizacion de accesos"
            description="Listado de accesos a documentos clinicos (ejemplo)."
            href="/clinical-history-access"
            ctaLabel="Accesos"
            icon={<History className="h-4 w-4" />}
          />

          <OptionCard
            title="Politicas de acceso"
            description="Revisa y resuelve solicitudes de acceso a la historia clinica."
            href="/access-policies"
            ctaLabel="Ver politicas"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>
      </main>
    </div>
  );
}
