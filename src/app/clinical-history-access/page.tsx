import { AppHeader } from "@/app/_components/app-header";
import { History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClinicalHistoryAccessPage() {
  // Datos de ejemplo (moqueados)
  const accesses = [
    {
      ci: "4.567.890-1",
      name: "María González",
      clinic: "Clínica Central",
      specialty: "Cardiología",
      documentTitle: "Electrocardiograma",
    },
    {
      ci: "3.210.987-4",
      name: "Juan Pérez",
      clinic: "Sanatorio del Este",
      specialty: "Pediatría",
      documentTitle: "Control de crecimiento",
    },
    {
      ci: "5.432.109-8",
      name: "Lucía Fernández",
      clinic: "Hospital Norte",
      specialty: "Traumatología",
      documentTitle: "Informe de RX de rodilla",
    },
    {
      ci: "2.345.678-9",
      name: "Carlos Rodríguez",
      clinic: "Policlínica Sur",
      specialty: "Dermatología",
      documentTitle: "Biopsia de piel",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader subtitle="Visualización de accesos a historia clínica" />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-4 flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          <span className="text-sm">
            Mostrando accesos recientes (datos de ejemplo)
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CI</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Documento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accesses.map((a, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-white">{a.ci}</TableCell>
                <TableCell className="text-white">{a.name}</TableCell>
                <TableCell className="text-white">{a.clinic}</TableCell>
                <TableCell className="text-white">{a.specialty}</TableCell>
                <TableCell className="text-white">{a.documentTitle}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
