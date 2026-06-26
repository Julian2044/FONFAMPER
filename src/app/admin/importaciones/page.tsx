import { CheckCircle2, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { UploadBox } from "@/components/ui/UploadBox";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";
import { formatCurrencyCOP } from "@/lib/fonfamper/format";

export const dynamic = "force-dynamic";

type AdminData = Awaited<ReturnType<typeof getDemoAdminData>>;

function monthTotal(profileId: string, monthIndex: number, movements: AdminData["movements"]) {
  return movements
    .filter((movement) => movement.profileId === profileId && movement.movementType === "APORTE" && new Date(movement.movementDate).getMonth() === monthIndex)
    .reduce((total, movement) => total + movement.amount, 0);
}

export default async function AdminImportsPage() {
  const adminData = await getDemoAdminData();
  const saverUsers = adminData.users.filter((user) => user.esAhorrador);
  const previewRows = saverUsers.map((user) => {
    const enero = monthTotal(user.id, 0, adminData.movements);
    const febrero = monthTotal(user.id, 1, adminData.movements);

    return [
      <span key="name" className="font-bold text-slate-950">
        {user.fullName}
      </span>,
      formatCurrencyCOP(user.summary.initialBalance),
      formatCurrencyCOP(enero),
      formatCurrencyCOP(febrero),
      <span key="total" className="whitespace-nowrap font-bold text-slate-950">
        {formatCurrencyCOP(user.summary.currentBalance)}
      </span>,
      <Badge key="status" tone="green">
        Válido
      </Badge>
    ];
  });

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Importar Excel</h2>
        <p className="mt-2 text-base text-slate-500">Carga y valida movimientos desde archivo</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["Cargar archivo", "Validar columnas", "Revisar registros", "Confirmar importación"].map((step, index) => (
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

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <Card className="min-w-0">
          <UploadBox
            title="Arrastra y suelta tu archivo Excel aquí"
            description="o selecciona un archivo desde tu dispositivo"
            primaryLabel="Seleccionar archivo"
            secondaryLabel="Descargar plantilla"
            helper="Formatos permitidos: .xlsx, .xls. Tamaño máximo: 10 MB"
          />
        </Card>

        <Card className="min-w-0">
          <h3 className="text-lg font-extrabold text-slate-950">Validación del archivo</h3>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">Totales coinciden</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">{previewRows.length} registro{previewRows.length === 1 ? "" : "s"} válido{previewRows.length === 1 ? "" : "s"}</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <FileSpreadsheet className="h-7 w-7 text-[#0057d9]" />
              <p className="mt-3 font-extrabold text-slate-950">Aportes_lectura_real.xlsx</p>
              <p className="mt-1 text-slate-500">Vista previa con datos reales de Supabase</p>
              <p className="mt-1 text-slate-500">{adminData.timeline.statementPeriodLabel}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="min-w-0">
        <h3 className="mb-5 text-lg font-extrabold text-slate-950">Vista previa</h3>
        {previewRows.length > 0 ? (
          <DataTable
            columns={["Nombre", "Saldo inicial", "Ene", "Feb", "Total", "Estado"]}
            rows={previewRows}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No hay usuarios ahorradores con cuenta para mostrar una vista previa de importación.
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto">
            Cancelar importación
          </Button>
          <Button className="w-full sm:w-auto">Siguiente: Validar columnas</Button>
        </div>
        <p className="mt-4 text-xs text-slate-500">Importación real pendiente de fase posterior.</p>
      </Card>
    </div>
  );
}
