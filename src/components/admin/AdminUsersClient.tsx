"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Ban, FileText, MoreHorizontal, Pencil, PlusCircle, Search } from "lucide-react";
import { AvatarPlaceholder } from "@/components/ui/AvatarPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AdminUserData } from "@/lib/fonfamper/admin-data";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";
import { cn } from "@/lib/utils";

type AdminUsersClientProps = {
  users: AdminUserData[];
};

function roleLabel(role: AdminUserData["role"]) {
  return role === "ADMIN" ? "Administradora" : "Ahorrador";
}

function roleTone(role: AdminUserData["role"]) {
  return role === "ADMIN" ? "blue" : "green";
}

function movementLabel(type: AdminUserData["recentMovements"][number]["movementType"]) {
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

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  const [selectedUserName, setSelectedUserName] = useState(users.find((user) => user.role === "AHORRADOR")?.fullName ?? users[0]?.fullName ?? "");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.fullName === selectedUserName) ?? users[0] ?? null,
    [selectedUserName, users]
  );

  if (!selectedUser) {
    return (
      <Card className="min-w-0 border-amber-200 bg-amber-50 text-amber-900">
        <p className="text-sm font-semibold">No se pudieron cargar los usuarios administrativos.</p>
      </Card>
    );
  }

  const showMobileList = !mobileDetailOpen;
  const visibleUsers = users;

  return (
    <div className="space-y-8 min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="min-w-0">
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Usuarios</h2>
        <p className="mt-2 text-base text-slate-500">Administra cuentas y consulta su estado.</p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className={cn("min-w-0", showMobileList ? "block" : "hidden lg:block")}>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input className="pl-10" placeholder="Buscar usuario..." />
            </div>
            <Select defaultValue="todos">
              <option value="todos">Todos los estados</option>
            </Select>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500 sm:grid-cols-[minmax(0,1fr)_140px]">
              <span>Usuario</span>
              <span className="hidden sm:block">Estado</span>
            </div>
            <div className="divide-y divide-slate-100">
              {visibleUsers.map((user) => {
                const selected = user.fullName === selectedUserName;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserName(user.fullName);
                      setMobileDetailOpen(true);
                    }}
                    className={cn(
                      "grid w-full grid-cols-1 items-center gap-3 px-4 py-4 text-left transition sm:grid-cols-[minmax(0,1fr)_140px] sm:gap-0",
                      selected ? "bg-blue-50" : "bg-white hover:bg-slate-50"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                        <AvatarPlaceholder name={user.fullName} size="sm" />
                        <div className="min-w-0">
                        <span className="block break-words font-bold leading-5 text-slate-950">{user.fullName}</span>
                        <span className="block break-words text-xs leading-5 text-slate-500">{user.email}</span>
                      </div>
                    </div>
                    <div className="justify-self-start sm:justify-self-end">
                      <Badge tone={roleTone(user.role)}>{roleLabel(user.role)}</Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row sm:items-center">
            <span>Mostrando 1 a {visibleUsers.length} de {visibleUsers.length} usuarios</span>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0057d9] text-sm font-extrabold text-white">1</span>
            </div>
          </div>
        </Card>

        <Card className={cn("min-w-0 max-w-full", mobileDetailOpen ? "block" : "hidden lg:block")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {mobileDetailOpen ? (
                <Button variant="secondary" className="w-full sm:hidden" onClick={() => setMobileDetailOpen(false)}>
                  <ArrowLeft className="h-4 w-4" />
                  Volver a usuarios
                </Button>
              ) : null}
              <AvatarPlaceholder name={selectedUser.fullName} size="lg" />
              <div className="min-w-0">
                <h3 className="text-3xl font-extrabold text-slate-950">{selectedUser.fullName}</h3>
                <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  {roleLabel(selectedUser.role)}
                </div>
              </div>
            </div>
            <button type="button" aria-label={`Opciones de ${selectedUser.fullName}`} className="self-start rounded-full p-2 text-slate-400 hover:bg-slate-100">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Saldo actual", selectedUser.summary.currentBalance],
              ["Saldo inicial", selectedUser.summary.initialBalance],
              ["Aportes", selectedUser.summary.totalContributions],
              ["Utilidades", selectedUser.summary.totalUtilities],
              ["Retiros", selectedUser.summary.totalWithdrawals]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-2 whitespace-nowrap font-extrabold text-slate-950">{formatCurrencyCOP(Number(value))}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Nombre completo</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedUser.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Correo electrónico</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Documento</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedUser.documentId ?? "No registrado"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Teléfono</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedUser.phone ?? "No registrado"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Fecha de registro</p>
              <p className="mt-1 whitespace-nowrap font-bold text-slate-950">{formatDate(selectedUser.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
              <p className="mt-1 font-bold text-slate-950">{selectedUser.status}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/admin/movimientos" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0057d9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004aad]">
              <PlusCircle className="h-4 w-4" />
              Registrar movimiento
            </Link>
            <Link href="/admin/estados-cuenta" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#004aad] ring-1 ring-[#0057d9]/25 transition hover:bg-blue-50">
              <FileText className="h-4 w-4" />
              Generar estado de cuenta
            </Link>
            <Button variant="secondary" className="w-full">
              <Pencil className="h-4 w-4" />
              Editar usuario
            </Button>
            <Button variant="secondary" className="w-full">
              <Ban className="h-4 w-4" />
              Desactivar acceso
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-400">Acción real pendiente de fase CRUD.</p>

          <div className="mt-8">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h3 className="text-lg font-extrabold text-slate-950">Movimientos recientes</h3>
              <span className="text-sm font-extrabold text-[#0057d7]">Ver todos los movimientos</span>
            </div>

            <div className="space-y-3 lg:hidden">
              {selectedUser.recentMovements.map((movement) => (
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

            <div className="hidden lg:block">
              <DataTable
                columns={["Fecha", "Descripción", "Tipo", "Monto", "Saldo resultante"]}
                rows={selectedUser.recentMovements.map((movement) => [
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
          </div>
        </Card>
      </div>
    </div>
  );
}
