import { Download, Search } from "lucide-react";
import { MovementTable } from "@/components/finance/MovementTable";
import { PdfPreviewMock } from "@/components/finance/PdfPreviewMock";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { getDemoAhorradorData } from "@/lib/fonfamper/ahorrador-data";
import { formatCurrencyCOP, formatDate, formatDateTime, formatDocumentId } from "@/lib/fonfamper/format";

export default async function SaverStatementPage() {
  const demoData = await getDemoAhorradorData();
  const profile = demoData.profile;
  const account = demoData.account;
  const orderedMovements = [...demoData.movements].sort((left, right) => new Date(`${left.date}T00:00:00`).getTime() - new Date(`${right.date}T00:00:00`).getTime());
  const firstMovement = orderedMovements[0] ?? null;
  const lastMovement = orderedMovements[orderedMovements.length - 1] ?? null;
  const adjustmentsTotal = orderedMovements.filter((movement) => movement.type === "Ajuste").reduce((total, movement) => total + movement.value, 0);
  const periodLabel = firstMovement && lastMovement ? `${formatDate(firstMovement.date)} - ${formatDate(lastMovement.date)}` : "No registrado";
  const emissionDate = formatDateTime(new Date().toISOString());

  const summaryRows = [
    ["Titular", profile?.full_name ?? "Camilo Perez"],
    ["Periodo", periodLabel],
    ["Saldo inicial", formatCurrencyCOP(account?.initial_balance ?? 0)],
    ["Aportes", formatCurrencyCOP(account?.total_contributions ?? 0)],
    ["Utilidades", formatCurrencyCOP(account?.total_utilities ?? 0)],
    ["Saldo final", formatCurrencyCOP(account?.current_balance ?? 0)]
  ];

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Estado de cuenta</h2>
        <p className="mt-2 text-base text-slate-500">Consulta y descarga el resumen de tu periodo.</p>
      </div>

      <Card className="min-w-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:items-end">
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">Desde</span>
            <Select defaultValue="enero-2023">
              <option value="enero-2023">Enero 2023</option>
            </Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">Hasta</span>
            <Select defaultValue="febrero-2023">
              <option value="enero-2023">Enero 2023</option>
              <option value="febrero-2023">Febrero 2023</option>
            </Select>
          </label>
          <Button className="w-full lg:w-auto">
            <Search className="h-4 w-4" />
            Consultar
          </Button>
          <Button variant="secondary" className="w-full lg:w-auto">
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </Card>

      <Card className="min-w-0">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {summaryRows.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-2 break-words text-sm font-extrabold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Retiros</p>
            <p className="mt-2 break-words font-extrabold">{formatCurrencyCOP(account?.total_withdrawals ?? 0)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ajustes</p>
            <p className="mt-2 break-words font-extrabold">{formatCurrencyCOP(adjustmentsTotal)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Fecha de emisión</p>
            <p className="mt-2 break-words font-extrabold">{emissionDate}</p>
          </div>
        </div>
      </Card>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <Card className="min-w-0">
          <h3 className="mb-5 text-lg font-extrabold text-slate-950">Detalle de movimientos</h3>
          {orderedMovements.length > 0 ? (
            <>
              <MovementTable movements={orderedMovements} />
              <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold sm:flex-row">
                <span>Totales del periodo</span>
                <span className="whitespace-nowrap">
                  {formatCurrencyCOP(account?.total_contributions ?? 0)} | {formatCurrencyCOP(account?.current_balance ?? 0)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">No se encontraron movimientos para este periodo.</p>
          )}
        </Card>

          <PdfPreviewMock
            title="Estado de cuenta"
            period={periodLabel}
            emissionDate={emissionDate}
            holderName={profile?.full_name ?? "Camilo Perez"}
            documentId={profile?.document_id ?? "No registrado"}
            initialBalance={account?.initial_balance ?? 0}
            contributions={account?.total_contributions ?? 0}
            utilities={account?.total_utilities ?? 0}
            finalBalance={account?.current_balance ?? 0}
            movements={orderedMovements}
        />
      </div>
    </div>
  );
}
