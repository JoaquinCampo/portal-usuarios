"use client";

import { useState } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { Eye, Download } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Clinic = {
  name: string;
  address?: string | null;
};

type HealthWorker = {
  firstName: string;
  lastName: string;
  email?: string | null;
};

type ClinicalDocument = {
  clinic: Clinic;
  healthWorker: HealthWorker;
  createdAt: string;
  s3Url: string;
};

type HealthUser = {
  ci: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth: string;
};

type ClinicalHistoryResponse = {
  healthUser: HealthUser;
  documents: ClinicalDocument[];
};

function toLocalDate(input: string): Date {
  // Fallback local parser for ISO-like strings without timezone
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? new Date(Date.parse(input)) : d;
}


export function ClinicalHistorySearch() {
  const [ci, setCi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthUser, setHealthUser] = useState<HealthUser | null>(null);
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);

  const onSearch = async () => {
    setError(null);
    setDocuments([]);
    setHealthUser(null);

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
        const msg = (data as { error?: string })?.error || `Error ${resp.status}`;
        setError(msg);
        return;
      }

      const result = data as ClinicalHistoryResponse;
      setHealthUser(result.healthUser);
      setDocuments(result.documents ?? []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {healthUser ? (
        <div>
          <h1 className="text-3xl font-bold">Historia Clínica</h1>
          <p className="text-muted-foreground mt-2">
            Historial clínico de {healthUser.firstName} {healthUser.lastName}
          </p>
        </div>
      ) : null}

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

      {error ? <div className="text-sm text-red-400">{error}</div> : null}

      {healthUser ? (
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Información del Usuario</h2>
            <p className="text-muted-foreground text-sm">
              Datos personales del usuario de salud
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Nombre Completo</p>
              <p className="text-base font-semibold">
                {healthUser.firstName} {healthUser.lastName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">CI</p>
              <p className="font-mono text-base font-semibold">{healthUser.ci}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Email</p>
              <p className="text-base">{healthUser.email ?? "No disponible"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Teléfono</p>
              <p className="text-base">{healthUser.phone ?? "No disponible"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Dirección</p>
              <p className="text-base">{healthUser.address ?? "No disponible"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Fecha de Nacimiento</p>
              <p className="text-base">
                {format(toLocalDate(healthUser.dateOfBirth), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabla de documentos clínicos */}
      <div className="overflow-hidden rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b">
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Fecha</th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Clínica</th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Profesional</th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Documento</th>
              <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {documents.length ? (
              documents.map((doc, i) => (
                <tr key={i} className="hover:bg-muted/50 border-b transition-colors">
                  <td className="p-2 align-middle whitespace-nowrap">
                    {format(toLocalDate(doc.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{doc.clinic.name}</div>
                      {doc.clinic.address ? (
                        <div className="text-muted-foreground text-xs">{doc.clinic.address}</div>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {doc.healthWorker.firstName} {doc.healthWorker.lastName}
                      </div>
                      {doc.healthWorker.email ? (
                        <div className="text-muted-foreground text-xs">{doc.healthWorker.email}</div>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">✓ Disponible</Badge>
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild className="gap-2">
                        <Link href={doc.s3Url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="gap-2">
                        <Link href={doc.s3Url} download>
                          <Download className="h-4 w-4" />
                          Descargar
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="h-24 text-center p-2" colSpan={5}>No hay resultados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
