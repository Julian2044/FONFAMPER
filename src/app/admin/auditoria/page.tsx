import { AlertCircle, FileDown, History, KeyRound, ListChecks, RotateCcw } from "lucide-react";
import { AdminMetricCard } from "@/components/finance/AdminMetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { auditEvents } from "@/data/demo/admin";

export default function AdminAuditPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Auditoría</h2>
        <p className="mt-2 text-base text-slate-500">Rastrea cambios, accesos y operaciones del sistema</p>
      </div>

      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <Select defaultValue="fecha"><option value="fecha">01/05/2024 - 14/05/2024</option></Select>
          <Select defaultValue="todos"><option value="todos">Todos los usuarios</option></Select>
          <Select defaultValue="tipos"><option value="tipos">Todos los tipos</option></Select>
          <Select defaultValue="estados"><option value="estados">Todos los estados</option></Select>
          <Button variant="secondary"><RotateCcw className="h-4 w-4" />Limpiar filtros</Button>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard title="Eventos hoy" value="14" helper="Registrados" icon={History} />
        <AdminMetricCard title="Inicios de sesión" value="6" helper="Exitosos" icon={KeyRound} tone="green" />
        <AdminMetricCard title="Cambios de registros" value="5" helper="Modificaciones" icon={ListChecks} />
        <AdminMetricCard title="Alertas" value="0" helper="Sin alertas" icon={AlertCircle} tone="gray" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <h3 className="mb-5 text-lg font-extrabold text-slate-950">Registro de auditoría</h3>
          <DataTable
            columns={["Fecha y hora", "Usuario", "Módulo", "Acción", "Descripción", "Estado"]}
            rows={auditEvents.map(([date, user, module, action, description, status]) => [
              date,
              <span key="user" className="font-bold text-slate-950">{user}</span>,
              module,
              action,
              <span key="description" className="whitespace-normal text-slate-700">{description}</span>,
              <Badge key="status" tone={status === "Fallido" ? "red" : "green"}>{status}</Badge>
            ])}
          />
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Actividad reciente</h3>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              {[
                "Sonia Perez editó el usuario Camilo Perez",
                "Sonia Perez creó un movimiento de aporte para Camilo Perez",
                "Sonia Perez importó un archivo aportes_mayo.xlsx",
                "Sonia Perez generó estados de cuenta de mayo 2024",
                "Sistema inició sesión exitosamente"
              ].map((item) => (
                <div key={item} className="border-b border-slate-100 pb-3 last:border-0">{item}</div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Exportar auditoría</h3>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Formato de archivo</span>
              <Select defaultValue="xlsx"><option value="xlsx">Excel (.xlsx)</option></Select>
            </label>
            <Button className="mt-5 w-full"><FileDown className="h-4 w-4" />Exportar</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
