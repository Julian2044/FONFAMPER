import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  LockKeyhole,
  PiggyBank,
  PlusCircle,
  ReceiptText,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  UserCog,
  UserPlus,
  UsersRound,
  WalletCards
} from "lucide-react";
import { BalanceEvolutionChart } from "@/components/finance/BalanceEvolutionChart";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";
import { getAdminDashboardData, type AdminDashboardUserAlert } from "@/lib/fonfamper/admin-dashboard-data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MetricCardData = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "red" | "orange" | "gray";
};

const quickActions = [
  { label: "Nuevo usuario", href: "/admin/usuarios", icon: UserPlus },
  { label: "Registrar movimiento", href: "/admin/movimientos", icon: PlusCircle },
  { label: "Estado de cuenta", href: "/admin/estados-cuenta", icon: FileText },
  { label: "Auditoría", href: "/admin/auditoria", icon: ClipboardList }
] as const;

const toneClasses = {
  blue: "bg-blue-50 text-[#0057d9]",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  orange: "bg-orange-50 text-orange-700",
  gray: "bg-slate-100 text-slate-600"
};

function MetricCard({ title, value, helper, icon: Icon, tone }: MetricCardData) {
  return (
    <Card className="min-h-[162px] p-5 sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold leading-5 text-slate-500">{title}</p>
          <p className="mt-3 break-words text-[24px] font-extrabold leading-tight tracking-normal text-slate-950 sm:text-[28px]">{value}</p>
          <p className="mt-2 break-words text-sm leading-5 text-slate-500">{helper}</p>
        </div>
      </div>
    </Card>
  );
}

function movementLabel(type: string) {
  switch (type) {
    case "APORTE":
      return "Aporte";
    case "RETIRO":
      return "Retiro";
    case "AJUSTE":
      return "Ajuste";
    case "SALDO_INICIAL":
      return "Saldo inicial";
    default:
      return type;
  }
}

function movementTone(type: string) {
  if (type === "APORTE") return "green";
  if (type === "RETIRO") return "red";
  if (type === "SALDO_INICIAL") return "blue";
  return "gray";
}

function roleLabel(role: string) {
  return role === "ADMIN" ? "Administrador" : "Ahorrador";
}

function AlertList({
  title,
  count,
  users,
  emptyMessage,
  icon: Icon,
  tone = "orange"
}: {
  title: string;
  count: number;
  users: AdminDashboardUserAlert[];
  emptyMessage: string;
  icon: LucideIcon;
  tone?: "orange" | "red" | "gray";
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-extrabold text-slate-950">{title}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{count} registros</p>
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="min-w-0 rounded-lg bg-slate-50 px-3 py-3">
              <p className="break-words text-sm font-bold text-slate-950">{user.fullName}</p>
              <p className="mt-1 break-words text-xs text-slate-500">{user.email}</p>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const dashboardData = await getAdminDashboardData();
  const { metrics, monthMetrics } = dashboardData;
  const mainMetrics: MetricCardData[] = [
    {
      title: "Total ahorrado",
      value: formatCurrencyCOP(metrics.totalAhorrado),
      helper: `${metrics.usuariosConCuenta} usuarios con cuenta`,
      icon: WalletCards,
      tone: "green"
    },
    {
      title: "Total aportes",
      value: formatCurrencyCOP(metrics.totalAportes),
      helper: "Acumulado histórico",
      icon: PiggyBank,
      tone: "blue"
    },
    {
      title: "Total retiros",
      value: formatCurrencyCOP(metrics.totalRetiros),
      helper: "Acumulado histórico",
      icon: ReceiptText,
      tone: "red"
    },
    {
      title: "Usuarios activos",
      value: String(metrics.usuariosActivos),
      helper: `${metrics.totalUsuarios} usuarios registrados`,
      icon: UsersRound,
      tone: "blue"
    },
    {
      title: "Accesos pendientes",
      value: String(metrics.accesosPendientes),
      helper: `${metrics.accesosActivos} accesos activos`,
      icon: LockKeyhole,
      tone: "orange"
    },
    {
      title: "Movimientos del mes",
      value: String(monthMetrics.movimientosMes),
      helper: `${formatDate(monthMetrics.monthStart)} en adelante`,
      icon: TrendingUp,
      tone: "gray"
    }
  ];

  const activityItems: MetricCardData[] = [
    {
      title: "Aportes del mes",
      value: formatCurrencyCOP(monthMetrics.aportesMes),
      helper: "Movimientos APORTE del mes actual",
      icon: PiggyBank,
      tone: "green"
    },
    {
      title: "Retiros del mes",
      value: formatCurrencyCOP(monthMetrics.retirosMes),
      helper: "Movimientos RETIRO del mes actual",
      icon: TrendingDown,
      tone: "red"
    },
    {
      title: "Ajustes del mes",
      value: formatCurrencyCOP(monthMetrics.ajustesMes),
      helper: "Movimientos AJUSTE del mes actual",
      icon: ShieldAlert,
      tone: "orange"
    },
    {
      title: "Total movimientos del mes",
      value: String(monthMetrics.movimientosMes),
      helper: `Desde ${formatDate(monthMetrics.monthStart)}`,
      icon: ClipboardList,
      tone: "blue"
    }
  ];

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Dashboard</h2>
        <p className="mt-2 text-base text-slate-500">Resumen general del fondo de ahorro.</p>
      </div>

      {dashboardData.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-semibold">No se pudieron cargar algunos datos del dashboard.</p>
          <p className="mt-1 break-words text-sm text-amber-800">{dashboardData.error}</p>
        </Card>
      ) : null}

      <section className="grid min-w-0 gap-5 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        {mainMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      <BalanceEvolutionChart
        currencyLabel="COP"
        points={dashboardData.fundEvolution}
        subtitle="Comportamiento del saldo total acumulado de todas las cuentas."
        title="Evolución del fondo administrado"
      />

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-950">Actividad del mes</h3>
            <p className="mt-1 text-sm text-slate-500">Movimientos registrados durante el mes actual.</p>
          </div>
        </div>
        <div className="grid min-w-0 gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {activityItems.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="min-w-0">
          <h3 className="text-xl font-extrabold text-slate-950">Top usuarios por saldo</h3>
          <div className="mt-5 space-y-3">
            {dashboardData.topUsuariosPorSaldo.length > 0 ? (
              dashboardData.topUsuariosPorSaldo.map((user, index) => (
                <div key={user.profileId} className="flex min-w-0 flex-col gap-3 rounded-xl bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-extrabold text-[#0057d9]">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-extrabold text-slate-950">{user.fullName}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{roleLabel(user.role)}</p>
                    </div>
                  </div>
                  <p className="break-words text-sm font-extrabold text-slate-950 sm:shrink-0 sm:whitespace-nowrap">{formatCurrencyCOP(user.currentBalance)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No hay cuentas de ahorro registradas.</p>
            )}
          </div>
        </Card>

        <Card className="min-w-0">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="text-xl font-extrabold text-slate-950">Últimos movimientos</h3>
            <Link href="/admin/movimientos" className="text-sm font-extrabold text-[#0057d9]">
              Ver movimientos
            </Link>
          </div>

          {dashboardData.latestMovements.length > 0 ? (
            <DataTable
              columns={["Usuario", "Tipo", "Concepto", "Valor", "Fecha"]}
              rows={dashboardData.latestMovements.map((movement) => [
                <span key="user" className="font-bold text-slate-950">
                  {movement.profileName}
                </span>,
                <Badge key="type" tone={movementTone(movement.movementType)}>
                  {movementLabel(movement.movementType)}
                </Badge>,
                movement.concept,
                <span key="amount" className="whitespace-nowrap font-bold text-slate-950">
                  {formatCurrencyCOP(movement.amount)}
                </span>,
                <span key="date" className="whitespace-nowrap font-semibold text-slate-600">
                  {formatDate(movement.movementDate)}
                </span>
              ])}
            />
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Aún no hay movimientos registrados.</p>
          )}
        </Card>
      </section>

      <section>
        <h3 className="text-xl font-extrabold text-slate-950">Alertas administrativas</h3>
        <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-3">
          <AlertList
            count={metrics.accesosPendientes}
            emptyMessage="No hay accesos pendientes."
            icon={LockKeyhole}
            title="Accesos pendientes"
            users={dashboardData.accesosPendientesLista}
          />
          <AlertList
            count={metrics.usuariosBloqueados}
            emptyMessage="No hay usuarios bloqueados."
            icon={ShieldAlert}
            title="Usuarios bloqueados"
            tone="red"
            users={dashboardData.usuariosBloqueadosLista}
          />
          <AlertList
            count={metrics.usuariosSinCuenta}
            emptyMessage="No hay usuarios sin cuenta de ahorro."
            icon={UserCog}
            title="Usuarios sin cuenta"
            tone="gray"
            users={dashboardData.usuariosSinCuentaLista}
          />
        </div>
      </section>

      <section>
        <h3 className="text-xl font-extrabold text-slate-950">Acciones rápidas</h3>
        <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex min-h-[76px] min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-soft transition hover:border-blue-100 hover:bg-blue-50/50"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#0057D7]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="break-words text-sm font-extrabold leading-5 text-slate-950">{label}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
