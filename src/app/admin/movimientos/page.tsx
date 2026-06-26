import { CalendarDays, CheckCircle2, CloudUpload, DollarSign, FileText, Save, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";

export const dynamic = "force-dynamic";

function movementLabel(type: "SALDO_INICIAL" | "APORTE" | "RETIRO" | "AJUSTE") {
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

export default async function AdminMovementsPage() {
  const adminData = await getDemoAdminData();
  const selectedUser = adminData.users.find((user) => user.role === "AHORRADOR") ?? adminData.users[0] ?? null;
  const latestMovement = selectedUser?.recentMovements[0] ?? null;
  const latestMovementDate = latestMovement?.movementDate ?? adminData.timeline.latestMovementDate ?? new Date().toISOString();

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Registrar movimiento</h2>
        <p className="mt-2 text-base text-slate-500">Agrega aportes, retiros o ajustes a una cuenta</p>
      </div>

      {adminData.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-semibold">No se pudieron cargar algunos datos administrativos.</p>
        </Card>
      ) : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">Usuario</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Select className="pl-10" defaultValue={selectedUser?.id ?? ""}>
                  {adminData.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </Select>
              </div>
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">Tipo de movimiento</span>
              <Select defaultValue="aporte">
                <option value="aporte">Aporte</option>
                <option value="retiro">Retiro</option>
                <option value="ajuste">Ajuste</option>
              </Select>
            </label>
            <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Fecha</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input className="pl-10" defaultValue={formatDate(latestMovementDate)} />
                </div>
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Valor</span>
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input className="pl-10" defaultValue={formatCurrencyCOP(latestMovement?.amount ?? 0)} />
                </div>
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Descripción</span>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input className="pl-10" defaultValue={latestMovement?.concept ?? "Movimiento de lectura"} />
                </div>
              </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Observaciones opcional</span>
              <Input placeholder="Agregar observaciones internas" />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:p-8">
            <CloudUpload className="mx-auto h-11 w-11 text-[#0057d9]" />
            <p className="mt-3 font-extrabold text-slate-950">Arrastra y suelta tu archivo aquí</p>
            <p className="mt-1 text-sm text-slate-500">o haz clic para seleccionar un archivo</p>
            <p className="mt-3 text-xs text-slate-400">Formatos permitidos: PDF, JPG, PNG (Máx. 10 MB)</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Resumen del movimiento</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Saldo anterior</span>
                <span className="whitespace-nowrap font-bold text-slate-950">{formatCurrencyCOP(selectedUser?.summary.initialBalance ?? 0)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Nuevo saldo</span>
                <span className="whitespace-nowrap font-bold text-[#0057d9]">{formatCurrencyCOP(selectedUser?.summary.currentBalance ?? 0)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Estado</span>
                <Badge tone="green">Aplicado</Badge>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-600">
              Registro real pendiente de fase CRUD. Este movimiento solo es una vista previa de lectura.
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Movimientos recientes</h3>
            <div className="mt-5 space-y-3">
              {selectedUser?.recentMovements.map((movement) => (
                <div key={movement.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-extrabold text-slate-950">{movement.concept}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(movement.movementDate)}</p>
                    </div>
                    <Badge tone={movement.movementType === "RETIRO" ? "red" : "green"}>{movementLabel(movement.movementType)}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Monto</span>
                      <span className="whitespace-nowrap font-bold text-slate-950">{formatCurrencyCOP(movement.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Saldo resultante</span>
                      <span className="whitespace-nowrap font-bold text-slate-950">{formatCurrencyCOP(movement.balanceAfter)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" className="w-full">
              Cancelar
            </Button>
            <Button className="w-full">
              <Save className="h-4 w-4" />
              Registrar movimiento
            </Button>
          </div>

          <Card className="bg-blue-50/60">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0057d7]" />
              <p className="text-sm font-medium text-slate-600">Vista previa con datos reales de lectura, sin guardado real.</p>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <h3 className="text-lg font-extrabold text-slate-950">Detalle de movimientos del usuario</h3>
        <div className="mt-5">
          <DataTable
            columns={["Fecha", "Descripción", "Tipo", "Monto", "Saldo resultante"]}
            rows={(selectedUser?.recentMovements ?? []).map((movement) => [
              formatDate(movement.movementDate),
              movement.concept,
              movementLabel(movement.movementType),
              <span key="amount" className="whitespace-nowrap font-bold text-slate-950">
                {formatCurrencyCOP(movement.amount)}
              </span>,
              <span key="balance" className="whitespace-nowrap font-bold text-slate-950">
                {formatCurrencyCOP(movement.balanceAfter)}
              </span>
            ])}
          />
        </div>
      </Card>
    </div>
  );
}
