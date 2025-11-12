"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Status = "idle" | "loading" | "success" | "error";

export function NotificationsEndpointsForms() {
  // Shared
  const [ci, setCi] = useState("");

  // Register token
  const [token, setToken] = useState("");
  const [registerStatus, setRegisterStatus] = useState<Status>("idle");
  const [registerMsg, setRegisterMsg] = useState<string | null>(null);

  // Delete token
  const [delStatus, setDelStatus] = useState<Status>("idle");
  const [delMsg, setDelMsg] = useState<string | null>(null);

  // Subscribe/unsubscribe
  const [notificationType, setNotificationType] = useState<string>("ACCESS_REQUEST");
  const [subStatus, setSubStatus] = useState<Status>("idle");
  const [subMsg, setSubMsg] = useState<string | null>(null);

  // Preferences
  const [prefJson, setPrefJson] = useState<string | null>(null);
  const [prefStatus, setPrefStatus] = useState<Status>("idle");
  const [prefMsg, setPrefMsg] = useState<string | null>(null);

  const canSubmit = (val?: string) => (ci?.trim().length ?? 0) > 0 && (val === undefined || (val?.trim().length ?? 0) > 0);

  const postJson = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    return { ok: res.ok, status: res.status, data } as const;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-tight">Datos base</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">CI</label>
            <Input value={ci} onChange={(e) => setCi(e.target.value)} placeholder="Ej: 29876542" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">FCM Token</label>
            <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Ej: fcm-device-token" />
          </div>
        </div>
      </div>

      {/* Register/Update token */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-semibold">1) Registrar/actualizar token</h4>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              if (!canSubmit(token)) return;
              setRegisterStatus("loading");
              setRegisterMsg(null);
              const res = await postJson("/api/notifications/tokens", { userCi: ci.trim(), token: token.trim() });
              setRegisterStatus(res.ok ? "success" : "error");
              setRegisterMsg(res.ok ? "Token registrado/actualizado." : (res.data?.error ?? `HTTP ${res.status}`));
            }}
            disabled={!canSubmit(token) || registerStatus === "loading"}
          >
            {registerStatus === "loading" ? "Enviando..." : "Registrar/Actualizar"}
          </Button>
        </div>
        {registerMsg ? (
          <p className={`text-xs ${registerStatus === "success" ? "text-green-600" : "text-red-600"}`}>{registerMsg}</p>
        ) : null}
      </div>

      {/* Delete token */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-semibold">2) Eliminar token</h4>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={async () => {
              if (!canSubmit(token)) return;
              setDelStatus("loading");
              setDelMsg(null);
              const res = await fetch(`/api/notifications/tokens/${encodeURIComponent(ci.trim())}/${encodeURIComponent(token.trim())}`, {
                method: "DELETE",
              });
              setDelStatus(res.ok ? "success" : "error");
              setDelMsg(res.ok ? "Token eliminado (o no existia)." : `HTTP ${res.status}`);
            }}
            disabled={!canSubmit(token) || delStatus === "loading"}
          >
            {delStatus === "loading" ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
        {delMsg ? (
          <p className={`text-xs ${delStatus === "success" ? "text-green-600" : "text-red-600"}`}>{delMsg}</p>
        ) : null}
      </div>

      {/* Subscribe / Unsubscribe */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-semibold">3-4) Suscribirse / Desuscribirse</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tipo de notificación</label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACCESS_REQUEST">ACCESS_REQUEST</SelectItem>
                <SelectItem value="CLINICAL_HISTORY_ACCESS">CLINICAL_HISTORY_ACCESS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              if (!canSubmit(notificationType)) return;
              setSubStatus("loading");
              setSubMsg(null);
              const res = await postJson("/api/notifications/subscribe", {
                userCi: ci.trim(),
                notificationType: notificationType.trim(),
              });
              setSubStatus(res.ok ? "success" : "error");
              setSubMsg(res.ok ? "Suscrito correctamente." : (res.data?.error ?? `HTTP ${res.status}`));
            }}
            disabled={!canSubmit(notificationType) || subStatus === "loading"}
          >
            {subStatus === "loading" ? "Enviando..." : "Suscribirse"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              if (!canSubmit(notificationType)) return;
              setSubStatus("loading");
              setSubMsg(null);
              const res = await postJson("/api/notifications/unsubscribe", {
                userCi: ci.trim(),
                notificationType: notificationType.trim(),
              });
              setSubStatus(res.ok ? "success" : "error");
              setSubMsg(res.ok ? "Desuscripto correctamente." : (res.data?.error ?? `HTTP ${res.status}`));
            }}
            disabled={!canSubmit(notificationType) || subStatus === "loading"}
          >
            {subStatus === "loading" ? "Enviando..." : "Desuscribirse"}
          </Button>
        </div>
        {subMsg ? (
          <p className={`text-xs ${subStatus === "success" ? "text-green-600" : "text-red-600"}`}>{subMsg}</p>
        ) : null}
      </div>

      {/* Subscription preferences */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-semibold">5) Obtener preferencias</h4>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              if (!canSubmit()) return;
              setPrefStatus("loading");
              setPrefMsg(null);
              setPrefJson(null);
              const res = await fetch(`/api/notifications/subscription-preferences/${encodeURIComponent(ci.trim())}`);
              const text = await res.text();
              let data: any = null;
              try {
                data = text ? JSON.parse(text) : null;
              } catch {
                data = text;
              }
              if (!res.ok) {
                setPrefStatus("error");
                setPrefMsg(typeof data?.error === "string" ? data.error : `HTTP ${res.status}`);
              } else {
                setPrefStatus("success");
                setPrefJson(JSON.stringify(data, null, 2));
              }
            }}
            disabled={!canSubmit() || prefStatus === "loading"}
          >
            {prefStatus === "loading" ? "Consultando..." : "Consultar"}
          </Button>
        </div>
        {prefMsg ? <p className={`text-xs ${prefStatus === "success" ? "text-green-600" : "text-red-600"}`}>{prefMsg}</p> : null}
        {prefJson ? (
          <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-3 text-xs text-foreground">
            {prefJson}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

