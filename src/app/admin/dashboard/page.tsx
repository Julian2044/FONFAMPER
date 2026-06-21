import { ArrowUpRight, CircleDollarSign, Clock3, Gift, PiggyBank, UsersRound } from "lucide-react";
import { AdminMetricCard } from "@/components/finance/AdminMetricCard";
import { MonthlyActivityChart } from "@/components/finance/MonthlyActivityChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { adminStats, recentOperations } from "@/data/demo/admin";
import { formatCOP } from "@/lib/format";

const quickActions = ["Registrar nuevo aporte", "Registrar retiro", "Gestionar usuarios", "Importar movimientos (Excel)", "Generar reporte"];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Dashboard Administrativo</h2>
        <p className="mt-2 text-base text-slate-500">Resumen general del Fondo de Ahorro Familiar.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <AdminMetricCard title="Usuarios activos" value={`${adminStats.activeSavers}`} helper={`De ${adminStats.registeredSavers} registrados`} trend="↑ 3 este mes" icon={UsersRound} />
        <AdminMetricCard title="Saldo total administrado" value={formatCOP(adminStats.totalManagedBalance)} helper="Total de fondos" icon={CircleDollarSign} tone="green" />
        <AdminMetricCard title="Aportes del mes" value={formatCOP(adminStats.monthlyContributions)} helper="12 aportes recibidos" trend="↑ 18% vs. mes anterior" icon={PiggyBank} tone="green" />
        <AdminMetricCard title="Utilidades distribuidas" value={formatCOP(adminStats.distributedUtilities)} helper="Este mes" trend="Sin cambios" icon={Gift} tone="gray" />
        <AdminMetricCard title="Movimientos pendientes" value={`${adminStats.pendingMovements}`} helper="Por revisar" trend="Ver detalles" icon={Clock3} tone="orange" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <MonthlyActivityChart />
        <Card>
          <h3 className="text-lg font-extrabold text-slate-950">Acciones rápidas</h3>
          <div className="mt-5 space-y-3">
            {quickActions.map((action) => (
              <Button key={action} variant="secondary" className="w-full justify-between">
                {action}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-5 text-lg font-extrabold text-slate-950">Operaciones recientes</h3>
        <DataTable
          columns={["Fecha", "Tipo", "Usuario", "Descripción", "Monto", "Estado", "Acciones"]}
          rows={recentOperations.map(([date, type, user, description, amount, status]) => [
            date,
            type,
            <span key="user" className="font-bold text-slate-950">{user}</span>,
            description,
            <span key="amount" className="font-bold text-slate-950">{formatCOP(amount)}</span>,
            <Badge key="status" tone="green">{status}</Badge>,
            <Button key="action" variant="ghost" className="h-9 px-3">Ver</Button>
          ])}
        />
      </Card>
    </div>
  );
}
