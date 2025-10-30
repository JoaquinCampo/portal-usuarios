import { FileText } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { DocumentCard } from "./_components/document-card";

const EXAMPLES = [
  {
    title: "Consulta general",
    description: "Resumen de consulta del 15/09/2025",
  },
  {
    title: "Analisis de laboratorio",
    description: "Perfil lipidico y hemograma completo",
  },
  {
    title: "Informe de radiografia",
    description: "RX de torax - control trimestral",
  },
];

export default function ClinicalHistoryPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader
        subtitle="Visualizacion de historia clinica"
        rightSlot={<SignOutButton />}
      />
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((example, index) => (
            <DocumentCard
              key={index}
              title={example.title}
              description={example.description}
              rightIcon={<FileText className="h-5 w-5" />}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
