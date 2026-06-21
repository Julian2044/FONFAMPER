import { CheckCircle2, CloudUpload, Save } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCOP } from "@/lib/format";

export default function AdminMovementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Registrar movimiento</h2>
        <p className="mt-2 text-base text-slate-500">Agrega aportes, retiros o ajustes a una cuenta</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Usuario</span><Select defaultValue="camilo"><option value="camilo">Camilo Perez</option></Select></label>
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Tipo de movimiento</span><Select defaultValue="aporte"><option value="aporte">Aporte</option><option value="retiro">Retiro</option><option value="ajuste">Ajuste</option></Select></label>
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Fecha</span><Input defaultValue="15/01/2023" /></label>
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Valor</span><Input defaultValue="$50.000" /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">Descripción</span><Input defaultValue="Aporte de enero" /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">Observaciones opcional</span><Input placeholder="Agregar observaciones internas" /></label>
          </div>
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <CloudUpload className="mx-auto h-10 w-10 text-[#0057d9]" />
            <p className="mt-3 font-extrabold text-slate-950">Arrastra y suelta tu archivo aquí</p>
            <p className="mt-1 text-sm text-slate-500">o haz clic para seleccionar un archivo</p>
            <p className="mt-3 text-xs text-slate-400">Formatos permitidos: PDF, JPG, PNG (Máx. 10 MB)</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Resumen del movimiento</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Saldo anterior</span><span className="font-bold text-slate-950">{formatCOP(900000)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Nuevo saldo</span><span className="font-bold text-[#0057d9]">{formatCOP(950000)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Estado</span><Badge tone="green">Aplicado</Badge></div>
            </div>
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-600">
              Este movimiento se aplicará de inmediato a la cuenta del usuario seleccionado.
            </div>
          </Card>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1">Cancelar</Button>
            <Button className="flex-1"><Save className="h-4 w-4" />Registrar movimiento</Button>
          </div>
          <Card className="bg-emerald-50">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <p className="text-sm font-medium text-emerald-800">Vista previa con datos demo locales, sin guardado real.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
