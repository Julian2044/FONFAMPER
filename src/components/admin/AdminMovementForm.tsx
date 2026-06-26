"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CloudUpload, DollarSign, FileText, Save, UserRound } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";
import { cn } from "@/lib/utils";
import type { AdminUserData } from "@/lib/fonfamper/admin-data";
import { registerMovementAction } from "@/app/admin/movimientos/actions";
import { useFormStatus } from "react-dom";

type AdminMovementFormProps = {
  users: AdminUserData[];
};

const movementTypeOptions = [
  { value: "APORTE", label: "Aporte" },
  { value: "RETIRO", label: "Retiro" },
  { value: "AJUSTE", label: "Ajuste" }
] as const;

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatInputDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function parseAmount(value: string) {
  const cleaned = value.replace(/[^\d.-]/g, "");
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : 0;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Registrando..." : "Registrar movimiento"}
    </Button>
  );
}

export function AdminMovementForm({ users }: AdminMovementFormProps) {
  const saverUsers = useMemo(() => users.filter((user) => user.account && user.status.toUpperCase() === "ACTIVO"), [users]);
  const initialUser = saverUsers[0] ?? null;

  const [selectedUserId, setSelectedUserId] = useState(initialUser?.id ?? "");
  const [movementType, setMovementType] = useState<(typeof movementTypeOptions)[number]["value"]>("APORTE");
  const [movementDate, setMovementDate] = useState(todayInputValue());
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? initialUser;
  const currentBalance = selectedUser?.summary.currentBalance ?? 0;
  const initialBalance = selectedUser?.summary.initialBalance ?? 0;
  const parsedAmount = parseAmount(amount);
  const previewBalance =
    movementType === "RETIRO"
      ? currentBalance - parsedAmount
      : currentBalance + parsedAmount;
  const previewBalanceTone = movementType === "RETIRO" && parsedAmount > currentBalance ? "text-red-600" : "text-[#0057d9]";

  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card>
          <form action={registerMovementAction} className="grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Usuario</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Select
                  name="target_profile_id"
                  className="pl-10"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                >
                  {saverUsers.length > 0
                    ? saverUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName}
                        </option>
                      ))
                    : null}
                </Select>
              </div>
              {saverUsers.length === 0 ? <p className="mt-2 text-xs font-semibold text-amber-600">No hay personas habilitadas como ahorradoras.</p> : null}
              {selectedUser ? (
                <div className="mt-2 space-y-1 text-xs font-semibold text-slate-500">
                  <p>Saldo actual: {formatCurrencyCOP(selectedUser.summary.currentBalance)}</p>
                  <p>Perfil de ahorro: {selectedUser.account ? "Habilitado" : "No habilitado"}</p>
                </div>
              ) : null}
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">Tipo de movimiento</span>
              <Select name="movement_type" value={movementType} onChange={(event) => setMovementType(event.target.value as (typeof movementTypeOptions)[number]["value"])}>
                {movementTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">Fecha</span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  name="movement_date"
                  className="pl-10"
                  type="date"
                  value={movementDate}
                  onChange={(event) => setMovementDate(event.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">{formatInputDate(movementDate) || "Fecha actual por defecto"}</p>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">Valor</span>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  name="amount"
                  className="pl-10"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="100000"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Concepto</span>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  name="concept"
                  className="pl-10"
                  value={concept}
                  onChange={(event) => setConcept(event.target.value)}
                  placeholder="Aporte de enero"
                />
              </div>
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Descripción</span>
              <Input
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descripción del movimiento"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Observaciones opcional</span>
              <Input
                name="observations"
                value={observations}
                onChange={(event) => setObservations(event.target.value)}
                placeholder="Agregar observaciones internas"
              />
            </label>

            <div className="md:col-span-2">
              <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:p-8">
                <CloudUpload className="mx-auto h-11 w-11 text-[#0057d9]" />
                <p className="mt-3 font-extrabold text-slate-950">Arrastra y suelta tu archivo aquí</p>
                <p className="mt-1 text-sm text-slate-500">o haz clic para seleccionar un archivo</p>
                <p className="mt-3 text-xs text-slate-400">Formatos permitidos: PDF, JPG, PNG (Máx. 10 MB)</p>
              </div>
            </div>

            <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" className="w-full" type="button">
                Cancelar
              </Button>
              <SubmitButton />
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Resumen del movimiento</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Saldo anterior</span>
                <span className="whitespace-nowrap font-bold text-slate-950">{formatCurrencyCOP(currentBalance)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Saldo inicial</span>
                <span className="whitespace-nowrap font-bold text-slate-950">{formatCurrencyCOP(initialBalance)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Nuevo saldo estimado</span>
                <span className={cn("whitespace-nowrap font-bold", previewBalanceTone)}>{formatCurrencyCOP(Math.max(previewBalance, 0))}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Estado</span>
                <Badge tone={movementType === "RETIRO" && parsedAmount > currentBalance ? "red" : "green"}>
                  {movementType === "RETIRO" && parsedAmount > currentBalance ? "No permitido" : "Listo"}
                </Badge>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-600">
              Este resumen usa los datos reales del usuario seleccionado y se actualizará cuando registres el movimiento.
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
                    <Badge tone={movement.movementType === "RETIRO" ? "red" : "green"}>{movement.movementType === "SALDO_INICIAL" ? "Saldo inicial" : movement.movementType === "APORTE" ? "Aporte" : movement.movementType === "RETIRO" ? "Retiro" : "Ajuste"}</Badge>
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
              movement.movementType === "SALDO_INICIAL" ? "Saldo inicial" : movement.movementType === "APORTE" ? "Aporte" : movement.movementType === "RETIRO" ? "Retiro" : "Ajuste",
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
