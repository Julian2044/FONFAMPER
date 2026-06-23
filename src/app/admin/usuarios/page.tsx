"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Ban, FileText, MoreHorizontal, Pencil, PlusCircle, Search } from "lucide-react";
import { AvatarPlaceholder } from "@/components/ui/AvatarPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { demoSavers } from "@/data/demo/admin";
import { formatCOP } from "@/lib/format";
import { cn } from "@/lib/utils";

const camiloSummary = [
  ["Saldo actual", 950000],
  ["Saldo inicial", 900000],
  ["Aportes", 50000],
  ["Utilidades", 0],
  ["Retiros", 0]
] as const;

const userInfoBase = [
  ["Documento", "1.098.765.432"],
  ["Teléfono", "310 123 4567"],
  ["Fecha de registro", "15 may 2023"],
  ["Estado", "Activo"]
] as const;

const selectedUserMovements = [
  ["14 may 2024 09:18", "Saldo acumulado anterior", "Saldo anterior", 900000, 900000],
  ["14 may 2024 10:35", "Aporte de enero", "Aporte", 50000, 950000]
] as const;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function buildDemoProfile(name: string, index: number) {
  if (name === "Camilo Perez") {
    return {
      name,
      email: "camilo.perez@email.com",
      document: "1.098.765.432",
      phone: "310 123 4567",
      registeredAt: "15 may 2023",
      activeLabel: "Activo",
      summary: camiloSummary,
      recentMovements: selectedUserMovements
    };
  }

  return {
    name,
    email: `${slugify(name)}@email.com`,
    document: `1.098.765.${String(500 + index).padStart(3, "0")}`,
    phone: `310 123 45${String(index + 1).padStart(2, "0")}`,
    registeredAt: "15 may 2023",
    activeLabel: "Activo",
    summary: camiloSummary,
    recentMovements: [
      ["14 may 2024 09:18", `Saldo acumulado anterior de ${name}`, "Saldo anterior", 900000, 900000],
      ["14 may 2024 10:35", `Aporte de enero de ${name}`, "Aporte", 50000, 950000]
    ] as const
  };
}

export default function AdminUsersPage() {
  const [selectedUserName, setSelectedUserName] = useState("Camilo Perez");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const selectedUserIndex = demoSavers.findIndex((saver) => saver.name === selectedUserName);
  const selectedProfile = buildDemoProfile(selectedUserName, selectedUserIndex >= 0 ? selectedUserIndex : 0);
  const showMobileList = !mobileDetailOpen;

  return (
    <div className="space-y-8 min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="min-w-0">
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Usuarios</h2>
        <p className="mt-2 text-base text-slate-500">Administra cuentas y consulta su estado.</p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
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
            <div className="grid grid-cols-1 bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500 sm:grid-cols-[minmax(0,1fr)_120px]">
              <span>Usuario</span>
              <span className="hidden sm:block">Estado</span>
            </div>
            <div className="divide-y divide-slate-100">
              {demoSavers.map((saver) => {
                const selected = saver.name === selectedUserName;

                return (
                  <button
                    key={saver.name}
                    type="button"
                    onClick={() => {
                      setSelectedUserName(saver.name);
                      setMobileDetailOpen(true);
                    }}
                    className={cn(
                      "grid w-full grid-cols-1 items-center gap-3 px-4 py-3 text-left transition sm:grid-cols-[minmax(0,1fr)_120px] sm:gap-0",
                      selected ? "bg-blue-50" : "bg-white hover:bg-slate-50"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <AvatarPlaceholder name={saver.name} size="sm" />
                      <span className="truncate font-bold text-slate-950">{saver.name}</span>
                    </div>
                    <div className="justify-self-start sm:justify-self-end">
                      <Badge tone="green">{saver.status}</Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row sm:items-center">
            <span>Mostrando 1 a 11 de 11 usuarios</span>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0057d9] text-sm font-extrabold text-white">1</span>
            </div>
          </div>
        </Card>

        <Card className={cn("min-w-0 max-w-full", mobileDetailOpen ? "block" : "hidden lg:block")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {mobileDetailOpen ? (
                <Button
                  variant="secondary"
                  className="w-full sm:hidden"
                  onClick={() => setMobileDetailOpen(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a usuarios
                </Button>
              ) : null}
              <AvatarPlaceholder name={selectedProfile.name} size="lg" />
              <div className="min-w-0">
                <h3 className="text-3xl font-extrabold text-slate-950">{selectedProfile.name}</h3>
                <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  {selectedProfile.activeLabel}
                </div>
              </div>
            </div>
            <button type="button" aria-label={`Opciones de ${selectedProfile.name}`} className="self-start rounded-full p-2 text-slate-400 hover:bg-slate-100">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {selectedProfile.summary.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-2 whitespace-nowrap font-extrabold text-slate-950">{formatCOP(value)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Nombre completo</p>
              <p className="mt-1 font-bold text-slate-950">{selectedProfile.name}</p>
            </div>
            {userInfoBase.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-1 whitespace-nowrap font-bold text-slate-950">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Correo electrónico</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedProfile.email}</p>
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

          <div className="mt-8">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h3 className="text-lg font-extrabold text-slate-950">Movimientos recientes</h3>
              <span className="text-sm font-extrabold text-[#0057d7]">Ver todos los movimientos</span>
            </div>

            <div className="space-y-3 lg:hidden">
              {selectedProfile.recentMovements.map(([date, description, type, amount, balance]) => (
                <div key={`${date}-${description}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-950">{description}</p>
                      <p className="mt-1 text-xs text-slate-500">{date}</p>
                    </div>
                    <Badge tone="green">{type}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Monto</span>
                      <span className="whitespace-nowrap font-bold text-slate-950">{formatCOP(amount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Saldo resultante</span>
                      <span className="whitespace-nowrap font-bold text-slate-950">{formatCOP(balance)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <DataTable
                columns={["Fecha", "Descripción", "Tipo", "Monto", "Saldo resultante"]}
                rows={selectedProfile.recentMovements.map(([date, description, type, amount, balance]) => [
                  date,
                  description,
                  type,
                  <span key="amount" className="whitespace-nowrap font-bold text-slate-950">
                    {formatCOP(amount)}
                  </span>,
                  <span key="balance" className="whitespace-nowrap font-bold text-slate-950">
                    {formatCOP(balance)}
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
