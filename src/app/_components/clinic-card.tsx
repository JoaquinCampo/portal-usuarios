import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { Clinic } from "@/lib/types";

interface ClinicCardProps {
  clinic: Clinic;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const details = [clinic.email, clinic.address, clinic.type]
    .filter(Boolean)
    .join(" · ");

  const formatDate = (dateString: string) => {
    return format(new Date(`${dateString}T00:00:00.000Z`), "MMM d, yyyy");
  };

  return (
    <Card className="border-border bg-card p-4 transition-colors hover:bg-accent/5">
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">{clinic.name}</h3>
        {details && <p className="text-sm text-muted-foreground">{details}</p>}
        {clinic.phone && (
          <p className="text-sm text-muted-foreground">Phone: {clinic.phone}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Created: {formatDate(clinic.createdAt)}
        </p>
      </div>
    </Card>
  );
}
