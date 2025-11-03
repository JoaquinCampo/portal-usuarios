import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const REQUESTS = [
  {
    ci: "4.987.654-3",
    name: "Sofia Martinez",
    clinic: "Clinica Central",
    specialty: "Cardiologia",
  },
  {
    ci: "1.234.567-0",
    name: "Diego Lopez",
    clinic: "Sanatorio del Este",
    specialty: "Neurologia",
  },
  {
    ci: "6.543.210-9",
    name: "Valentina Silva",
    clinic: "Hospital Norte",
    specialty: "Traumatologia",
  },
  {
    ci: "8.765.432-1",
    name: "Matias Romero",
    clinic: "Policlinica Sur",
    specialty: "Dermatologia",
  },
];

export default function AccessPoliciesPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader
        subtitle="Gestion de politicas de acceso"
        rightSlot={<SignOutButton />}
      />
      <main className="container mx-auto px-6 py-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CI</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Clinica</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REQUESTS.map((request, index) => (
              <TableRow key={`${request.ci}-${index}`}>
                <TableCell className="text-white">{request.ci}</TableCell>
                <TableCell className="text-white">{request.name}</TableCell>
                <TableCell className="text-white">{request.clinic}</TableCell>
                <TableCell className="text-white">{request.specialty}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm">Aceptar</Button>
                    <Button size="sm" variant="destructive">
                      Rechazar
                    </Button>
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
