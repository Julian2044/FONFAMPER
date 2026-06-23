import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Chrome,
  Clock3,
  KeyRound,
  LockKeyhole,
  Mail,
  MonitorSmartphone,
  Phone,
  ShieldCheck,
  Smartphone,
  UserRound
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { camilo } from "@/data/demo/camilo";
import { cn } from "@/lib/utils";

const personalData: Array<{
  label: string;
  value: string;
  icon: LucideIcon;
}> = [
  { label: "Nombre completo", value: "Camilo Perez", icon: UserRound },
  { label: "Correo electrónico", value: "camilo.perez@email.com", icon: Mail },
  { label: "Celular", value: "+57 300 *** ** 45", icon: Phone },
  { label: "Documento de identidad", value: "C.C. 1.234.*** ***", icon: KeyRound }
];

const securitySummary: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  status: ReactNode;
}> = [
  {
    title: "Contraseña actualizada",
    description: "Tu contraseña fue actualizada recientemente.",
    icon: LockKeyhole,
    status: (
      <div className="text-right">
        <Badge tone="green">Actualizada</Badge>
        <p className="mt-2 text-xs font-semibold text-slate-500">Hace 8 días</p>
      </div>
    )
  },
  {
    title: "Verificación en dos pasos",
    description: "La verificación en dos pasos está activada.",
    icon: ShieldCheck,
    status: <Badge tone="green">Activada</Badge>
  },
  {
    title: "Sesiones activas",
    description: "Tienes 1 sesión activa en este momento.",
    icon: MonitorSmartphone,
    status: (
      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#004AAD] ring-1 ring-blue-100">1</span>
        activa
      </div>
    )
  },
  {
    title: "Último chequeo de seguridad",
    description: "Revisamos tu cuenta en busca de actividad inusual.",
    icon: CheckCircle2,
    status: (
      <div className="text-right">
        <p className="text-sm font-extrabold text-slate-950">15 de mayo de 2025</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">Hace 3 días</p>
      </div>
    )
  }
];

const recentAccesses = [
  {
    city: "Bogotá, Colombia",
    device: "Chrome en Windows",
    ip: "190.144.*** **",
    time: "Ahora",
    badge: "Actual",
    icon: Chrome,
    iconClassName: "bg-white text-[#004AAD] ring-1 ring-slate-200"
  },
  {
    city: "Medellín, Colombia",
    device: "Safari en iPhone",
    ip: "181.60.*** **",
    date: "14 de mayo de 2025",
    time: "09:23 a. m.",
    icon: Smartphone,
    iconClassName: "bg-blue-50 text-[#004AAD]"
  }
];

function IconBox({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004AAD]", className)}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

function ToggleVisual({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition",
        enabled ? "justify-end bg-[#0A5FD8]" : "justify-start bg-slate-200"
      )}
      aria-hidden="true"
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </span>
  );
}

function ProfileAvatar() {
  return (
    <div
      aria-label={`Avatar de ${camilo.name}`}
      className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 ring-8 ring-slate-50"
    >
      <UserRound className="h-16 w-16" />
    </div>
  );
}

export default function SaverProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Mi perfil</h2>
        <p className="mt-2 text-base text-slate-500">Gestiona tu información y seguridad.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="p-7">
            <p className="text-sm font-extrabold text-slate-950">Perfil</p>
            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
              <ProfileAvatar />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">{camilo.name}</h3>
                  <Badge tone="green">Activo</Badge>
                </div>
                <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-500">
                  <CalendarDays className="h-5 w-5 text-[#004AAD]" />
                  <span>Miembro desde el 12 de marzo de 2020</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-extrabold text-slate-950">Datos personales</h3>
            </div>
            <div className="mt-2 divide-y divide-slate-100 px-6">
              {personalData.map(({ label, value, icon }) => (
                <div key={label} className="flex gap-4 py-5">
                  <IconBox icon={icon} />
                  <div className="grid flex-1 gap-1 sm:grid-cols-[1fr_auto] sm:items-center">
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="text-sm font-extrabold text-slate-950 sm:text-right">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-extrabold text-slate-950">Seguridad</h3>
            </div>
            <div className="mt-2 divide-y divide-slate-100 px-6">
              <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-950">Contraseña</p>
                  <p className="mt-2 text-sm font-semibold text-slate-400">---</p>
                </div>
                <Button variant="secondary" className="w-full sm:w-auto">
                  Cambiar
                </Button>
              </div>
              <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-950">Verificación en dos pasos</p>
                  <p className="mt-1 text-sm text-slate-500">Protege tu cuenta con un código adicional.</p>
                </div>
                <ToggleVisual enabled />
              </div>
              <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-950">Cerrar sesiones activas</p>
                  <p className="mt-1 text-sm text-slate-500">Cierra sesión en todos los dispositivos excepto el actual.</p>
                </div>
                <Button variant="secondary" className="w-full sm:w-auto">
                  Cerrar sesiones
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-0">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-extrabold text-slate-950">Resumen de seguridad</h3>
            </div>
            <div className="mt-2 divide-y divide-slate-100 px-6">
              {securitySummary.map(({ title, description, icon, status }) => (
                <div key={title} className="grid gap-4 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center xl:grid-cols-[auto_1fr] xl:items-start 2xl:grid-cols-[auto_1fr_auto]">
                  <IconBox icon={icon} />
                  <div>
                    <p className="text-sm font-extrabold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                  </div>
                  <div className="sm:justify-self-end xl:col-span-2 xl:ml-[60px] xl:justify-self-start 2xl:col-span-1 2xl:ml-0 2xl:justify-self-end">{status}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between gap-4 px-6 pt-6">
              <h3 className="text-lg font-extrabold text-slate-950">Accesos recientes</h3>
              <Badge tone="blue">Sesión actual</Badge>
            </div>
            <div className="mt-2 divide-y divide-slate-100 px-6">
              {recentAccesses.map(({ city, device, ip, date, time, badge, icon: Icon, iconClassName }) => (
                <div key={city} className="flex gap-4 py-5">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", iconClassName)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-slate-950">{city}</p>
                      {badge ? <Badge tone="green">{badge}</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{device}</p>
                    <p className="mt-1 text-sm text-slate-500">IP: {ip}</p>
                    {date ? <p className="mt-3 text-sm font-semibold text-slate-500">{date}</p> : null}
                  </div>
                  <div className="shrink-0 text-right text-sm font-bold text-slate-500">
                    <Clock3 className="ml-auto mb-2 h-4 w-4 text-slate-400" />
                    {time}
                  </div>
                </div>
              ))}
            </div>
            <a href="#" className="flex items-center justify-between border-t border-slate-100 px-6 py-5 text-sm font-extrabold text-[#004AAD]">
              Ver todos los accesos
              <ArrowRight className="h-4 w-4" />
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
