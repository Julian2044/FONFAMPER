import { Download, Eye, FileText, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";
import { formatCurrencyCOP, formatDate, formatDateTime, formatDocumentId } from "@/lib/fonfamper/format";

export const dynamic = "force-dynamic";

export default async function AdminStatementsPage() {
  const adminData = await getDemoAdminData();
  const saverUsers = adminData.users.filter((user) => user.role === "AHORRADOR" && user.account);
  const selectedUser = saverUsers[0] ?? adminData.users.find((user) => user.account) ?? null;

  const statementItems = saverUsers.map((user) => {
    const userMovements = adminData.movements
      .filter((movement) => movement.profileId === user.id)
      .sort((left, right) => new Date(left.movementDate).getTime() - new Date(right.movementDate).getTime());
    const period =
      userMovements.length > 0
        ? `${formatDate(userMovements[0].movementDate)} - ${formatDate(userMovements[userMovements.length - 1].movementDate)}`
        : adminData.timeline.statementPeriodLabel;

    return {
      id: user.id,
      user: user.fullName,
      period,
      initialBalance: formatCurrencyCOP(user.summary.initialBalance),
      contributions: formatCurrencyCOP(user.summary.totalContributions),
      utilities: formatCurrencyCOP(user.summary.totalUtilities),
      withdrawals: formatCurrencyCOP(user.summary.totalWithdrawals),
      finalBalance: formatCurrencyCOP(user.summary.currentBalance)
    };
  });

  const topMetrics = [
    ["Estados generados", saverUsers.length ? "1" : "0"],
    ["Pendientes", "0"],
    ["Último periodo", adminData.timeline.latestMovementMonthLabel],
    ["Descargas", "0"]
  ] as const;

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Estados de cuenta</h2>
        <p className="mt-2 text-base text-slate-500">Genera, consulta y descarga estados de cuenta de los ahorradores.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {topMetrics.map(([label, value]) => (
          <Card key={label} className="min-h-[132px]">
            <p className="break-words text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 whitespace-nowrap text-[22px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6 min-w-0">
          <Card className="min-w-0">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Usuario</span>
                <Select defaultValue={selectedUser?.id ?? "todos"}>
                  <option value="todos">Todos los usuarios</option>
                  {saverUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </Select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Periodo</span>
                <Select defaultValue="periodo-real">
                  <option value="periodo-real">{adminData.timeline.statementPeriodLabel}</option>
                </Select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Estado</span>
                <Select defaultValue="todos">
                  <option value="todos">Todos</option>
                </Select>
              </label>
              <div className="flex items-end">
                <Button className="w-full">
                  <FileText className="h-4 w-4" />
                  Generar estados
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {statementItems.map((item) => (
              <Card key={item.id} className="min-w-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-lg font-extrabold text-slate-950">{item.user}</p>
                    <p className="mt-1 break-words text-sm text-slate-500">Periodo: {item.period}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge tone="green">Generado</Badge>
                    <button type="button" className="inline-flex whitespace-nowrap text-sm font-extrabold text-[#0057d7]">
                      Ver
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Saldo inicial</p>
                    <p className="mt-2 whitespace-nowrap font-bold text-slate-950">{item.initialBalance}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Aportes</p>
                    <p className="mt-2 whitespace-nowrap font-bold text-slate-950">{item.contributions}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Utilidades</p>
                    <p className="mt-2 whitespace-nowrap font-bold text-slate-950">{item.utilities}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Retiros</p>
                    <p className="mt-2 whitespace-nowrap font-bold text-slate-950">{item.withdrawals}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase text-[#062B5F]">Saldo final</p>
                    <p className="mt-2 whitespace-nowrap text-lg font-extrabold text-[#062B5F]">{item.finalBalance}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="min-w-0">
          <h3 className="text-lg font-extrabold text-slate-950">Vista previa</h3>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="min-h-[420px] rounded-xl bg-white p-5 shadow-sm sm:p-6">
              <div className="border-b border-slate-200 pb-4">
                <p className="text-xl font-extrabold text-[#062B5F]">FONFAMPER</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Estado de cuenta - {adminData.timeline.latestMovementMonthLabel}</p>
              </div>
              {selectedUser ? (
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">Titular</span>
                    <span className="break-words font-bold text-slate-950">{selectedUser.fullName}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">Documento</span>
                    <span className="break-words font-bold text-slate-950">{formatDocumentId(selectedUser.documentId)}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">Periodo</span>
                    <span className="break-words font-bold text-slate-950">{adminData.timeline.statementPeriodLabel}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">Fecha de emisión</span>
                    <span className="break-words font-bold text-slate-950">{formatDateTime(adminData.timeline.reportIssuedAt)}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">Saldo inicial</span>
                    <span className="whitespace-nowrap font-bold">{formatCurrencyCOP(selectedUser.summary.initialBalance)}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">Aportes</span>
                    <span className="whitespace-nowrap font-bold">{formatCurrencyCOP(selectedUser.summary.totalContributions)}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">Utilidades</span>
                    <span className="whitespace-nowrap font-bold">{formatCurrencyCOP(selectedUser.summary.totalUtilities)}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">Retiros</span>
                    <span className="whitespace-nowrap font-bold">{formatCurrencyCOP(selectedUser.summary.totalWithdrawals)}</span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl bg-blue-50 p-3 text-[#062B5F] sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-bold">Saldo final</span>
                    <span className="whitespace-nowrap font-extrabold">{formatCurrencyCOP(selectedUser.summary.currentBalance)}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-sm text-slate-500">No se encontró un ahorrador para mostrar la vista previa.</div>
              )}
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <Button variant="secondary" className="w-full">
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
            <Button variant="secondary" className="w-full">
              <Mail className="h-4 w-4" />
              Enviar por correo
            </Button>
            <Button className="w-full">
              <Eye className="h-4 w-4" />
              Ver detalle
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
