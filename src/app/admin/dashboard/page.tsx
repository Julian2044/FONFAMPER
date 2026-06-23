import Link from "next/link";
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
import { adminStats, recentOperations } from "@/data/demo/admin";
import { formatCOP } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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

const metricCards: MetricCardData[] = [
  {
    title: "Usuarios activos",
    value: `${adminStats.activeSavers}`,
    helper: `De ${adminStats.registeredSavers} registrados`,
    trend: "↑ 3 este mes",
    icon: UsersRound,
    tone: "blue"
  },
  {
    title: "Saldo total administrado",
    value: formatCOP(adminStats.totalManagedBalance),
    helper: "Total de fondos",
    icon: CircleDollarSign,
    tone: "green"
  },
  {
    title: "Aportes del mes",
    value: formatCOP(adminStats.monthlyContributions),
    helper: "12 aportes recibidos",
    trend: "↑ 18% vs. mes anterior",
    icon: PiggyBank,
    tone: "green"
  },
  {
    title: "Utilidades distribuidas",
    value: formatCOP(adminStats.distributedUtilities),
    helper: "Este mes",
    trend: "Sin cambios",
    icon: Gift,
    tone: "gray"
  },
  {
    title: "Movimientos pendientes",
    value: `${adminStats.pendingMovements}`,
    helper: "Por revisar",
    link: "Ver detalles",
    href: "/admin/auditoria",
    icon: Clock3,
    tone: "orange"
  }
];

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
    <Card className="min-h-[178px] p-5 2xl:p-6">
      <div className="flex min-w-0 h-full flex-col">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#0057D9]">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold leading-5 text-slate-950">{title}</p>
            <p className="mt-3 whitespace-nowrap text-[24px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">{value}</p>
          </div>
        </div>

        <div className="mt-3 min-w-0">
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
          {trend ? <p className={cn("mt-3 text-xs font-bold", indicatorTones[tone])}>{trend}</p> : null}
          {link && href ? (
            <Link href={href} className="mt-3 inline-flex text-xs font-extrabold text-orange-600">
              {link}
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Dashboard Administrativo</h2>
        <p className="mt-2 text-base text-slate-500">Resumen general del Fondo de Ahorro Familiar.</p>
      </div>

      <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {metricCards.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <MonthlyActivityChart />
        <Card className="min-h-[420px] p-5 sm:p-6">
          <h3 className="text-lg font-extrabold text-slate-950">Acciones rápidas</h3>
          <div className="mt-5 space-y-3">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className="flex min-h-[58px] w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 transition hover:border-blue-100 hover:bg-blue-50/50">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#0057D9]">
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
          rows={recentOperations.map(([date, type, user, description, amount, status]) => [
            date,
            type,
            <span key="user" className="font-bold text-slate-950">{user}</span>,
            description,
            <span key="amount" className="font-bold text-slate-950">{formatCOP(amount)}</span>,
            <Badge key="status" tone="green">{status}</Badge>,
            <button key="action" type="button" aria-label={`Opciones para ${description}`} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          ])}
        />
      </Card>
    </div>
  );
}
