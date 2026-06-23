import Link from "next/link";
import { Ban, FileText, MoreHorizontal, Pencil, PlusCircle, Search } from "lucide-react";
import { AvatarPlaceholder } from "@/components/ui/AvatarPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { demoSavers } from "@/data/demo/admin";
import { formatCOP } from "@/lib/format";

const camiloSummary = [
  ["Saldo actual", 950000],
  ["Saldo inicial", 900000],
  ["Aportes", 50000],
  ["Utilidades", 0],
  ["Retiros", 0]
] as const;

const userInfo = [
  ["Nombre completo", "Camilo Perez"],
  ["Documento", "1.098.765.432"],
  ["Correo electrónico", "camilo.perez@email.com"],
  ["Teléfono", "310 123 4567"],
  ["Fecha de registro", "15 may 2023"],
  ["Estado", "Activo"]
] as const;

const recentMovements = [
  ["14 may 2024 09:18", "Saldo acumulado anterior", "Saldo anterior", 900000, 900000],
  ["14 may 2024 10:35", "Aporte de enero", "Aporte", 50000, 950000]
] as const;

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Usuarios</h2>
        <p className="mt-2 text-base text-slate-500">Administra cuentas y consulta su estado.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <Card>
          <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input className="pl-10" placeholder="Buscar usuario..." />
            </div>
            <Select defaultValue="todos">
              <option value="todos">Todos los estados</option>
            </Select>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr_120px] bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500">
              <span>Usuario</span>
              <span>Estado</span>
            </div>
            <div className="divide-y divide-slate-100">
              {demoSavers.map((saver) => {
                const selected = saver.name === "Camilo Perez";

                return (
                  <div key={saver.name} className={selected ? "grid grid-cols-[1fr_120px] items-center bg-blue-50 px-4 py-3" : "grid grid-cols-[1fr_120px] items-center bg-white px-4 py-3"}>
                    <div className="flex min-w-0 items-center gap-3">
                      <AvatarPlaceholder name={saver.name} size="sm" />
                      <span className="truncate font-bold text-slate-950">{saver.name}</span>
                    </div>
                    <Badge tone="green">{saver.status}</Badge>
                  </div>
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

        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <AvatarPlaceholder name="Camilo Perez" size="lg" />
                <div>
                  <h3 className="text-3xl font-extrabold text-slate-950">Camilo Perez</h3>
                  <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    Activo
                  </div>
                </div>
              </div>
              <button type="button" aria-label="Opciones de Camilo Perez" className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {camiloSummary.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-2 font-extrabold text-slate-950">{formatCOP(value)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Información del usuario</h3>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {userInfo.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-1 font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/movimientos" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0057d9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004aad]">
                <PlusCircle className="h-4 w-4" />
                Registrar movimiento
              </Link>
              <Link href="/admin/estados-cuenta" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#004aad] ring-1 ring-[#0057d9]/25 transition hover:bg-blue-50">
                <FileText className="h-4 w-4" />
                Generar estado de cuenta
              </Link>
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Editar usuario
              </Button>
              <Button variant="secondary">
                <Ban className="h-4 w-4" />
                Desactivar acceso
              </Button>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h3 className="text-lg font-extrabold text-slate-950">Movimientos recientes</h3>
              <Link href="/admin/movimientos" className="text-sm font-extrabold text-[#0057d9]">
                Ver todos los movimientos
              </Link>
            </div>
            <DataTable
              columns={["Fecha", "Descripción", "Tipo", "Monto", "Saldo resultante"]}
              rows={recentMovements.map(([date, description, type, amount, balance]) => [
                date,
                description,
                type,
                <span key="amount" className="font-bold text-slate-950">{formatCOP(amount)}</span>,
                <span key="balance" className="font-bold text-slate-950">{formatCOP(balance)}</span>
              ])}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
