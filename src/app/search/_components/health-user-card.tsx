import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { HealthUser } from "@/lib/types";

interface HealthUserCardProps {
  user: HealthUser;
}

export function HealthUserCard({ user }: HealthUserCardProps) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const details = [
    user.document ? `Doc ${user.document}` : undefined,
    user.email,
    user.phone,
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
          {fullName || "Unnamed User"}
        </h3>
        {details && <p className="text-sm text-muted-foreground">{details}</p>}
        {user.address && (
          <p className="text-sm text-muted-foreground">
            Address: {user.address}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Created: {formatDate(user.createdAt)}
        </p>
      </div>
    </Card>
  );
}
