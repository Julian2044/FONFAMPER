"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SupportData = {
  signedUrl: string;
  mimeType: string;
  originalFilename: string;
};

type MovementSupportModalProps = {
  attachmentId: string;
  filename?: string | null;
  label?: string;
  className?: string;
};

export function MovementSupportModal({ attachmentId, filename, label = "Ver soporte", className }: MovementSupportModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [support, setSupport] = useState<SupportData | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  async function openSupport() {
    setOpen(true);
    setLoading(true);
    setError(null);
    setSupport(null);

    try {
      const response = await fetch(`/api/movimientos/soporte?attachmentId=${encodeURIComponent(attachmentId)}&format=json`, {
        cache: "no-store"
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ? String(payload.error) : "No fue posible abrir el soporte.");
        return;
      }

      if (!payload?.signedUrl || !payload?.mimeType) {
        setError("No fue posible obtener el soporte.");
        return;
      }

      setSupport({
        signedUrl: String(payload.signedUrl),
        mimeType: String(payload.mimeType),
        originalFilename: String(payload.originalFilename ?? filename ?? "Soporte")
      });
    } catch {
      setError("No fue posible abrir el soporte.");
    } finally {
      setLoading(false);
    }
  }

  const displayName = support?.originalFilename ?? filename ?? "Soporte";
  const isPdf = support?.mimeType === "application/pdf";
  const isImage = support?.mimeType === "image/jpeg" || support?.mimeType === "image/png";

  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-xl bg-white px-3 text-sm font-bold text-[#004aad] ring-1 ring-[#0057d9]/25 transition hover:bg-blue-50",
          className
        )}
        onClick={openSupport}
      >
        {label}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Soporte de movimiento ${displayName}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-5xl min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex min-w-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h3 className="break-words text-base font-extrabold text-slate-950 sm:text-lg">Soporte de movimiento</h3>
                <p className="mt-1 break-words text-sm font-semibold text-slate-500">{displayName}</p>
              </div>
              <Button type="button" variant="ghost" className="shrink-0" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
                Cerrar
              </Button>
            </div>

            <div className="min-h-[320px] overflow-auto bg-slate-100 p-3 sm:p-5">
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-500">
                  Cargando soporte...
                </div>
              ) : null}

              {!loading && error ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm font-bold text-red-800">
                  {error}
                </div>
              ) : null}

              {!loading && !error && support && isPdf ? (
                <iframe className="h-[78vh] min-h-[520px] w-full rounded-xl border border-slate-200 bg-white" src={support.signedUrl} title={displayName} />
              ) : null}

              {!loading && !error && support && isImage ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="max-h-[75vh] max-w-full object-contain" src={support.signedUrl} alt={displayName} />
                </div>
              ) : null}

              {!loading && !error && support && !isPdf && !isImage ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-bold text-amber-900">
                  Este tipo de soporte no se puede previsualizar.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
