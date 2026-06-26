import Link from "next/link";
import { AlertTriangle, CircleDollarSign, Landmark, PiggyBank, TrendingUp } from "lucide-react";
import { BalanceChart } from "@/components/finance/BalanceChart";
import { MoneyCard } from "@/components/finance/MoneyCard";
import { MovementTable } from "@/components/finance/MovementTable";
import { Card } from "@/components/ui/Card";
import { getDemoAhorradorData } from "@/lib/fonfamper/ahorrador-data";
import { formatCurrencyCOP } from "@/lib/fonfamper/format";

export default async function SaverHomePage() {
  const demoData = await getDemoAhorradorData();
  const profileName = demoData.profile?.full_name ?? "Camilo Perez";
  const currentBalance = demoData.totals.currentBalance;
  const initialBalance = demoData.totals.initialBalance;
  const totalContributions = demoData.totals.totalContributions;
  const totalWithdrawals = demoData.totals.totalWithdrawals;
  const totalUtilities = demoData.totals.totalUtilities;
  const movements = demoData.movements;
  const balanceHistory = demoData.balanceHistory.length > 0 ? demoData.balanceHistory : [{ period: "Saldo actual", balance: currentBalance }];
  const hasData = Boolean(demoData.profile && demoData.account);

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Hola, {profileName}</h2>
        <p className="mt-2 text-base text-slate-500">Este es el resumen de tu fondo de ahorro familiar.</p>
      </div>

      {demoData.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">No se pudieron cargar algunos datos reales.</p>
              <p className="mt-1 text-sm text-amber-800">{demoData.error}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyCard title="Saldo actual" value={currentBalance} icon={CircleDollarSign} tone="green" helper="Disponible" />
        <MoneyCard title="Saldo acumulado anterior" value={initialBalance} icon={Landmark} tone="blue" helper="Saldo inicial" />
        <MoneyCard title="Aportes" value={totalContributions} icon={PiggyBank} tone="green" helper="Total aportado" />
        <MoneyCard title="Utilidades" value={totalUtilities} icon={TrendingUp} tone="gray" helper="Total generado" />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)]">
        <BalanceChart data={balanceHistory} />
        <Card className="min-w-0">
          <h3 className="text-lg font-extrabold text-slate-950">Resumen de tu cuenta</h3>
          <div className="mt-5 space-y-4">
            {[
              ["Saldo anterior", initialBalance],
              ["Aportes recibidos", totalContributions],
              ["Utilidades generadas", totalUtilities],
              ["Retiros o descuentos", totalWithdrawals],
              ["Saldo actual", currentBalance]
            ].map(([label, value], index) => (
              <div
                key={label}
                className={index === 4 ? "flex justify-between gap-4 rounded-2xl bg-blue-50 p-4 font-extrabold text-[#062b5f]" : "flex justify-between gap-4 border-b border-slate-100 pb-4 text-sm"}
              >
                <span className="text-slate-500">{label}</span>
                <span className="whitespace-nowrap font-bold text-slate-950">{formatCurrencyCOP(Number(value))}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">{hasData ? "Datos cargados desde Supabase." : "Mostrando estructura visual con fallback."}</p>
        </Card>
      </div>

      <Card className="min-w-0">
        <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h3 className="text-lg font-extrabold text-slate-950">Movimientos recientes</h3>
          <Link href="/ahorrador/movimientos" className="text-sm font-bold text-[#0057d9]">
            Ver todos los movimientos
          </Link>
        </div>
        {movements.length > 0 ? <MovementTable movements={movements} /> : <p className="text-sm text-slate-500">No hay movimientos disponibles por ahora.</p>}
      </Card>
    </div>
  );
}
