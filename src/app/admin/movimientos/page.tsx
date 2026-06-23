"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CheckCircle2, CloudUpload, DollarSign, FileText, Save, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCOP } from "@/lib/format";

export default function AdminMovementsPage() {
  const [ready, setReady] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Registrar movimiento</h2>
        <p className="mt-2 text-base text-slate-500">Agrega aportes, retiros o ajustes a una cuenta</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">Usuario</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Select className="pl-10" defaultValue="camilo">
                  <option value="camilo">Camilo Perez</option>
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
                <Input className="pl-10" defaultValue="15/01/2023" />
              </div>
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">Valor</span>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10" defaultValue="$50.000" />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Descripción</span>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10" defaultValue="Aporte de enero" />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Observaciones opcional</span>
              <Input placeholder="Agregar observaciones internas" />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
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
                <span className="font-bold text-slate-950">{formatCOP(900000)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Nuevo saldo</span>
                <span className="font-bold text-[#0057d9]">{formatCOP(950000)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Estado</span>
                <Badge tone="green">Aplicado</Badge>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-600">
              Este movimiento se aplicará de inmediato a la cuenta del usuario seleccionado.
            </div>
          </Card>

          <div className="flex gap-3">
            <Link href="/admin/dashboard" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#004aad] ring-1 ring-[#0057d9]/25 transition hover:bg-blue-50">
              Cancelar
            </Link>
            <Button className="flex-1" onClick={() => setReady(true)}>
              <Save className="h-4 w-4" />
              Registrar movimiento
            </Button>
          </div>

          <Card className={ready ? "bg-emerald-50" : "bg-blue-50/60"}>
            <div className="flex gap-3">
              <CheckCircle2 className={ready ? "h-5 w-5 text-emerald-700" : "h-5 w-5 text-[#0057d9]"} />
              <p className={ready ? "text-sm font-medium text-emerald-800" : "text-sm font-medium text-slate-600"}>
                {ready ? "Movimiento listo para registrar. Demo visual sin guardado real." : "Vista previa con datos demo locales, sin guardado real."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
