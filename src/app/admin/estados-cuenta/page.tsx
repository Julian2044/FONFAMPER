import { Download, Eye, FileText, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { formatCOP } from "@/lib/format";

const metrics = [
  ["Estados generados", "15"],
  ["Pendientes", "2"],
  ["Último periodo", "Mayo 2024"],
  ["Descargas", "28"]
] as const;

const statementRows = [
  ["Camilo Perez", "Mayo 2024", 900000, 50000, 0, 0, 950000, "Generado", "Ver"],
  ["Nelly Súa Estepa", "Mayo 2024", 1100000, 100000, 0, 0, 1200000, "Generado", "Ver"],
  ["Felipe Aguilar Sua", "Mayo 2024", 1200000, 200000, 0, 0, 1400000, "Generado", "Ver"],
  ["Esteban Aguilar Sua", "Mayo 2024", 800000, 120000, 0, 0, 920000, "Pendiente", "Generar"]
] as const;

export default function AdminStatementsPage() {
  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Estados de cuenta</h2>
        <p className="mt-2 text-base text-slate-500">Genera, consulta y descarga estados de cuenta de los ahorradores.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label} className="min-h-[132px]">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 whitespace-nowrap text-[24px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="min-w-0">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Usuario</span>
                <Select defaultValue="todos">
                  <option value="todos">Todos los usuarios</option>
                </Select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Periodo</span>
                <Select defaultValue="mayo-2024">
                  <option value="mayo-2024">Mayo 2024</option>
                </Select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Estado</span>
                <Select defaultValue="todos">
                  <option value="todos">Todos</option>
                </Select>
              </label>
              <div className="flex items-end">
                <Button>
                  <FileText className="h-4 w-4" />
                  Generar estados
                </Button>
              </div>
            </div>
          </Card>

          <Card className="min-w-0">
            <DataTable
              columns={["Usuario", "Periodo", "Saldo inicial", "Aportes", "Utilidades", "Retiros", "Saldo final", "Estado", "Acción"]}
              rows={statementRows.map(([user, period, initial, contributions, utilities, withdrawals, finalBalance, status, action]) => [
                <span key="user" className="font-bold text-slate-950">{user}</span>,
                period,
                formatCOP(initial),
                formatCOP(contributions),
                formatCOP(utilities),
                formatCOP(withdrawals),
                <span key="final" className="font-bold text-slate-950">{formatCOP(finalBalance)}</span>,
                <Badge key="status" tone={status === "Generado" ? "green" : "gray"}>{status}</Badge>,
                <button key="action" type="button" className="font-extrabold text-[#0057d9]">{action}</button>
              ])}
            />
          </Card>
        </div>

        <Card className="min-w-0">
          <h3 className="text-lg font-extrabold text-slate-950">Vista previa</h3>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="min-h-[420px] rounded-xl bg-white p-6 shadow-sm">
              <div className="border-b border-slate-200 pb-4">
                <p className="text-xl font-extrabold text-[#062B5F]">FONFAMPER</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Estado de cuenta - Mayo 2024</p>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Titular</span><span className="font-bold text-slate-950">Camilo Perez</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Saldo inicial</span><span className="font-bold">{formatCOP(900000)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Aportes</span><span className="font-bold">{formatCOP(50000)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Utilidades</span><span className="font-bold">{formatCOP(0)}</span></div>
                <div className="flex justify-between rounded-xl bg-blue-50 p-3 text-[#062B5F]"><span className="font-bold">Saldo final</span><span className="font-extrabold">{formatCOP(950000)}</span></div>
              </div>
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
