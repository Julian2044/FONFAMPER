import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCheck,
  ChevronRight,
  Download,
  FileText,
  Inbox,
  LockKeyhole,
  MoreHorizontal,
  Settings2,
  ShieldCheck,
  UserRound,
  WalletCards
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const stats: Array<{
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "orange";
}> = [
  { title: "Total notificaciones", value: "6", helper: "En tu bandeja", icon: Inbox, tone: "blue" },
  { title: "Sin leer", value: "2", helper: "Requieren revisión", icon: Bell, tone: "green" },
  { title: "Importantes", value: "1", helper: "Prioridad alta", icon: AlertTriangle, tone: "orange" },
  { title: "Seguridad", value: "2", helper: "Eventos de acceso", icon: ShieldCheck, tone: "blue" }
];

const tabs = ["Todas", "No leídas", "Movimientos", "Seguridad", "Estados de cuenta"];

const notifications: Array<{
  type: string;
  title: string;
  text: string;
  date: string;
  state: "No leída" | "Leída";
  icon: LucideIcon;
  tone: "green" | "blue" | "gray";
}> = [
  {
    type: "Movimiento",
    title: "Nuevo aporte registrado",
    text: "Se registró un aporte por $50.000 en tu cuenta. Tu nuevo saldo es $950.000.",
    date: "15 ene 2023",
    state: "No leída",
    icon: WalletCards,
    tone: "green"
  },
  {
    type: "Estado de cuenta",
    title: "Estado de cuenta disponible",
    text: "Tu estado de cuenta de enero 2023 ya está disponible para consulta y descarga.",
    date: "15 ene 2023",
    state: "No leída",
    icon: FileText,
    tone: "blue"
  },
  {
    type: "Seguridad",
    title: "Inicio de sesión exitoso",
    text: "Se detectó un inicio de sesión desde Chrome en Windows.",
    date: "Ahora",
    state: "Leída",
    icon: ShieldCheck,
    tone: "blue"
  },
  {
    type: "Perfil",
    title: "Datos personales protegidos",
    text: "Tu información personal está protegida y solo puede ser modificada con validación.",
    date: "Hace 2 días",
    state: "Leída",
    icon: UserRound,
    tone: "gray"
  },
  {
    type: "Utilidades",
    title: "Utilidades sin registrar",
    text: "Aún no tienes utilidades asignadas para el periodo actual.",
    date: "Ene 2023",
    state: "Leída",
    icon: BarChart3,
    tone: "blue"
  },
  {
    type: "Seguridad",
    title: "Verificación en dos pasos activada",
    text: "Tu cuenta cuenta con una capa adicional de protección.",
    date: "Hace 8 días",
    state: "Leída",
    icon: LockKeyhole,
    tone: "blue"
  }
];

const summaryRows = [
  ["No leídas", "2"],
  ["Movimientos", "1"],
  ["Seguridad", "2"],
  ["Estados de cuenta", "1"]
] as const;

const preferences = [
  ["Notificar nuevos aportes", true],
  ["Notificar estados de cuenta", true],
  ["Notificar accesos de seguridad", true],
  ["Resumen mensual por correo", false]
] as const;

const statTones = {
  blue: "bg-blue-50 text-[#004AAD]",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-600"
};

const notificationTones = {
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-[#004AAD]",
  gray: "bg-slate-100 text-slate-600"
};

function NotificationStatCard({ title, value, helper, icon: Icon, tone }: (typeof stats)[number]) {
  return (
    <Card className="min-h-36">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
        <div className={cn("rounded-2xl p-3", statTones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function SwitchVisual({ enabled }: { enabled: boolean }) {
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

export default function SaverNotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Notificaciones</h2>
        <p className="mt-2 text-base text-slate-500">Consulta las novedades y alertas de tu fondo de ahorro familiar.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <NotificationStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-0">
          <div className="flex flex-col gap-4 px-6 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-lg font-extrabold text-slate-950">Bandeja de notificaciones</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition",
                    index === 0 ? "bg-[#0A5FD8] text-white shadow-sm shadow-blue-950/10" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {notifications.map(({ type, title, text, date, state, icon: Icon, tone }) => {
              const unread = state === "No leída";

              return (
                <div key={title} className={cn("relative flex gap-4 px-6 py-5", unread ? "bg-blue-50/60" : "bg-white")}>
                  {unread ? <span className="absolute left-0 top-5 h-12 w-1 rounded-r-full bg-[#0A5FD8]" /> : null}
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", notificationTones[tone])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-extrabold uppercase text-[#004AAD]">{type}</p>
                      <Badge tone={unread ? "blue" : "gray"}>{state}</Badge>
                    </div>
                    <p className="mt-2 text-base font-extrabold text-slate-950">{title}</p>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{text}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between gap-4 text-right">
                    <p className="text-sm font-bold text-slate-500">{date}</p>
                    <button type="button" aria-label={`Opciones para ${title}`} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-0">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-extrabold text-slate-950">Resumen</h3>
            </div>
            <div className="mt-2 divide-y divide-slate-100 px-6">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-4">
                  <span className="text-sm font-semibold text-slate-500">{label}</span>
                  <span className="text-lg font-extrabold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-extrabold text-slate-950">Preferencias</h3>
            </div>
            <div className="mt-2 divide-y divide-slate-100 px-6">
              {preferences.map(([label, enabled]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-extrabold text-slate-950">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{enabled ? "Activado" : "Desactivado"}</p>
                  </div>
                  <SwitchVisual enabled={enabled} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-extrabold text-slate-950">Acciones rápidas</h3>
            <div className="mt-5 space-y-3">
              <Button variant="secondary" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como leídas
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Descargar historial
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Configurar alertas
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
