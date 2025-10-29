import { AppHeader } from "@/app/_components/app-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AccessPoliciesPage() {
  // Datos de ejemplo (moqueados)
  const requests = [
    {
      ci: "4.987.654-3",
      name: "Sofía Martínez",
      clinic: "Clínica Central",
      specialty: "Cardiología",
      documentTitle: "Electrocardiograma",
    },
    {
      ci: "1.234.567-0",
      name: "Diego López",
      clinic: "Sanatorio del Este",
      specialty: "Neurología",
      documentTitle: "Resonancia magnética",
    },
    {
      ci: "6.543.210-9",
      name: "Valentina Silva",
      clinic: "Hospital Norte",
      specialty: "Traumatología",
      documentTitle: "Informe de RX de hombro",
    },
    {
      ci: "8.765.432-1",
      name: "Matías Romero",
      clinic: "Policlínica Sur",
      specialty: "Dermatología",
      documentTitle: "Biopsia de piel",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader subtitle="Gestión de políticas de accesos" />
      <main className="container mx-auto px-6 py-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CI</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-white">{r.ci}</TableCell>
                <TableCell className="text-white">{r.name}</TableCell>
                <TableCell className="text-white">{r.clinic}</TableCell>
                <TableCell className="text-white">{r.specialty}</TableCell>
                <TableCell className="text-white">{r.documentTitle}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm">Aceptar</Button>
                    <Button size="sm" variant="destructive">Rechazar</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
