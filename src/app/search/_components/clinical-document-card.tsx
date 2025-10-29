import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { ClinicalDocument } from "@/lib/types";

interface ClinicalDocumentCardProps {
  document: ClinicalDocument;
}

export function ClinicalDocumentCard({ document }: ClinicalDocumentCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(`${dateString}T00:00:00.000Z`), "MMM d, yyyy");
  };

  return (
    <Card className="border-border bg-card p-4 transition-colors hover:bg-accent/5">
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">{document.title}</h3>
        {document.contentUrl && (
          <p className="text-sm text-muted-foreground">
            URL: {document.contentUrl}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Issued: {formatDate(document.createdAt)}
        </p>
      </div>
    </Card>
  );
}
