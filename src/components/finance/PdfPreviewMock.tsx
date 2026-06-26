import { Download, Maximize2, ZoomIn } from "lucide-react";
import { formatCurrencyCOP, formatDate, formatDocumentId } from "@/lib/fonfamper/format";

type PdfPreviewMockProps = {
  title?: string;
  period?: string;
  emissionDate?: string;
  holderName?: string;
  documentId?: string;
  initialBalance?: number;
  contributions?: number;
  utilities?: number;
  finalBalance?: number;
  movements?: Array<{
    concept: string;
    date: string;
    value: number;
  }>;
};

export function PdfPreviewMock({
  title = "Estado de cuenta",
  period = "Enero 2023 - Enero 2023",
  emissionDate = "15 ene 2023",
  holderName = "Camilo Perez",
  documentId = "1.234.567.890",
  initialBalance = 900000,
  contributions = 50000,
  utilities = 0,
  finalBalance = 950000,
  movements = []
}: PdfPreviewMockProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-xs font-semibold text-white">
        <span>1/1</span>
        <div className="flex items-center gap-3">
          <span>100%</span>
          <ZoomIn className="h-4 w-4" />
          <Download className="h-4 w-4" />
          <Maximize2 className="h-4 w-4" />
        </div>
      </div>
      <div className="p-5">
        <div className="mx-auto min-h-[560px] max-w-md rounded bg-white p-8 shadow-lg">
          <p className="text-2xl font-extrabold text-[#062b5f]">FONFAMPER</p>
          <p className="text-sm text-slate-500">Fondo de Ahorro Familiar</p>
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-xl font-extrabold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">Periodo: {period}</p>
            <p className="text-sm text-slate-600">Fecha de emisión: {emissionDate}</p>
          </div>
          <div className="mt-6 space-y-2 text-sm text-slate-700">
            <p>Titular: {holderName}</p>
            <p>Documento: {formatDocumentId(documentId)}</p>
          </div>
          <div className="mt-8 rounded-xl bg-slate-50 p-4">
            <p className="font-bold text-slate-950">Resumen de saldos</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span>Saldo inicial</span><span>{formatCurrencyCOP(initialBalance)}</span></div>
              <div className="flex justify-between"><span>Aportes</span><span>{formatCurrencyCOP(contributions)}</span></div>
              <div className="flex justify-between"><span>Utilidades</span><span>{formatCurrencyCOP(utilities)}</span></div>
              <div className="flex justify-between font-bold text-[#062b5f]"><span>Saldo final</span><span>{formatCurrencyCOP(finalBalance)}</span></div>
            </div>
          </div>
          <div className="mt-8">
            <p className="font-bold text-slate-950">Detalle de movimientos</p>
            <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
              {movements.slice(0, 3).map((movement) => (
                <div key={`${movement.concept}-${movement.date}`} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="min-w-0 truncate">{movement.concept}</span>
                  <span className="whitespace-nowrap">{formatDate(movement.date)}</span>
                  <span className="whitespace-nowrap font-semibold text-slate-950">{formatCurrencyCOP(movement.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
