import { BarChart3, Download, FileClock, FileSpreadsheet, PieChart, ShieldCheck, TrendingUp, UsersRound, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";

const metrics = [
  ["Reportes disponibles", "6"],
  ["Exportaciones este mes", "4"],
  ["Último reporte", "Aportes del mes"],
  ["Estado", "Actualizado"]
] as const;

const reports = [
  ["Reporte de aportes", "Detalle de aportes registrados por periodo y usuario.", TrendingUp],
  ["Reporte de saldos", "Resumen de saldos iniciales, finales y variaciones.", Wallet],
  ["Reporte de usuarios activos", "Usuarios activos, registrados y estado de acceso.", UsersRound],
  ["Reporte de retiros", "Movimientos de retiro revisados y autorizados.", FileClock],
  ["Reporte de utilidades", "Base de distribución y utilidades estimadas.", PieChart],
  ["Reporte de auditoría", "Cambios, accesos y eventos del sistema.", ShieldCheck]
] as const;

const historyRows = [
  ["14 may 2024", "Aportes del mes", "Sonia Perez", "Excel", "Completado", "Descargar"],
  ["13 may 2024", "Saldos generales", "Sonia Perez", "PDF", "Completado", "Descargar"],
  ["12 may 2024", "Auditoría", "Sonia Perez", "Excel", "Completado", "Descargar"]
] as const;

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Reportes</h2>
        <p className="mt-2 text-base text-slate-500">Consulta indicadores y exporta información del fondo.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-extrabold text-slate-950">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reports.map(([title, description, Icon]) => (
          <Card key={title}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0057d9]">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{description}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" className="flex-1">
                <BarChart3 className="h-4 w-4" />
                Ver reporte
              </Button>
              <Button className="flex-1">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-5 text-lg font-extrabold text-slate-950">Historial de reportes generados</h3>
        <DataTable
          columns={["Fecha", "Reporte", "Usuario", "Formato", "Estado", "Acción"]}
          rows={historyRows.map(([date, report, user, format, status, action]) => [
            date,
            <span key="report" className="font-bold text-slate-950">{report}</span>,
            user,
            <span key="format" className="inline-flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-[#0057d9]" />{format}</span>,
            <Badge key="status" tone="green">{status}</Badge>,
            <button key="action" type="button" className="font-extrabold text-[#0057d9]">{action}</button>
          ])}
        />
      </Card>
    </div>
  );
}
