import { Ban, FileText, Pencil, PlusCircle, Search } from "lucide-react";
import { MovementTable } from "@/components/finance/MovementTable";
import { AvatarPlaceholder } from "@/components/ui/AvatarPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { camiloAccount } from "@/data/demo/camilo";
import { demoSavers } from "@/data/demo/admin";
import { formatCOP } from "@/lib/format";

export default function AdminUsersPage() {
  const { summary } = camiloAccount;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Usuarios</h2>
        <p className="mt-2 text-base text-slate-500">Administra cuentas y consulta su estado.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input className="pl-10" placeholder="Buscar usuario..." />
            </div>
            <Select defaultValue="todos"><option value="todos">Todos los estados</option></Select>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Estado</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {demoSavers.map((saver) => {
                  const selected = saver.name === "Camilo Perez";
                  return (
                    <tr key={saver.name} className={selected ? "bg-blue-50" : ""}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarPlaceholder name={saver.name} size="sm" />
                          <span className="font-bold text-slate-950">{saver.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge tone="green">{saver.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <AvatarPlaceholder name="Camilo Perez" size="lg" />
              <div>
                <h3 className="text-3xl font-extrabold text-slate-950">Camilo Perez</h3>
                <Badge tone="green">Activo</Badge>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-5">
              {[
                ["Saldo actual", summary.currentBalance],
                ["Saldo inicial", summary.previousBalance],
                ["Aportes", summary.januaryContribution],
                ["Utilidades", summary.utilities],
                ["Retiros", summary.withdrawals]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-2 font-extrabold text-slate-950">{formatCOP(Number(value))}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Información del usuario</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["Nombre completo", "Camilo Perez"],
                ["Documento", "1.098.765.432"],
                ["Correo electrónico", "camilo.perez@email.com"],
                ["Teléfono", "310 123 4567"],
                ["Fecha de registro", "15 may 2023"],
                ["Estado", "Activo"]
              ].map(([label, value]) => (
                <div key={label}><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-950">{value}</p></div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button><PlusCircle className="h-4 w-4" />Registrar movimiento</Button>
              <Button variant="secondary"><FileText className="h-4 w-4" />Generar estado de cuenta</Button>
              <Button variant="secondary"><Pencil className="h-4 w-4" />Editar usuario</Button>
              <Button variant="secondary"><Ban className="h-4 w-4" />Desactivar acceso</Button>
            </div>
          </Card>

          <Card>
            <h3 className="mb-5 text-lg font-extrabold text-slate-950">Movimientos recientes</h3>
            <MovementTable movements={camiloAccount.movements} />
          </Card>
        </div>
      </div>
    </div>
  );
}
