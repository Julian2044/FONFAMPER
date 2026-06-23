import { Calculator, Coins, Landmark, PieChart, Wallet } from "lucide-react";
import { MoneyCard } from "@/components/finance/MoneyCard";
import { Card } from "@/components/ui/Card";

const steps = [
  ["Excedentes del periodo", "Se determinan los excedentes netos generados en el periodo contable.", Calculator],
  ["Base de distribución", "Se establece la base de distribución según el saldo promedio de cada asociado.", Landmark],
  ["Cálculo de participación", "Se calcula el porcentaje de participación de cada asociado sobre la base de distribución.", PieChart],
  ["Distribución", "Las utilidades se acreditan en la cuenta individual de cada asociado.", Coins]
] as const;

export default function SaverUtilitiesPage() {
  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Utilidades</h2>
        <p className="mt-2 text-base text-slate-500">Revisa los rendimientos generados en tu cuenta.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyCard title="Total histórico" value={0} icon={Coins} tone="gray" helper="Desde el inicio" />
        <MoneyCard title="Utilidad del periodo" value={0} icon={PieChart} tone="gray" helper="Ene 2023" />
        <Card className="min-h-[168px]">
          <p className="text-sm font-semibold text-slate-500">Última distribución</p>
          <p className="mt-3 text-[24px] font-extrabold leading-none tracking-tight text-slate-950">Sin registrar</p>
          <p className="mt-2 text-xs text-slate-500">No hay distribuciones</p>
        </Card>
        <MoneyCard title="Saldo base actual" value={950000} icon={Wallet} tone="blue" helper="Al 15 ene 2023" />
      </div>

      <Card className="flex min-h-80 flex-col items-center justify-center text-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-[#0057d9]">
          <Wallet className="h-11 w-11" />
          <div className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Coins className="h-5 w-5" />
          </div>
        </div>
        <h3 className="mt-6 text-2xl font-extrabold text-slate-950">Aún no tienes utilidades registradas</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Las utilidades se generan al cierre de cada periodo contable. Cuando estén disponibles, podrás ver el detalle y el histórico aquí.
        </p>
      </Card>

      <Card>
        <h3 className="text-xl font-extrabold text-slate-950">¿Cómo se calculan las utilidades?</h3>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, description, Icon], index) => (
            <div key={title} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5">
              {index < steps.length - 1 ? <div className="absolute -right-3 top-10 hidden h-px w-6 bg-blue-200 lg:block" /> : null}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0057d9] text-sm font-extrabold text-white">{index + 1}</div>
                <Icon className="h-5 w-5 text-[#0057d9]" />
              </div>
              <p className="mt-5 font-extrabold text-slate-950">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
