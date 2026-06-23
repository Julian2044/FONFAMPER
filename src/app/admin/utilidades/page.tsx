"use client";

import { useState } from "react";
import { Calculator, Download, Gift, UsersRound, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { adminStats, utilityBaseRows } from "@/data/demo/admin";
import { formatCOP } from "@/lib/format";

const utilityCards = [
  ["Utilidades por distribuir", formatCOP(0), "Este mes", Gift],
  ["Última distribución", "Sin registrar", "Aún no se ha realizado ninguna distribución", Gift],
  ["Usuarios elegibles", "17", "Con saldo mayor a $0", UsersRound],
  ["Base de distribución", formatCOP(adminStats.totalManagedBalance), "Saldo total de los usuarios elegibles", Wallet]
] as const;

export default function AdminUtilitiesPage() {
  const [demoState, setDemoState] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Utilidades</h2>
        <p className="mt-2 text-base text-slate-500">Gestiona la distribución y consulta el histórico</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {utilityCards.map(([title, value, helper, Icon]) => (
          <Card key={title}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <p className="mt-3 text-2xl font-extrabold text-slate-950">{value}</p>
                <p className="mt-2 text-xs text-slate-500">{helper}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-[#0057d9]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-extrabold text-slate-950">Distribuciones realizadas</h3>
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#0057d9]">
            <Gift className="h-10 w-10" />
          </div>
          <h4 className="mt-6 text-2xl font-extrabold text-slate-950">Aún no hay utilidades distribuidas</h4>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            No se han registrado distribuciones de utilidades. Crea tu primera distribución para asignar utilidades a los usuarios elegibles.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setDemoState("Simulación preparada con datos demo.")}>
              <Calculator className="h-4 w-4" />
              Simular distribución
            </Button>
            <Button onClick={() => setDemoState("Distribución lista para crear en modo demo.")}>Crear distribución</Button>
          </div>
          {demoState ? <p className="mt-4 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">{demoState}</p> : null}
        </div>
      </Card>

      <Card>
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h3 className="text-lg font-extrabold text-slate-950">Base de distribución</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Exportar (Excel)
            </Button>
            <Select defaultValue="este-mes" className="sm:w-44">
              <option value="este-mes">Este mes</option>
            </Select>
          </div>
        </div>
        <DataTable
          columns={["#", "Usuario", "Saldo base", "Participación", "Utilidad estimada", "Estado"]}
          rows={utilityBaseRows.map(([index, user, base, participation, utility, status]) => [
            index,
            <span key="user" className="font-bold text-slate-950">{user}</span>,
            formatCOP(base),
            participation,
            formatCOP(utility),
            <Badge key="status" tone="gray">{status}</Badge>
          ])}
        />
      </Card>
    </div>
  );
}
