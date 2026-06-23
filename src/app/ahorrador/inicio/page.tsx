import Link from "next/link";
import { CircleDollarSign, Landmark, PiggyBank, TrendingUp } from "lucide-react";
import { BalanceChart } from "@/components/finance/BalanceChart";
import { MoneyCard } from "@/components/finance/MoneyCard";
import { MovementTable } from "@/components/finance/MovementTable";
import { Card } from "@/components/ui/Card";
import { camiloAccount, camiloBalanceHistory } from "@/data/demo/camilo";
import { formatCOP } from "@/lib/format";

export default function SaverHomePage() {
  const { summary, movements } = camiloAccount;

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Hola, Camilo</h2>
        <p className="mt-2 text-base text-slate-500">Este es el resumen de tu fondo de ahorro familiar.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyCard title="Saldo actual" value={summary.currentBalance} icon={CircleDollarSign} tone="green" helper="Disponible" />
        <MoneyCard title="Saldo acumulado anterior" value={summary.previousBalance} icon={Landmark} tone="blue" helper="Al 31 dic 2022" />
        <MoneyCard title="Aportes" value={summary.januaryContribution} icon={PiggyBank} tone="green" helper="Total aportado" />
        <MoneyCard title="Utilidades" value={summary.utilities} icon={TrendingUp} tone="gray" helper="Total generado" />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)]">
        <BalanceChart data={camiloBalanceHistory} />
        <Card className="min-w-0">
          <h3 className="text-lg font-extrabold text-slate-950">Resumen de tu cuenta</h3>
          <div className="mt-5 space-y-4">
            {[
              ["Saldo anterior (31 dic 2022)", summary.previousBalance],
              ["Aportes recibidos", summary.januaryContribution],
              ["Utilidades generadas", summary.utilities],
              ["Retiros o descuentos", summary.withdrawals],
              ["Saldo actual", summary.currentBalance]
            ].map(([label, value], index) => (
              <div
                key={label}
                className={index === 4 ? "flex justify-between gap-4 rounded-2xl bg-blue-50 p-4 font-extrabold text-[#062b5f]" : "flex justify-between gap-4 border-b border-slate-100 pb-4 text-sm"}
              >
                <span className="text-slate-500">{label}</span>
                <span className="whitespace-nowrap font-bold text-slate-950">{formatCOP(Number(value))}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="min-w-0">
        <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h3 className="text-lg font-extrabold text-slate-950">Movimientos recientes</h3>
          <Link href="/ahorrador/movimientos" className="text-sm font-bold text-[#0057d9]">
            Ver todos los movimientos
          </Link>
        </div>
        <MovementTable movements={movements} />
      </Card>
    </div>
  );
}
