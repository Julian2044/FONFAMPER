import { AlertCircle, FileDown, History, KeyRound, ListChecks, RotateCcw } from "lucide-react";
import { AdminMetricCard } from "@/components/finance/AdminMetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";
import { formatDateTime } from "@/lib/fonfamper/format";

export const dynamic = "force-dynamic";

function severityTone(status: string) {
  return status === "Fallido" ? "red" : "green";
}

export default async function AdminAuditPage() {
  const adminData = await getDemoAdminData();
  const latestAuditDate = adminData.auditLogs[0]?.createdAt?.slice(0, 10) ?? null;
  const todayEvents = latestAuditDate ? adminData.auditLogs.filter((log) => log.createdAt.slice(0, 10) === latestAuditDate).length : 0;

  const loginCount = adminData.auditLogs.filter((log) => log.module === "Seguridad" && log.action.toLowerCase().includes("inicio")).length;
  const registerCount = adminData.auditLogs.filter((log) => log.action.toLowerCase().includes("crear") || log.action.toLowerCase().includes("editar")).length;
  const alertCount = adminData.auditLogs.filter((log) => log.status === "Fallido").length;

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Auditoría</h2>
        <p className="mt-2 text-base text-slate-500">Rastrea cambios, accesos y operaciones del sistema</p>
      </div>

      {adminData.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-semibold">No se pudieron cargar algunos datos administrativos.</p>
        </Card>
      ) : null}

      <Card className="min-w-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-slate-700">Fecha</span>
            <Select defaultValue="fecha">
              <option value="fecha">{adminData.timeline.auditPeriodLabel}</option>
            </Select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-slate-700">Usuario</span>
            <Select defaultValue="todos">
              <option value="todos">Todos los usuarios</option>
            </Select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-slate-700">Tipo de evento</span>
            <Select defaultValue="tipos">
              <option value="tipos">Todos los tipos</option>
            </Select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-slate-700">Estado</span>
            <Select defaultValue="estados">
              <option value="estados">Todos los estados</option>
            </Select>
          </label>
          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              <RotateCcw className="h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard title="Eventos hoy" value={`${todayEvents}`} helper="En el último día cargado" icon={History} />
        <AdminMetricCard title="Inicios de sesión" value={`${loginCount}`} helper="Exitosos" icon={KeyRound} tone="green" />
        <AdminMetricCard title="Cambios de registros" value={`${registerCount}`} helper="Modificaciones" icon={ListChecks} />
        <AdminMetricCard title="Alertas" value={alertCount.toString()} helper="Sin alertas críticas" icon={AlertCircle} tone="gray" />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0">
          <h3 className="mb-5 text-lg font-extrabold text-slate-950">Registro de auditoría</h3>

          <div className="hidden md:block">
          <div className="w-full max-w-full overflow-x-auto">
              <table className="min-w-[1280px] w-full table-fixed border-collapse text-left text-sm">
                <colgroup>
                  <col className="w-[220px]" />
                  <col className="w-[220px]" />
                  <col className="w-[150px]" />
                  <col className="w-[150px]" />
                  <col className="w-[420px]" />
                  <col className="w-[120px]" />
                </colgroup>
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Fecha y hora", "Usuario", "Módulo", "Acción", "Descripción", "Estado"].map((column) => (
                      <th key={column} className="px-5 py-4 font-bold whitespace-nowrap">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminData.auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 align-top whitespace-nowrap pr-6 text-slate-700">{formatDateTime(log.createdAt)}</td>
                      <td className="px-5 py-4 align-top min-w-0 whitespace-normal break-words pl-6 font-bold text-slate-950">{log.actorName}</td>
                      <td className="px-5 py-4 align-top min-w-0 whitespace-normal break-words text-slate-700">{log.module}</td>
                      <td className="px-5 py-4 align-top min-w-0 whitespace-normal break-words text-slate-700">{log.action}</td>
                      <td className="px-5 py-4 align-top min-w-0 whitespace-normal break-words leading-relaxed text-slate-700">{log.description}</td>
                      <td className="px-5 py-4 align-top whitespace-nowrap pl-6">
                        <Badge tone={severityTone(log.status)}>{log.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {adminData.auditLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="whitespace-nowrap text-xs font-semibold text-slate-500">{formatDateTime(log.createdAt)}</p>
                    <p className="break-words text-sm font-extrabold text-slate-950">{log.actorName}</p>
                  </div>
                  <Badge tone={severityTone(log.status)}>{log.status}</Badge>
                </div>

                <dl className="mt-4 grid gap-3">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Módulo</dt>
                    <dd className="mt-1 break-words text-sm text-slate-700">{log.module}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Acción</dt>
                    <dd className="mt-1 break-words text-sm text-slate-700">{log.action}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Descripción</dt>
                    <dd className="mt-1 break-words text-sm leading-6 text-slate-700">{log.description}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="min-w-0">
            <h3 className="text-lg font-extrabold text-slate-950">Actividad reciente</h3>
            <div className="mt-5 space-y-3">
              {adminData.recentAuditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold leading-6 text-slate-950">
                        {log.actorName} {log.action.toLowerCase()} en {log.module}
                      </p>
                      <p className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-500">{formatDateTime(log.createdAt)}</p>
                    </div>
                    <Badge tone={severityTone(log.status)}>{log.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="min-w-0">
            <h3 className="text-lg font-extrabold text-slate-950">Exportar auditoría</h3>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Formato de archivo</span>
              <Select defaultValue="xlsx">
                <option value="xlsx">Excel (.xlsx)</option>
              </Select>
            </label>
            <Button className="mt-5 w-full">
              <FileDown className="h-4 w-4" />
              Exportar
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
