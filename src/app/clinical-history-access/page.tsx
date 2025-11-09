import { History as HistoryIcon } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ACCESS_LOG = [
  {
    ci: "4.567.890-1",
    name: "Maria Gonzalez",
    clinic: "Clinica Central",
    specialty: "Cardiologia",
    documentTitle: "Electrocardiograma",
  },
  {
    ci: "3.210.987-4",
    name: "Juan Perez",
    clinic: "Sanatorio del Este",
    specialty: "Pediatria",
    documentTitle: "Control de crecimiento",
  },
  {
    ci: "5.432.109-8",
    name: "Lucia Fernandez",
    clinic: "Hospital Norte",
    specialty: "Traumatologia",
    documentTitle: "Informe de RX de rodilla",
  },
  {
    ci: "2.345.678-9",
    name: "Carlos Rodriguez",
    clinic: "Policlinica Sur",
    specialty: "Dermatologia",
    documentTitle: "Biopsia de piel",
  },
];

export default function ClinicalHistoryAccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        subtitle="Visualizacion de accesos a historia clinica"
        rightSlot={<SignOutButton />}
      />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-4 flex items-center gap-2 text-muted-foreground">
          <HistoryIcon className="h-4 w-4" />
          <span className="text-sm">
            Mostrando accesos recientes (datos de ejemplo)
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CI</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Clinica</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Documento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ACCESS_LOG.map((entry, index) => (
              <TableRow key={`${entry.ci}-${index}`}>
                <TableCell className="text-foreground">{entry.ci}</TableCell>
                <TableCell className="text-foreground">{entry.name}</TableCell>
                <TableCell className="text-foreground">{entry.clinic}</TableCell>
                <TableCell className="text-foreground">{entry.specialty}</TableCell>
                <TableCell className="text-foreground">
                  {entry.documentTitle}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
