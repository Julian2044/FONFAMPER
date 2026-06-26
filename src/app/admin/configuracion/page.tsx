import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";

export const dynamic = "force-dynamic";

const baseRows = (periodLabel: string) => [
  ["Nombre del fondo", "FONFAMPER"],
  ["Moneda", "COP"],
  ["Periodo actual", periodLabel],
  ["Estado del sistema", "Activo"]
] as const;

const movementRows = [
  ["Aportes manuales", "Activado"],
  ["Retiros", "Requieren revisión"],
  ["Adjuntar soporte", "Opcional"],
  ["Notificaciones por correo", "Activado"]
] as const;

const securityRows = [
  ["Verificación administrativa", "Activada"],
  ["Auditoría de cambios", "Activada"],
  ["Sesiones simultáneas", "Permitidas"],
  ["Bloqueo por intentos fallidos", "Activado"]
] as const;

const visualPrefs = [
  ["Tema", "Claro"],
  ["Color principal", "Azul FONFAMPER"],
  ["Idioma", "Español"],
  ["Formato monetario", "COP"]
] as const;

function SettingsCard({ title, rows }: { title: string; rows: readonly (readonly [string, string])[] }) {
  return (
    <Card className="min-w-0">
      <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
      <div className="mt-5 divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="text-sm font-semibold text-slate-500">{label}</span>
            <span className="break-words text-sm font-extrabold text-slate-950">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default async function AdminSettingsPage() {
  const adminData = await getDemoAdminData();
  const periodLabel = adminData.timeline.latestMovementMonthLabel;

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Configuración</h2>
        <p className="mt-2 text-base text-slate-500">Administra parámetros generales del sistema.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <SettingsCard title="Parámetros del fondo" rows={baseRows(periodLabel)} />
          <SettingsCard title="Reglas de movimientos" rows={movementRows} />
        </div>

        <div className="space-y-6">
          <SettingsCard title="Seguridad" rows={securityRows} />
          <SettingsCard title="Preferencias visuales" rows={visualPrefs} />
        </div>
      </div>

      <Card className="min-w-0">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-extrabold text-slate-950">Cambios demo</p>
            <p className="mt-1 text-sm text-slate-500">Estos controles no guardan información real.</p>
          </div>
          <div className="grid gap-3 sm:flex">
            <Button className="w-full sm:w-auto">
              <Save className="h-4 w-4" />
              Guardar cambios
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" />
              Restaurar valores
            </Button>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          Controles visuales sin guardado real. Periodo de referencia: {periodLabel}.
        </div>
      </Card>
    </div>
  );
}
