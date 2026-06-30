"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClientBrowser } from "@/lib/supabase/client";

type ChangePasswordFormProps = {
  homeHref: string;
};

function resolvePasswordError(error: unknown) {
  if (!error || typeof error !== "object") {
    return "No fue posible actualizar la contraseña.";
  }

  const value = error as { message?: unknown; name?: unknown; status?: unknown };
  const raw = [value.message, value.name, value.status].filter(Boolean).join(" ").toLowerCase();

  if (raw.includes("network") || raw.includes("fetch") || raw.includes("failed to fetch")) {
    return "Error de conexión. Intenta nuevamente.";
  }

  if (raw.includes("jwt") || raw.includes("session") || raw.includes("not authenticated") || raw.includes("unauthorized")) {
    return "Tu sesión expiró. Inicia sesión nuevamente para cambiar la contraseña.";
  }

  if (raw.includes("password")) {
    return "La nueva contraseña no cumple los requisitos de seguridad.";
  }

  return value.message ? String(value.message) : "No fue posible actualizar la contraseña.";
}

export function ChangePasswordForm({ homeHref }: ChangePasswordFormProps) {
  const supabase = useMemo(() => createClientBrowser(), []);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccess(false);

    if (!newPassword.trim()) {
      setErrorMessage("La nueva contraseña es obligatoria.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("La nueva contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setErrorMessage(resolvePasswordError(error));
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch {
      setErrorMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#004AAD]">
          <KeyRound className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">Cambiar contraseña</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Actualiza tu contraseña de acceso a FONFAMPER.</p>
        </div>
      </div>

      {success ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Contraseña actualizada correctamente.</p>
              <Link
                href={homeHref}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#0057d9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004aad]"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
          {errorMessage}
        </div>
      ) : null}

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Nueva contraseña</span>
          <Input
            autoComplete="new-password"
            minLength={8}
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Confirmar nueva contraseña</span>
          <Input
            autoComplete="new-password"
            minLength={8}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>

        <div className="grid gap-3 pt-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
          <Link
            href={homeHref}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#004aad] ring-1 ring-[#0057d9]/25 transition hover:bg-blue-50 sm:w-auto"
          >
            Volver
          </Link>
        </div>
      </form>
    </div>
  );
}
