"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitClinicAccessPolicy, submitHealthWorkerAccessPolicy } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Feedback {
  ok: boolean;
  message: string;
}

type ClinicOption = {
  id?: string;
  name?: string;
};

function clinicValue(option?: ClinicOption | null) {
  if (!option) return "";
  return option.name ?? option.id ?? "";
}

function clinicLabel(option?: ClinicOption | null) {
  if (!option) return "Clinica sin nombre";
  return option.name ?? option.id ?? "Clinica sin nombre";
}

export function AccessPolicyForms() {
  const [clinicName, setClinicName] = useState("");

  const [healthWorkerCi, setHealthWorkerCi] = useState("");
  const [workerClinicName, setWorkerClinicName] = useState("");

  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [clinicsError, setClinicsError] = useState<string | null>(null);

  const [feedbackClinic, setFeedbackClinic] = useState<Feedback | null>(null);
  const [feedbackWorker, setFeedbackWorker] = useState<Feedback | null>(null);
  const [pendingClinic, startClinic] = useTransition();
  const [pendingWorker, startWorker] = useTransition();
  const router = useRouter();
  const refreshDelayMs = 1500;

  useEffect(() => {
    let cancelled = false;

    async function loadClinics() {
      setLoadingClinics(true);
      setClinicsError(null);
      try {
        const res = await fetch("/api/clinics", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as ClinicOption[];
        if (cancelled) return;
        const normalized = Array.isArray(data) ? data.filter((item) => Boolean(clinicValue(item))) : [];
        setClinics(normalized);
        if (normalized.length > 0) {
          setClinicName((prev) => prev || clinicValue(normalized[0]));
          setWorkerClinicName((prev) => prev || clinicValue(normalized[0]));
        }
      } catch (error: any) {
        if (!cancelled) {
          setClinics([]);
          setClinicsError(error?.message ?? "No se pudieron cargar las clinicas");
        }
      } finally {
        if (!cancelled) {
          setLoadingClinics(false);
        }
      }
    }

    loadClinics();
    return () => {
      cancelled = true;
    };
  }, []);

  const clinicsUnavailable = !!clinicsError || (!loadingClinics && clinics.length === 0);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Clinic Access Policy */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Crear politica de acceso de clinica</h2>
        <form
          action={(formData) => {
            setFeedbackClinic(null);
            startClinic(async () => {
              const res = await submitClinicAccessPolicy({}, formData);
              setFeedbackClinic({ ok: !!res.ok, message: res.message });
              if (res.ok) {
                await new Promise((resolve) => setTimeout(resolve, refreshDelayMs));
                router.refresh();
              }
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">Clinica</label>
            <Select
              value={clinicName || undefined}
              onValueChange={setClinicName}
              disabled={loadingClinics || clinicsUnavailable}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClinics ? "Cargando clinicas..." : "Selecciona una clinica"} />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinicValue(clinic)} value={clinicValue(clinic)}>
                    {clinicLabel(clinic)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="clinicName" value={clinicName} />
            {clinicsError ? (
              <p className="text-xs text-red-600">{clinicsError}</p>
            ) : clinics.length === 0 && !loadingClinics ? (
              <p className="text-xs text-muted-foreground">No hay clinicas disponibles.</p>
            ) : null}
          </div>
          <Button type="submit" disabled={pendingClinic || !clinicName || clinicsUnavailable}>
            {pendingClinic ? "Creando..." : "Crear"}
          </Button>
          {feedbackClinic && (
            <p className={"text-sm " + (feedbackClinic.ok ? "text-green-600" : "text-red-600")} role="status">
              {feedbackClinic.message}
            </p>
          )}
        </form>
      </div>

      {/* Health Worker Access Policy */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Crear politica de acceso de profesional</h2>
        <form
          action={(formData) => {
            setFeedbackWorker(null);
            startWorker(async () => {
              const res = await submitHealthWorkerAccessPolicy({}, formData);
              setFeedbackWorker({ ok: !!res.ok, message: res.message });
              if (res.ok) {
                await new Promise((resolve) => setTimeout(resolve, refreshDelayMs));
                router.refresh();
              }
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">CI Profesional</label>
            <Input
              name="healthWorkerCi"
              value={healthWorkerCi}
              onChange={(e) => setHealthWorkerCi(e.target.value)}
              placeholder="Ej: 29876542"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Clinica</label>
            <Select
              value={workerClinicName || undefined}
              onValueChange={setWorkerClinicName}
              disabled={loadingClinics || clinicsUnavailable}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClinics ? "Cargando clinicas..." : "Selecciona una clinica"} />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={`${clinicValue(clinic)}-worker`} value={clinicValue(clinic)}>
                    {clinicLabel(clinic)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="clinicName" value={workerClinicName} />
            {clinicsError ? (
              <p className="text-xs text-red-600">{clinicsError}</p>
            ) : clinics.length === 0 && !loadingClinics ? (
              <p className="text-xs text-muted-foreground">No hay clinicas disponibles.</p>
            ) : null}
          </div>
          <Button type="submit" disabled={pendingWorker || !workerClinicName || clinicsUnavailable}>
            {pendingWorker ? "Creando..." : "Crear"}
          </Button>
          {feedbackWorker && (
            <p className={"text-sm " + (feedbackWorker.ok ? "text-green-600" : "text-red-600")} role="status">
              {feedbackWorker.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
