import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ClinicInfo = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

type HealthWorkerInfo = {
  ci?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  specialty?: { name?: string | null } | null;
};

export type ClinicalDocument = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  content?: string | null;
  contentType?: string | null;
  contentUrl?: string | null;
  clinic?: ClinicInfo | null;
  healthWorker?: HealthWorkerInfo | null;
  createdAt?: string | null;
};

interface DocumentCardProps {
  document: ClinicalDocument;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Sin fecha";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return format(parsed, "d 'de' MMMM 'de' yyyy HH:mm", { locale: es });
}

function formatWorker(worker?: HealthWorkerInfo | null): string {
  if (!worker) {
    return "Profesional no disponible";
  }
  const name = [worker.firstName, worker.lastName].filter(Boolean).join(" ").trim();
  if (name.length && worker.ci) {
    return `${name} · CI ${worker.ci}`;
  }
  if (name.length) {
    return name;
  }
  return worker.ci ? `CI ${worker.ci}` : "Profesional no disponible";
}

function truncate(text?: string | null, limit = 280): string | null {
  if (!text) {
    return null;
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).trim()}...`;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const { clinic, healthWorker } = document;
  const snippet = truncate(document.content);
  const hasLink = Boolean(document.contentUrl);

  return (
    <Card className="border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Documento</p>
          <h3 className="text-lg font-semibold text-foreground">
            {document.title?.trim() || "Documento sin título"}
          </h3>
          {document.description ? (
            <p className="text-sm text-muted-foreground">{document.description}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-2 text-sm md:items-end">
          {document.contentType ? (
            <Badge variant="outline" className="w-fit border-blue-200 bg-blue-50 text-blue-700">
              {document.contentType}
            </Badge>
          ) : null}
          <span className="text-muted-foreground">{formatDate(document.createdAt)}</span>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Clínica</dt>
          <dd className="font-medium text-foreground">{clinic?.name ?? "No especificada"}</dd>
          {clinic?.address ? <p className="text-xs text-muted-foreground">{clinic.address}</p> : null}
        </div>
        <div>
          <dt className="text-muted-foreground">Profesional</dt>
          <dd className="font-medium text-foreground">{formatWorker(healthWorker)}</dd>
          {healthWorker?.specialty?.name ? (
            <p className="text-xs text-muted-foreground">{healthWorker.specialty.name}</p>
          ) : null}
        </div>
        <div>
          <dt className="text-muted-foreground">Contacto</dt>
          <dd className="font-medium text-foreground">{clinic?.email ?? healthWorker?.email ?? "No disponible"}</dd>
          {clinic?.phone ? (
            <p className="text-xs text-muted-foreground">Tel. {clinic.phone}</p>
          ) : null}
        </div>
      </dl>

      {snippet ? (
        <div className="mt-4 rounded-md border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          {snippet}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {document.contentUrl ? (
          <Button asChild size="sm">
            <a href={document.contentUrl} target="_blank" rel="noopener noreferrer">
              Ver documento
            </a>
          </Button>
        ) : (
          <Button type="button" size="sm" variant="outline" disabled={!hasLink}>
            Sin enlace disponible
          </Button>
        )}
      </div>
    </Card>
  );
}
