export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Bell, FileText, History, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { OptionCard } from "./_components/option-card";
import { readSession } from "@/lib/session";

export default async function HomePage() {
  const session = await readSession();
  if (!session) {
    redirect("/login?redirectTo=/home");
  }

  const subtitle = `Bienvenido ${session.healthUser.name}.`;
  const attributes = session.attributes ?? {};
  const documentNumber = attributes.numero_documento ?? session.healthUser.id;
  const email = attributes.email ?? "No disponible";
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <AppHeader
        subtitle={subtitle}
        contactInfo={{ document: documentNumber, email }}
        rightSlot={<SignOutButton />}
      />

      <main className="container mx-auto px-6 py-12 space-y-10">
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
