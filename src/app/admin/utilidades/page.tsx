import { Calculator, Coins, Landmark, PieChart, Wallet } from "lucide-react";
import { AdminMetricCard } from "@/components/finance/AdminMetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";

export const dynamic = "force-dynamic";

export default async function AdminUtilitiesPage() {
  const adminData = await getDemoAdminData();
  const eligibleUsers = adminData.users
    .filter((user) => user.role === "AHORRADOR" && user.account)
    .sort((left, right) => right.summary.currentBalance - left.summary.currentBalance);
  const lastMovement = adminData.recentOperations[0] ?? null;

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Utilidades</h2>
        <p className="mt-2 text-base text-slate-500">Gestiona la distribución y consulta el histórico</p>
      </div>

      {adminData.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-semibold">No se pudieron cargar algunos datos administrativos.</p>
        </Card>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard title="Utilidades por distribuir" value={formatCurrencyCOP(adminData.metrics.totalUtilities)} helper="Este mes" icon={Coins} tone="gray" />
        <AdminMetricCard title="Última distribución" value="Sin registrar" helper="Las distribuciones reales se implementarán luego" icon={PieChart} tone="blue" />
        <AdminMetricCard title="Usuarios elegibles" value={`${eligibleUsers.length}`} helper="Con saldo mayor a $0" icon={Landmark} tone="green" />
        <AdminMetricCard title="Base de distribución" value={formatCurrencyCOP(adminData.metrics.totalManagedBalance)} helper="Saldo total de los usuarios elegibles" icon={Wallet} tone="blue" />
      </div>

      <Card>
        <h3 className="text-lg font-extrabold text-slate-950">Distribuciones realizadas</h3>
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#0057d7]">
            <Coins className="h-10 w-10" />
          </div>
          <h4 className="mt-6 text-2xl font-extrabold text-slate-950">Aún no hay utilidades distribuidas</h4>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            No se han registrado distribuciones de utilidades. Crea tu primera distribución para asignar utilidades a los usuarios elegibles.
          </p>
          <p className="mt-3 max-w-2xl text-xs text-slate-500">
            Las distribuciones reales de utilidades se implementarán en una fase posterior.
          </p>
          <div className="mt-6 grid gap-3 sm:flex">
            <Button variant="secondary" className="w-full sm:w-auto">
              <Calculator className="h-4 w-4" />
              Simular distribución
            </Button>
            <Button className="w-full sm:w-auto">Crear distribución</Button>
          </div>
        </div>
      </Card>

      <Card className="min-w-0">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h3 className="text-lg font-extrabold text-slate-950">Base de distribución</h3>
          <div className="grid gap-3 sm:flex">
            <Button variant="secondary" className="w-full sm:w-auto">
              Exportar (Excel)
            </Button>
            <Select defaultValue="este-mes" className="sm:w-44">
              <option value="este-mes">Este mes</option>
            </Select>
          </div>
        </div>
        <DataTable
          columns={["#", "Usuario", "Saldo base", "Participación", "Utilidad estimada", "Estado"]}
          rows={eligibleUsers.slice(0, 6).map((user, index) => [
            index + 1,
            <span key="user" className="font-bold text-slate-950">
              {user.fullName}
            </span>,
            formatCurrencyCOP(user.summary.currentBalance),
            `${((user.summary.currentBalance / Math.max(adminData.metrics.totalManagedBalance, 1)) * 100).toFixed(2)}%`,
            formatCurrencyCOP(0),
            <Badge key="status" tone="gray">
              Pendiente
            </Badge>
          ])}
        />

        <p className="mt-4 text-xs text-slate-500">
          Saldo base cargado desde Supabase. Las utilidades se mostrarán cuando exista una distribución registrada.
          {lastMovement ? ` Último movimiento del sistema: ${formatDate(lastMovement.movementDate)}.` : ""}
        </p>
      </Card>
    </div>
  );
}
