import { Bell, FileText, History, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/app/_components/app-header";
import { OptionCard } from "./_components/option-card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader subtitle="Bienvenido. Esta es la página de inicio básica." />

      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-6">
          <OptionCard
            title="Gestión de notificaciones"
            description="Activá o desactivá el envío de notificaciones."
            href="/notifications"
            ctaLabel="Gestión"
            icon={<Bell className="h-4 w-4" />}
          />

          <OptionCard
            title="Visualización de historia clínica"
            description="Accedé a documentos clínicos y sus detalles."
            href="/clinical-history"
            ctaLabel="Historia"
            icon={<FileText className="h-4 w-4" />}
          />
          
          <OptionCard
            title="Visualización de accesos a historia clínica"
            description="Listado de accesos a documentos clínicos (ejemplos)."
            href="/clinical-history-access"
            ctaLabel="Accesos"
            icon={<History className="h-4 w-4" />}
          />

          <OptionCard
            title="Gestión de políticas de accesos"
            description="Revisá y resolvé solicitudes de acceso a la historia clínica."
            href="/access-policies"
            ctaLabel="Políticas"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>
      </main>
    </div>
  );
}
