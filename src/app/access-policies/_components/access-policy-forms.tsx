"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  submitClinicAccessPolicy,
  submitHealthWorkerAccessPolicy,
  submitSpecialtyAccessPolicy,
} from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatHcenError } from "@/lib/hcen-connectivity";

interface Feedback {
  ok: boolean;
  message: string;
}

type ClinicOption = {
  id?: string;
  name?: string;
};

type RawHealthWorkerOption = {
  ci?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

type HealthWorkerOption = {
  ci: string;
  firstName?: string;
  lastName?: string;
};

function clinicValue(option?: ClinicOption | null) {
  if (!option) return "";
  return option.name ?? option.id ?? "";
}

function clinicLabel(option?: ClinicOption | null) {
  if (!option) return "Clinica sin nombre";
  return option.name ?? option.id ?? "Clinica sin nombre";
}

function healthWorkerLabel(option?: HealthWorkerOption | null) {
  if (!option) return "Profesional sin datos";
  const name = [option.firstName, option.lastName].filter(Boolean).join(" ").trim();
  if (name && option.ci) {
    return `${name} (CI ${option.ci})`;
  }
  if (name) return name;
  return option.ci ? `CI ${option.ci}` : "Profesional sin datos";
}

export function AccessPolicyForms() {
  const [clinicName, setClinicName] = useState("");
  const [workerClinicName, setWorkerClinicName] = useState("");
  const [selectedWorkerCi, setSelectedWorkerCi] = useState("");
  const [specialtyName, setSpecialtyName] = useState("");

  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [clinicsError, setClinicsError] = useState<string | null>(null);

  const [healthWorkers, setHealthWorkers] = useState<HealthWorkerOption[]>([]);
  const [loadingHealthWorkers, setLoadingHealthWorkers] = useState(false);
  const [healthWorkersError, setHealthWorkersError] = useState<string | null>(null);

  const [feedbackClinic, setFeedbackClinic] = useState<Feedback | null>(null);
  const [feedbackWorker, setFeedbackWorker] = useState<Feedback | null>(null);
  const [feedbackSpecialty, setFeedbackSpecialty] = useState<Feedback | null>(null);
  const [pendingClinic, startClinic] = useTransition();
  const [pendingWorker, startWorker] = useTransition();
  const [pendingSpecialty, startSpecialty] = useTransition();
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
          throw new Error(formatHcenError(res.status, undefined, `HTTP ${res.status}`));
        }
        const data = (await res.json()) as ClinicOption[];
        if (cancelled) return;
        const normalized = Array.isArray(data) ? data.filter((item) => Boolean(clinicValue(item))) : [];
        setClinics(normalized);
        if (normalized.length > 0) {
          setClinicName((prev) => prev || clinicValue(normalized[0]));
          setWorkerClinicName((prev) => prev || clinicValue(normalized[0]));
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setClinics([]);
          const message = error instanceof Error ? error.message : String(error);
          setClinicsError(formatHcenError(undefined, message, "No se pudieron cargar las clinicas"));
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

  useEffect(() => {
    if (!workerClinicName) {
      setHealthWorkers([]);
      setSelectedWorkerCi("");
      setHealthWorkersError(null);
      return;
    }

    let cancelled = false;
    async function loadHealthWorkers() {
      setLoadingHealthWorkers(true);
      setHealthWorkersError(null);
      try {
        const res = await fetch(`/api/clinics/${encodeURIComponent(workerClinicName)}/health-workers`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(formatHcenError(res.status, undefined, `HTTP ${res.status}`));
        }
        const data = (await res.json()) as RawHealthWorkerOption[];
        if (cancelled) return;
        const normalized = Array.isArray(data)
          ? data.reduce<HealthWorkerOption[]>((acc, worker) => {
              if (!worker || typeof worker.ci !== "string") {
                return acc;
              }
              const ci = worker.ci.trim();
              if (!ci) {
                return acc;
              }
              acc.push({
                ci,
                firstName: worker.firstName ?? undefined,
                lastName: worker.lastName ?? undefined,
              });
              return acc;
            }, [])
          : [];
        setHealthWorkers(normalized);
        setSelectedWorkerCi((prev) => {
          if (prev && normalized.some((worker) => worker.ci === prev)) {
            return prev;
          }
          return normalized[0]?.ci ?? "";
        });
      } catch (error: unknown) {
        if (!cancelled) {
          setHealthWorkers([]);
          setSelectedWorkerCi("");
          const message = error instanceof Error ? error.message : String(error);
          setHealthWorkersError(
            formatHcenError(undefined, message, "No se pudieron cargar los profesionales"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHealthWorkers(false);
        }
      }
    }

    loadHealthWorkers();
    return () => {
      cancelled = true;
    };
  }, [workerClinicName]);

  const clinicsUnavailable = !!clinicsError || (!loadingClinics && clinics.length === 0);

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="space-y-1">
            <label className="text-sm font-medium">Profesional</label>
            <Select
              value={selectedWorkerCi || undefined}
              onValueChange={setSelectedWorkerCi}
              disabled={
                !workerClinicName ||
                loadingClinics ||
                clinicsUnavailable ||
                loadingHealthWorkers ||
                (!loadingHealthWorkers && healthWorkers.length === 0)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingHealthWorkers
                      ? "Cargando profesionales..."
                      : "Selecciona un profesional"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {healthWorkers.map((worker) => (
                  <SelectItem key={worker.ci} value={worker.ci ?? ""}>
                    {healthWorkerLabel(worker)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="healthWorkerCi" value={selectedWorkerCi} />
            {healthWorkersError ? (
              <p className="text-xs text-red-600">{healthWorkersError}</p>
            ) : healthWorkers.length === 0 && workerClinicName && !loadingHealthWorkers ? (
              <p className="text-xs text-muted-foreground">No hay profesionales disponibles.</p>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={
              pendingWorker ||
              !workerClinicName ||
              clinicsUnavailable ||
              !selectedWorkerCi ||
              loadingHealthWorkers
            }
          >
            {pendingWorker ? "Creando..." : "Crear"}
          </Button>
          {feedbackWorker && (
            <p className={"text-sm " + (feedbackWorker.ok ? "text-green-600" : "text-red-600")} role="status">
              {feedbackWorker.message}
            </p>
          )}
        </form>
      </div>

      {/* Specialty Access Policy */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Crear politica de acceso por especialidad</h2>
        <form
          action={(formData) => {
            setFeedbackSpecialty(null);
            startSpecialty(async () => {
              const res = await submitSpecialtyAccessPolicy({}, formData);
              setFeedbackSpecialty({ ok: !!res.ok, message: res.message });
              if (res.ok) {
                setSpecialtyName("");
                await new Promise((resolve) => setTimeout(resolve, refreshDelayMs));
                router.refresh();
              }
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre de especialidad</label>
            <Input
              name="specialtyName"
              value={specialtyName}
              onChange={(e) => setSpecialtyName(e.target.value)}
              placeholder="Ej: Cardiologia"
              required
            />
          </div>
          <Button type="submit" disabled={pendingSpecialty || !specialtyName.trim()}>
            {pendingSpecialty ? "Creando..." : "Crear"}
          </Button>
          {feedbackSpecialty && (
            <p className={"text-sm " + (feedbackSpecialty.ok ? "text-green-600" : "text-red-600")} role="status">
              {feedbackSpecialty.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
