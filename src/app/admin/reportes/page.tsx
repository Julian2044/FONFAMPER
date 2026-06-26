import { BarChart3, Download, FileClock, PieChart, ShieldCheck, TrendingUp, UsersRound, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";
import { formatDateTime } from "@/lib/fonfamper/format";

export const dynamic = "force-dynamic";

const reportCards = [
  ["Reporte de aportes", "Detalle de aportes registrados por periodo y usuario.", TrendingUp],
  ["Reporte de saldos", "Resumen de saldos iniciales, finales y variaciones.", Wallet],
  ["Reporte de usuarios activos", "Usuarios activos, registrados y estado de acceso.", UsersRound],
  ["Reporte de retiros", "Movimientos de retiro revisados y autorizados.", FileClock],
  ["Reporte de utilidades", "Base de distribución y utilidades estimadas.", PieChart],
  ["Reporte de auditoría", "Cambios, accesos y eventos del sistema.", ShieldCheck]
] as const;

export default async function AdminReportsPage() {
  const adminData = await getDemoAdminData();

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Reportes</h2>
        <p className="mt-2 text-base text-slate-500">Consulta indicadores y exporta información del fondo.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="min-h-[132px]">
          <p className="text-sm font-semibold text-slate-500">Reportes disponibles</p>
          <p className="mt-3 whitespace-nowrap text-[22px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">6</p>
        </Card>
        <Card className="min-h-[132px]">
          <p className="text-sm font-semibold text-slate-500">Exportaciones este mes</p>
          <p className="mt-3 whitespace-nowrap text-[22px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">0</p>
        </Card>
        <Card className="min-h-[132px]">
          <p className="text-sm font-semibold text-slate-500">Último reporte</p>
          <p className="mt-3 break-words text-[22px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">Sin generar</p>
        </Card>
        <Card className="min-h-[132px]">
          <p className="text-sm font-semibold text-slate-500">Estado</p>
          <p className="mt-3 break-words text-[22px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">Actualizado</p>
        </Card>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {reportCards.map(([title, description, Icon]) => (
          <Card key={title} className="overflow-hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0057d9]">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{description}</p>
            <div className="mt-5 grid gap-3 sm:flex">
              <Button variant="secondary" className="w-full sm:flex-1">
                <BarChart3 className="h-4 w-4" />
                Ver reporte
              </Button>
              <Button className="w-full sm:flex-1">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="min-w-0">
        <h3 className="text-lg font-extrabold text-slate-950">Historial de reportes generados</h3>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No hay reportes generados todavía. El historial real se activará cuando exista fase de exportaciones.
          <span className="mt-2 block text-xs text-slate-400">Fecha de referencia: {formatDateTime(adminData.timeline.reportIssuedAt)}</span>
        </div>
      </Card>
    </div>
  );
}
