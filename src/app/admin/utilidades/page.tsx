import { Calculator, Gift, UsersRound, Wallet } from "lucide-react";
import { MoneyCard } from "@/components/finance/MoneyCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { adminStats, utilityBaseRows } from "@/data/demo/admin";
import { formatCOP } from "@/lib/format";

export default function AdminUtilitiesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Utilidades</h2>
        <p className="mt-2 text-base text-slate-500">Gestiona la distribución y consulta el histórico</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MoneyCard title="Utilidades por distribuir" value={0} icon={Gift} tone="gray" helper="Este mes" />
        <Card><p className="text-sm font-semibold text-slate-500">Última distribución</p><p className="mt-3 text-2xl font-extrabold text-slate-950">Sin registrar</p><p className="mt-2 text-xs text-slate-500">Aún no se ha realizado ninguna distribución</p></Card>
        <Card><div className="flex justify-between"><div><p className="text-sm font-semibold text-slate-500">Usuarios elegibles</p><p className="mt-3 text-3xl font-extrabold text-slate-950">17</p><p className="mt-2 text-xs text-slate-500">Con saldo mayor a $0</p></div><UsersRound className="h-6 w-6 text-[#0057d9]" /></div></Card>
        <MoneyCard title="Base de distribución" value={adminStats.totalManagedBalance} icon={Wallet} tone="blue" helper="Saldo total de usuarios elegibles" />
      </div>

      <Card className="flex min-h-72 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#0057d9]">
          <Gift className="h-10 w-10" />
        </div>
        <h3 className="mt-6 text-2xl font-extrabold text-slate-950">Aún no hay utilidades distribuidas</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          No se han registrado distribuciones de utilidades. Crea tu primera distribución para asignar utilidades a los usuarios elegibles.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary"><Calculator className="h-4 w-4" />Simular distribución</Button>
          <Button>Crear distribución</Button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-5 text-lg font-extrabold text-slate-950">Base de distribución</h3>
        <DataTable
          columns={["#", "Usuario", "Saldo base", "Participación", "Utilidad estimada", "Estado"]}
          rows={utilityBaseRows.map(([index, user, base, participation, utility, status]) => [
            index,
            <span key="user" className="font-bold text-slate-950">{user}</span>,
            formatCOP(base),
            participation,
            formatCOP(utility),
            <Badge key="status" tone="gray">{status}</Badge>
          ])}
        />
      </Card>
    </div>
  );
}
