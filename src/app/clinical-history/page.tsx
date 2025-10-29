import { AppHeader } from "@/app/_components/app-header";
import { DocumentCard } from "./_components/document-card";
import { FileText } from "lucide-react";

export default function ClinicalHistoryPage() {
  const examples = [
    {
      title: "Consulta general",
      description: "Resumen de consulta del 15/09/2025",
    },
    {
      title: "Análisis de laboratorio",
      description: "Perfil lipídico y hemograma completo",
    },
    {
      title: "Informe de radiografía",
      description: "RX de tórax - control trimestral",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader subtitle="Visualización de historia clínica" />
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((d, idx) => (
            <DocumentCard
              key={idx}
              title={d.title}
              description={d.description}
              rightIcon={<FileText className="h-5 w-5" />}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
