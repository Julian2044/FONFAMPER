import { KeyRound, Mail, MapPin, Monitor, Phone, UserRound } from "lucide-react";
import { AvatarPlaceholder } from "@/components/ui/AvatarPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { camilo } from "@/data/demo/camilo";

const personal = [
  ["Nombre completo", "Camilo Perez", UserRound],
  ["Correo electrónico", "camilo.perez@email.com", Mail],
  ["Celular", "+57 300 *** ** 45", Phone],
  ["Documento de identidad", "C.C. 1.234.*** ***", KeyRound]
] as const;

export default function SaverProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Mi perfil</h2>
        <p className="mt-2 text-base text-slate-500">Gestiona tu información y seguridad.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <AvatarPlaceholder name={camilo.name} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-3xl font-extrabold text-slate-950">{camilo.name}</h3>
                  <Badge tone="green">Activo</Badge>
                </div>
                <p className="mt-2 text-sm font-bold text-[#0057d9]">{camilo.role}</p>
                <p className="mt-3 text-sm text-slate-500">Miembro desde el 12 de marzo de 2020</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Datos personales</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {personal.map(([label, value, Icon]) => (
                <div key={label} className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                  <Icon className="mt-0.5 h-5 w-5 text-[#0057d9]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Seguridad</h3>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <span className="text-sm text-slate-500">Contraseña: <b className="text-slate-950">************</b></span>
                <Button variant="secondary">Cambiar</Button>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <span className="text-sm font-bold text-slate-700">Verificación en dos pasos</span>
                <span className="h-7 w-12 rounded-full bg-emerald-500 p-1"><span className="block h-5 w-5 translate-x-5 rounded-full bg-white" /></span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <span className="text-sm font-bold text-slate-700">Cerrar sesiones activas</span>
                <Button variant="secondary">Cerrar sesiones</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Resumen de seguridad</h3>
            <div className="mt-5 space-y-4 text-sm">
              {[
                ["Contraseña actualizada", "Actualizada", "Hace 8 días"],
                ["Verificación en dos pasos", "Activada", ""],
                ["Sesiones activas", "1 activa", ""],
                ["Último chequeo de seguridad", "15 de mayo de 2025", "Hace 3 días"]
              ].map(([label, value, helper]) => (
                <div key={label} className="border-b border-slate-100 pb-3 last:border-0">
                  <p className="font-bold text-slate-950">{label}</p>
                  <p className="mt-1 text-slate-500">{value} {helper}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Accesos recientes</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <Monitor className="h-5 w-5 text-[#0057d9]" />
                <div><p className="font-bold text-slate-950">Sesión actual</p><p className="text-slate-500">Bogotá, Colombia</p><p className="text-slate-500">Chrome en Windows</p><p className="text-slate-500">IP: 190.144.*** **</p></div>
              </div>
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div><p className="font-bold text-slate-950">Medellín, Colombia</p><p className="text-slate-500">Safari en iPhone</p><p className="text-slate-500">14 de mayo de 2025, 09:23 a. m.</p></div>
              </div>
            </div>
            <p className="mt-5 text-sm font-bold text-[#0057d9]">Ver todos los accesos</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
