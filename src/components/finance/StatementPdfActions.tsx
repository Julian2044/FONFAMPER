"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, FileDown, Loader2, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type StatementPdfActionsProps = {
  pdfHref: string | null;
  disabled?: boolean;
  className?: string;
  triggerLabel?: string;
};

type GeneratedPdf = {
  blob: Blob;
  file: File;
  objectUrl: string;
  filename: string;
};

function parseFilenameFromContentDisposition(value: string | null) {
  if (!value) {
    return null;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const filenameMatch = value.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1]?.trim() ?? null;
}

function fallbackFilename() {
  const today = new Date();
  const date = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  return `estado-cuenta-${date}.pdf`;
}

function isShareSupported(file: File) {
  if (typeof navigator === "undefined") {
    return false;
  }

  if (!("share" in navigator) || typeof navigator.share !== "function") {
    return false;
  }

  if (!("canShare" in navigator) || typeof navigator.canShare !== "function") {
    return false;
  }

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as { errors?: unknown };
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map((error) => String(error)).join(" ");
      }
    } catch {
      // Fall through to generic error.
    }
  }

  return "No fue posible generar el PDF del estado de cuenta.";
}

export function StatementPdfActions({
  pdfHref,
  disabled = false,
  className,
  triggerLabel = "Generar PDF"
}: StatementPdfActionsProps) {
  const [mounted, setMounted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<GeneratedPdf | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (generatedPdf) {
        URL.revokeObjectURL(generatedPdf.objectUrl);
      }
    };
  }, [generatedPdf]);

  useEffect(() => {
    if (sheetOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }

    return undefined;
  }, [sheetOpen]);

  useEffect(() => {
    if (!sheetOpen || !mounted) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSheetOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mounted, sheetOpen]);

  useEffect(() => {
    setSheetOpen(false);
    setError(null);
    setGeneratedPdf((current) => {
      if (current) {
        URL.revokeObjectURL(current.objectUrl);
      }
      return null;
    });
  }, [pdfHref]);

  const canShareFile = useMemo(() => {
    if (!generatedPdf) {
      return false;
    }

    return isShareSupported(generatedPdf.file);
  }, [generatedPdf]);

  async function generatePdf() {
    if (!pdfHref || disabled || generating) {
      return;
    }

    if (generatedPdf) {
      setSheetOpen(true);
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(pdfHref, {
        cache: "no-store",
        headers: {
          Accept: "application/pdf"
        }
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const blob = await response.blob();
      const filename = parseFilenameFromContentDisposition(response.headers.get("content-disposition")) ?? fallbackFilename();
      const objectUrl = URL.createObjectURL(blob);
      const file = new File([blob], filename, { type: "application/pdf" });

      setGeneratedPdf({ blob, file, objectUrl, filename });
      setSheetOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible generar el PDF del estado de cuenta.";
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  function downloadPdf() {
    if (!generatedPdf) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = generatedPdf.objectUrl;
    anchor.download = generatedPdf.filename;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function sharePdf() {
    if (!generatedPdf || !canShareFile || !navigator.share) {
      return;
    }

    try {
      await navigator.share({
        files: [generatedPdf.file],
        title: "Estado de cuenta FONFAMPER",
        text: "Estado de cuenta generado desde FONFAMPER"
      });
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "AbortError" || name === "NotAllowedError") {
        return;
      }

      setError("No se pudo compartir el PDF.");
    }
  }

  function openPdf() {
    if (!generatedPdf) {
      return;
    }

    window.open(generatedPdf.objectUrl, "_blank", "noopener,noreferrer");
  }

  const sheet = sheetOpen && mounted && generatedPdf ? createPortal(
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center bg-slate-950/50 px-3 pt-3 backdrop-blur-[2px] md:items-center md:px-4 md:pb-4"
      role="presentation"
      onClick={() => setSheetOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Acciones del PDF"
        className={cn(
          "flex max-h-[70vh] w-[min(430px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.34)]",
          "md:max-h-[78vh] md:rounded-[32px]"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4">
          <div className="min-w-0">
            <p className="text-base font-extrabold text-slate-950">PDF listo</p>
            <p className="mt-1 break-words text-xs font-semibold text-slate-500">{generatedPdf.filename}</p>
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <p className="text-sm text-slate-500">Elige cómo usar el archivo ahora que ya está generado.</p>

          {canShareFile ? (
            <Button className="w-full justify-start" onClick={sharePdf} type="button" variant="secondary">
              <Share2 className="h-4 w-4" />
              Compartir PDF
            </Button>
          ) : null}

          <Button className="w-full justify-start" onClick={downloadPdf} type="button" variant="secondary">
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>

          <Button className="w-full justify-start" onClick={openPdf} type="button" variant="secondary">
            <ExternalLink className="h-4 w-4" />
            Abrir PDF
          </Button>
        </div>

        <div className="border-t border-slate-100 p-4">
          <Button className="w-full" onClick={() => setSheetOpen(false)} type="button">
            Cerrar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <Button
        className={className ?? "w-full sm:w-auto"}
        disabled={disabled || generating || !pdfHref}
        onClick={() => {
          void generatePdf();
        }}
        type="button"
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        {generating ? "Generando PDF..." : triggerLabel}
      </Button>

      {error ? (
        <p className="mt-2 text-sm font-semibold text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {sheet}
    </>
  );
}
