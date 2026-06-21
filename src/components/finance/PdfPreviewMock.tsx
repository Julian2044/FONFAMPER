import { Download, Maximize2, ZoomIn } from "lucide-react";

export function PdfPreviewMock() {
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
            <h3 className="text-xl font-extrabold text-slate-950">Estado de cuenta</h3>
            <p className="mt-2 text-sm text-slate-600">Periodo: Enero 2023 - Enero 2023</p>
            <p className="text-sm text-slate-600">Fecha de emisión: 15 ene 2023</p>
          </div>
          <div className="mt-6 space-y-2 text-sm text-slate-700">
            <p>Titular: Camilo Perez</p>
            <p>Documento: C.C. 1.234.567.890</p>
          </div>
          <div className="mt-8 rounded-xl bg-slate-50 p-4">
            <p className="font-bold text-slate-950">Resumen de saldos</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span>Saldo inicial</span><span>$900.000</span></div>
              <div className="flex justify-between"><span>Aportes</span><span>$50.000</span></div>
              <div className="flex justify-between font-bold text-[#062b5f]"><span>Saldo final</span><span>$950.000</span></div>
            </div>
          </div>
          <div className="mt-8">
            <p className="font-bold text-slate-950">Detalle de movimientos</p>
            <div className="mt-3 h-24 rounded-lg border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
