"use client";

import { Bell, FileText, History, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { OptionCard } from "../_components/option-card";

export default function HomeGuest() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <AppHeader
        subtitle="Bienvenido Invitado."
        contactInfo={{ document: "No disponible", email: "No disponible" }}
        rightSlot={
          <a
            href="/login"
            className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Iniciar Sesión
          </a>
        }
      />

      <main className="container mx-auto px-6 py-12">
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
              description="Gestiona las políticas de acceso a la historia clínica."
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
