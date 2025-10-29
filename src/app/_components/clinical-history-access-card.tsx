import { Card } from "@/components/ui/card";

interface ClinicalHistoryAccessCardProps {
  ci: string;
  name: string;
  clinic: string;
  specialty: string;
  documentTitle: string;
}

export function ClinicalHistoryAccessCard({
  ci,
  name,
  clinic,
  specialty,
  documentTitle,
}: ClinicalHistoryAccessCardProps) {
  return (
    <Card className="border-border bg-card p-6">
      <div className="space-y-2">
        <h3 className="text-base font-medium text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">CI: {ci}</p>
        <p className="text-sm text-muted-foreground">Clínica: {clinic}</p>
        <p className="text-sm text-muted-foreground">Especialidad: {specialty}</p>
        <p className="text-sm text-muted-foreground">Documento: {documentTitle}</p>
      </div>
    </Card>
  );
}
