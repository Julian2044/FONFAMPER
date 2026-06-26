import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  Gift,
  MoreHorizontal,
  PiggyBank,
  PlusCircle,
  ReceiptText,
  TrendingUp,
  UserCog,
  UsersRound
} from "lucide-react";
import { MonthlyActivityChart } from "@/components/finance/MonthlyActivityChart";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";
import { formatCurrencyCOP } from "@/lib/fonfamper/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MetricCardData = {
  title: string;
  value: string;
  helper: string;
  trend?: string;
  link?: string;
  href?: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "gray" | "orange";
};

const quickActions = [
  { label: "Registrar nuevo aporte", href: "/admin/movimientos", icon: PlusCircle },
  { label: "Registrar retiro", href: "/admin/movimientos", icon: ReceiptText },
  { label: "Gestionar usuarios", href: "/admin/usuarios", icon: UserCog },
  { label: "Importar movimientos (Excel)", href: "/admin/importaciones", icon: FileSpreadsheet },
  { label: "Generar reporte", href: "/admin/reportes", icon: TrendingUp }
] as const;

const indicatorTones = {
  blue: "text-emerald-700",
  green: "text-emerald-700",
  gray: "text-slate-500",
  orange: "text-orange-600"
};

function MetricCard({ title, value, helper, trend, link, href, icon: Icon, tone }: MetricCardData) {
  return (
    <Card className="h-full min-h-[192px] p-6">
      <div className="flex h-full min-w-0 flex-col justify-between gap-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#0057D9]">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="break-words text-[14px] font-semibold leading-5 text-slate-500">{title}</p>
            <p className="mt-3 whitespace-nowrap font-extrabold tabular-nums leading-none tracking-tight text-slate-950 text-[22px] sm:text-[24px] xl:text-[28px] 2xl:text-[30px]">
              {value}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <p className="break-words text-sm leading-6 text-slate-500">{helper}</p>
          {trend ? <p className={cn("mt-3 text-xs font-bold", indicatorTones[tone])}>{trend}</p> : null}
          {link && href ? (
            <Link href={href} className="mt-3 inline-flex whitespace-nowrap text-xs font-extrabold text-orange-600">
              {link}
            </Link>
          ) : null}
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

export default async function AdminDashboardPage() {
  const adminData = await getDemoAdminData();
  const metrics: MetricCardData[] = [
    {
      title: "Usuarios activos",
      value: `${adminData.metrics.activeUsers}`,
      helper: `De ${adminData.metrics.totalUsers} registrados`,
      trend: "En lectura real",
      icon: UsersRound,
      tone: "blue"
    },
    {
      title: "Saldo total administrado",
      value: formatCurrencyCOP(adminData.metrics.totalManagedBalance),
      helper: "Total de fondos",
      icon: CircleDollarSign,
      tone: "green"
    },
    {
      title: "Aportes del mes",
      value: formatCurrencyCOP(adminData.metrics.totalContributions),
      helper: "Movimientos de aporte",
      trend: adminData.metrics.totalContributions > 0 ? "Con datos reales" : "Sin aportes registrados",
      icon: PiggyBank,
      tone: "green"
    },
    {
      title: "Utilidades distribuidas",
      value: formatCurrencyCOP(adminData.metrics.totalUtilities),
      helper: "Este mes",
      trend: adminData.metrics.totalUtilities > 0 ? "Distribuciones reales" : "Sin cambios",
      icon: Gift,
      tone: "gray"
    },
    {
      title: "Movimientos pendientes",
      value: `${adminData.metrics.pendingMovements}`,
      helper: "Por revisar",
      link: "Ver detalles",
      href: "/admin/auditoria",
      icon: Clock3,
      tone: "orange"
    }
  ];

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Dashboard Administrativo</h2>
        <p className="mt-2 text-base text-slate-500">Resumen general del Fondo de Ahorro Familiar.</p>
      </div>

      {adminData.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-semibold">No se pudieron cargar algunos datos administrativos.</p>
          <p className="mt-1 text-sm text-amber-800">{adminData.error}</p>
        </Card>
      ) : null}

      <div className="grid min-w-0 gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <MonthlyActivityChart data={adminData.monthlyActivity} />
        <Card className="min-h-[420px] p-5 sm:p-6">
          <h3 className="text-lg font-extrabold text-slate-950">Acciones rápidas</h3>
          <div className="mt-5 space-y-3">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex min-h-[58px] w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 transition hover:border-blue-100 hover:bg-blue-50/50"
              >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#0057D7]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 text-sm font-extrabold leading-5 text-slate-950">{label}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="min-w-0">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h3 className="text-lg font-extrabold text-slate-950">Operaciones recientes</h3>
          <Link href="/admin/auditoria" className="text-sm font-extrabold text-[#0057d9]">
            Ver todas las operaciones
          </Link>
        </div>
        <DataTable
          columns={["Fecha", "Tipo", "Usuario", "Descripción", "Monto", "Estado", "Acciones"]}
          rows={adminData.recentOperations.map((movement) => [
            movement.movementDate,
            movementLabel(movement.movementType),
            <span key="user" className="font-bold text-slate-950">
              {movement.profileName}
            </span>,
            movement.concept,
            <span key="amount" className="whitespace-nowrap font-bold text-slate-950">
              {formatCurrencyCOP(movement.amount)}
            </span>,
            <Badge key="status" tone="green">
              Registrado
            </Badge>,
            <button key="action" type="button" aria-label={`Opciones para ${movement.concept}`} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          ])}
        />
      </Card>
    </div>
  );
}
