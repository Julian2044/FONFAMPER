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
import { getDemoAhorradorData } from "@/lib/fonfamper/ahorrador-data";
import { formatCurrencyCOP, formatDate, formatDateTime } from "@/lib/fonfamper/format";
import { cn } from "@/lib/utils";

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
      aria-label="Avatar de Camilo Perez"
      className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 ring-8 ring-slate-50"
    >
      <UserRound className="h-16 w-16" />
    </div>
  );
}

export default async function SaverProfilePage() {
  const demoData = await getDemoAhorradorData();
  const profile = demoData.profile;
  const account = demoData.account;
  const latestMovement = demoData.latestMovement;
  const profileName = profile?.full_name ?? "Camilo Perez";
  const profileEmail = profile?.email ?? "camilo.perez@email.com";
  const profilePhone = profile?.phone ?? "No registrado";
  const profileDocument = profile?.document_id ?? "No registrado";
  const profileRole = profile?.role ?? "AHORRADOR";
  const profileStatus = profile?.status ?? "ACTIVO";
  const profileCreatedAt = profile?.created_at ? formatDate(profile.created_at) : "No registrado";
  const accountBalance = account?.current_balance ?? 0;
  const activeSessions = demoData.notifications.length > 0 ? 1 : 0;
  const lastSecurityCheck = latestMovement?.createdAt ? formatDateTime(latestMovement.createdAt) : "No registrado";
  const personalData = [
    { label: "Nombre completo", value: profileName, icon: UserRound },
    { label: "Correo electrónico", value: profileEmail, icon: Mail },
    { label: "Celular", value: profilePhone, icon: Phone },
    { label: "Documento de identidad", value: profileDocument, icon: KeyRound }
  ];

  const securitySummary = [
    {
      title: "Contraseña actualizada",
      description: `Tu perfil ${profileName} se cargó correctamente.`,
      icon: LockKeyhole,
      status: (
        <div className="text-right">
          <Badge tone="green">Actualizada</Badge>
          <p className="mt-2 text-xs font-semibold text-slate-500">{profileStatus}</p>
        </div>
      )
    },
    {
      title: "Verificación en dos pasos",
      description: `Rol actual: ${profileRole}`,
      icon: ShieldCheck,
      status: <Badge tone="green">Activada</Badge>
    },
    {
      title: "Sesiones activas",
      description: `Tienes ${activeSessions} sesión activa en este momento.`,
      icon: MonitorSmartphone,
      status: (
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#004AAD] ring-1 ring-blue-100">{activeSessions}</span>
          activa
        </div>
      )
    },
    {
      title: "Último chequeo de seguridad",
      description: `Último movimiento: ${latestMovement?.concept ?? "Sin movimientos"}`,
      icon: CheckCircle2,
      status: (
        <div className="text-right">
          <p className="text-sm font-extrabold text-slate-950">{lastSecurityCheck}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{demoData.error ? "Revisar lectura" : "Datos reales"}</p>
        </div>
      )
    }
  ];

  const recentAccesses = [
    {
      city: "Bogotá, Colombia",
      device: `${profileRole} en navegador actual`,
      ip: profileEmail,
      time: demoData.error ? "Sin datos" : "Ahora",
      badge: "Actual",
      icon: Chrome,
      iconClassName: "bg-white text-[#004AAD] ring-1 ring-slate-200"
    },
    {
      city: "Medellín, Colombia",
      device: "Sesión demo",
      ip: profileDocument,
      date: demoData.error ? "No registrado" : profileCreatedAt,
      time: demoData.error ? "Sin lectura" : "09:23 a. m.",
      icon: Smartphone,
      iconClassName: "bg-blue-50 text-[#004AAD]"
    }
  ];

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Mi perfil</h2>
        <p className="mt-2 text-base text-slate-500">Gestiona tu información y seguridad.</p>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="p-7">
            <p className="text-sm font-extrabold text-slate-950">Perfil</p>
            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
              <ProfileAvatar />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">{profileName}</h3>
                  <Badge tone="green">Activo</Badge>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                  <CalendarDays className="h-5 w-5 text-[#004AAD]" />
                  <span>Miembro desde {profileCreatedAt}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-500">Saldo actual {formatCurrencyCOP(accountBalance)}</p>
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
                  <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="whitespace-nowrap text-sm font-extrabold text-slate-950 sm:text-right">{value}</p>
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
                <div key={title} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <IconBox icon={icon} />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-950">{title}</p>
                      <p className="mt-1 break-words text-sm leading-6 text-slate-500">{description}</p>
                    </div>
                  </div>
                  <div className="min-w-0 sm:text-right">{status}</div>
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
                <div key={city} className="flex flex-col gap-4 py-5 sm:flex-row">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", iconClassName)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 break-words font-extrabold text-slate-950">{city}</p>
                      {badge ? <Badge tone="green">{badge}</Badge> : null}
                    </div>
                    <p className="mt-1 break-words text-sm text-slate-500">{device}</p>
                    <p className="mt-1 break-words text-sm text-slate-500">IP: {ip}</p>
                    {date ? <p className="mt-3 break-words text-sm font-semibold text-slate-500">{date}</p> : null}
                  </div>
                  <div className="shrink-0 text-left text-sm font-bold text-slate-500 sm:text-right">
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
