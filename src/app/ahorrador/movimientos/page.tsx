import { ArrowUpRight, CalendarDays, Download, Search } from "lucide-react";
import { MoneyCard } from "@/components/finance/MoneyCard";
import { MovementTable } from "@/components/finance/MovementTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getDemoAhorradorData } from "@/lib/fonfamper/ahorrador-data";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";

const filters = ["Todos", "Aportes", "Utilidades", "Retiros", "Ajustes"];

export default async function SaverMovementsPage() {
  const demoData = await getDemoAhorradorData();
  const summary = demoData.totals;
  const movements = demoData.movements;
  const latestMovement = demoData.latestMovement;
  const hasData = movements.length > 0;

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Movimientos</h2>
        <p className="mt-2 text-base text-slate-500">Consulta el historial de tu cuenta</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MoneyCard title="Total aportes" value={summary.totalContributions} icon={ArrowUpRight} tone="green" />
        <MoneyCard title="Total utilidades" value={summary.totalUtilities} icon={ArrowUpRight} tone="gray" />
        <MoneyCard title="Total retiros" value={summary.totalWithdrawals} icon={ArrowUpRight} tone="red" />
        <MoneyCard title="Saldo actual" value={summary.currentBalance} icon={ArrowUpRight} tone="blue" />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input className="pl-10" placeholder="Buscar movimientos..." />
            </div>
            <div className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              01 dic 2022 → 31 ene 2023
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter, index) => (
              <button
                key={filter}
                className={
                  index === 0
                    ? "rounded-full bg-[#0057d9] px-4 py-2 text-sm font-bold text-white"
                    : "rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200"
                }
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {hasData ? <MovementTable movements={movements} /> : <p className="text-sm text-slate-500">No se pudieron cargar movimientos reales.</p>}
          </div>
        </Card>

        <Card className="min-w-0">
          <h3 className="text-lg font-extrabold text-slate-950">Último movimiento</h3>
          <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ArrowUpRight className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xl font-extrabold text-slate-950">{latestMovement?.concept ?? "Sin movimientos"}</p>
          <p className="mt-1 text-sm text-slate-500">{latestMovement ? formatDate(latestMovement.date) : "Sin fecha"}</p>
          <p className="mt-6 text-3xl font-extrabold text-emerald-700">{latestMovement ? `+${formatCurrencyCOP(latestMovement.value)}` : formatCurrencyCOP(0)}</p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Tipo</span><Badge tone={latestMovement?.type === "Retiro" ? "red" : "green"}>{latestMovement?.type ?? "Aporte"}</Badge></div>
            <div className="flex justify-between"><span className="text-slate-500">Saldo resultante</span><span className="font-bold text-slate-950">{formatCurrencyCOP(latestMovement?.balance ?? summary.currentBalance)}</span></div>
          </div>
          <Button variant="secondary" className="mt-8 w-full">
            <Download className="h-4 w-4" />
            Descargar historial
          </Button>
        </Card>
      </div>
    </div>
  );
}
