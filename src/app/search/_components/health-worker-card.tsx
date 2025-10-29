import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { HealthWorker } from "@/lib/types";

interface HealthWorkerCardProps {
  worker: HealthWorker;
}

export function HealthWorkerCard({ worker }: HealthWorkerCardProps) {
  const fullName = [worker.firstName, worker.lastName]
    .filter(Boolean)
    .join(" ");
  const details = [
    worker.licenseNumber ? `License ${worker.licenseNumber}` : undefined,
    worker.email,
    worker.phone,
  ]
    .filter(Boolean)
    .join(" · ");

  const formatDate = (dateString: string) => {
    return format(new Date(`${dateString}T00:00:00.000Z`), "MMM d, yyyy");
  };

  return (
    <Card className="border-border bg-card p-4 transition-colors hover:bg-accent/5">
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">
          {fullName || "Unnamed Worker"}
        </h3>
        {details && <p className="text-sm text-muted-foreground">{details}</p>}
        {worker.address && (
          <p className="text-sm text-muted-foreground">
            Address: {worker.address}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Created: {formatDate(worker.createdAt)}
        </p>
      </div>
    </Card>
  );
}
