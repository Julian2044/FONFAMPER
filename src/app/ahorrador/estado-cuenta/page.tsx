import { Download, Search } from "lucide-react";
import { MovementTable } from "@/components/finance/MovementTable";
import { PdfPreviewMock } from "@/components/finance/PdfPreviewMock";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { camiloAccount } from "@/data/demo/camilo";
import { formatCOP } from "@/lib/format";

export default function SaverStatementPage() {
  const { summary, movements } = camiloAccount;

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Estado de cuenta</h2>
        <p className="mt-2 text-base text-slate-500">Consulta y descarga el resumen de tu periodo.</p>
      </div>

      <Card className="min-w-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">Desde</span>
            <Select defaultValue="enero-2023"><option value="enero-2023">Enero 2023</option></Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">Hasta</span>
            <Select defaultValue="enero-2023"><option value="enero-2023">Enero 2023</option></Select>
          </label>
          <Button><Search className="h-4 w-4" />Consultar</Button>
          <Button variant="secondary"><Download className="h-4 w-4" />Descargar PDF</Button>
        </div>
      </Card>

      <Card className="min-w-0">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["Titular", "Camilo Perez"],
            ["Periodo", "Enero 2023 - Enero 2023"],
            ["Saldo inicial", formatCOP(summary.previousBalance)],
            ["Aportes", formatCOP(summary.januaryContribution)],
            ["Utilidades", formatCOP(summary.utilities)],
            ["Saldo final", formatCOP(summary.currentBalance)]
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-2 whitespace-nowrap text-sm font-extrabold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Retiros</p><p className="mt-2 font-extrabold">{formatCOP(summary.withdrawals)}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ajustes</p><p className="mt-2 font-extrabold">{formatCOP(summary.adjustments)}</p></div>
        </div>
      </Card>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <Card className="min-w-0">
          <h3 className="mb-5 text-lg font-extrabold text-slate-950">Detalle de movimientos</h3>
          <MovementTable movements={movements} />
          <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold sm:flex-row">
            <span>Totales del periodo</span>
            <span className="whitespace-nowrap">{formatCOP(50000)} | {formatCOP(950000)}</span>
          </div>
        </Card>
        <PdfPreviewMock />
      </div>
    </div>
  );
}
