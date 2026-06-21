import { ArrowUpRight, CalendarDays, Download, Search } from "lucide-react";
import { MoneyCard } from "@/components/finance/MoneyCard";
import { MovementTable } from "@/components/finance/MovementTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { camiloAccount } from "@/data/demo/camilo";
import { formatCOP } from "@/lib/format";

const filters = ["Todos", "Aportes", "Utilidades", "Retiros", "Ajustes"];

export default function SaverMovementsPage() {
  const { summary, movements } = camiloAccount;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Movimientos</h2>
        <p className="mt-2 text-base text-slate-500">Consulta el historial de tu cuenta</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MoneyCard title="Total aportes" value={summary.januaryContribution} icon={ArrowUpRight} tone="green" />
        <MoneyCard title="Total utilidades" value={summary.utilities} icon={ArrowUpRight} tone="gray" />
        <MoneyCard title="Total retiros" value={summary.withdrawals} icon={ArrowUpRight} tone="red" />
        <MoneyCard title="Saldo actual" value={summary.currentBalance} icon={ArrowUpRight} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input className="pl-10" placeholder="Buscar movimientos..." />
            </div>
            <div className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700">
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
            <MovementTable movements={movements} />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-extrabold text-slate-950">Último movimiento</h3>
          <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ArrowUpRight className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xl font-extrabold text-slate-950">Aporte de enero</p>
          <p className="mt-1 text-sm text-slate-500">15 ene 2023</p>
          <p className="mt-6 text-3xl font-extrabold text-emerald-700">+{formatCOP(50000)}</p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Tipo</span><Badge tone="green">Aporte</Badge></div>
            <div className="flex justify-between"><span className="text-slate-500">Saldo resultante</span><span className="font-bold text-slate-950">{formatCOP(950000)}</span></div>
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
