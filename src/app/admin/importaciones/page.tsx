import { CheckCircle2, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { UploadBox } from "@/components/ui/UploadBox";
import { importPreviewRows } from "@/data/demo/admin";
import { formatCOP } from "@/lib/format";

const steps = ["Cargar archivo", "Validar columnas", "Revisar registros", "Confirmar importación"];

export default function AdminImportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Importar Excel</h2>
        <p className="mt-2 text-base text-slate-500">Carga y valida movimientos desde archivo</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step} className={index === 0 ? "border-blue-200 bg-blue-50" : "bg-white"}>
            <div className="flex items-center gap-3">
              <div className={index === 0 ? "flex h-9 w-9 items-center justify-center rounded-full bg-[#0057d9] text-sm font-extrabold text-white" : "flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-slate-500"}>
                {index + 1}
              </div>
              <p className="text-sm font-extrabold text-slate-950">{step}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <Card>
          <UploadBox
            title="Arrastra y suelta tu archivo Excel aquí"
            description="o selecciona un archivo desde tu dispositivo"
            primaryLabel="Seleccionar archivo"
            secondaryLabel="Descargar plantilla"
            helper="Formatos permitidos: .xlsx, .xls. Tamaño máximo: 10 MB"
          />
        </Card>

        <Card>
          <h3 className="text-lg font-extrabold text-slate-950">Validación del archivo</h3>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">Totales coinciden</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">8 registros válidos</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <FileSpreadsheet className="h-7 w-7 text-[#0057d9]" />
              <p className="mt-3 font-extrabold text-slate-950">Aportes_mensuales_mayo_2024.xlsx</p>
              <p className="mt-1 text-slate-500">12,4 KB</p>
              <p className="mt-1 text-slate-500">8 filas</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-5 text-lg font-extrabold text-slate-950">Vista previa</h3>
        <DataTable
          columns={["Nombre", "Acumulado año 2022", "Ene", "Feb", "Mar", "Total", "Estado"]}
          rows={importPreviewRows.map(([name, base, ene, feb, mar, total, status]) => [
            <span key="name" className="font-bold text-slate-950">{name}</span>,
            formatCOP(base),
            formatCOP(ene),
            formatCOP(feb),
            formatCOP(mar),
            <span key="total" className="font-bold text-slate-950">{formatCOP(total)}</span>,
            <Badge key="status" tone="green">{status}</Badge>
          ])}
        />
        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <Button variant="secondary">Cancelar importación</Button>
          <Button>Siguiente: Validar columnas</Button>
        </div>
      </Card>
    </div>
  );
}
