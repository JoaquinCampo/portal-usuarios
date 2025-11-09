"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "./document-card";

type ClinicalDocument = {
  title?: string | null;
  description?: string | null;
  contentUrl?: string | null;
  contentType?: string | null;
  createdAt?: string | null;
};

type ClinicalHistoryResponse = {
  clinicalDocuments?: ClinicalDocument[];
};

export function ClinicalHistorySearch() {
  const [ci, setCi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);

  const onSearch = async () => {
    setError(null);
    setDocuments([]);

    const trimmed = ci.trim();
    if (!/^\d{8}$/.test(trimmed)) {
      setError("Ingresá una cédula válida (8 dígitos, sin puntos ni guiones)");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`/api/clinical-history?ci=${encodeURIComponent(trimmed)}`, {
        method: "GET",
      });
      const data = (await resp.json()) as ClinicalHistoryResponse | { error?: string };
      if (!resp.ok) {
        const msg = (data as any)?.error || `Error ${resp.status}`;
        setError(msg);
        return;
      }

      const docs = (data as ClinicalHistoryResponse)?.clinicalDocuments ?? [];
      setDocuments(docs);
    } catch (e: any) {
      setError(e?.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Cédula (8 dígitos)"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          inputMode="numeric"
          maxLength={8}
        />
        <Button type="button" onClick={onSearch} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.length === 0 && !loading ? (
          <div className="text-sm text-muted-foreground">Sin resultados</div>
        ) : null}

        {documents.map((doc, idx) => (
          <a
            key={idx}
            href={doc.contentUrl ?? undefined}
            target={doc.contentUrl ? "_blank" : undefined}
            rel={doc.contentUrl ? "noopener noreferrer" : undefined}
            className="no-underline"
          >
            <DocumentCard
              title={doc.title || "Documento clínico"}
              description={doc.description || doc.contentType || undefined}
              rightIcon={<FileText className="h-5 w-5" />}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
