import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  ChevronRight,
  Download,
  FileText,
  Inbox,
  MoreHorizontal,
  Settings2,
  ShieldCheck,
  UserRound,
  WalletCards
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getDemoAhorradorData } from "@/lib/fonfamper/ahorrador-data";
import { formatDateTime } from "@/lib/fonfamper/format";
import { cn } from "@/lib/utils";

const tabs = ["Todas", "No leídas", "Movimientos", "Seguridad", "Estados de cuenta"];

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

type NotificationStatCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "orange";
};

function NotificationStatCard({ title, value, helper, icon: Icon, tone }: NotificationStatCardProps) {
  return (
    <Card className="min-h-[168px]">
      <div className="flex min-w-0 items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 whitespace-nowrap text-[24px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", statTones[tone])}>
          <Icon className="h-6 w-6" />
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

export default async function SaverNotificationsPage() {
  const demoData = await getDemoAhorradorData();
  const notifications = demoData.notifications;
  const unreadCount = demoData.unreadNotificationsCount;
  const stats = [
    { title: "Total notificaciones", value: String(notifications.length), helper: "En tu bandeja", icon: Inbox, tone: "blue" as const },
    { title: "Sin leer", value: String(unreadCount), helper: "Requieren revisión", icon: Bell, tone: "green" as const },
    { title: "Importantes", value: String(notifications.filter((notification) => notification.type === "Seguridad").length), helper: "Prioridad alta", icon: AlertTriangle, tone: "orange" as const },
    { title: "Seguridad", value: String(notifications.filter((notification) => notification.type === "Seguridad").length), helper: "Eventos de acceso", icon: ShieldCheck, tone: "blue" as const }
  ];

  const summaryRows = [
    ["No leídas", String(unreadCount)],
    ["Movimientos", String(notifications.filter((notification) => notification.type === "Movimiento").length)],
    ["Seguridad", String(notifications.filter((notification) => notification.type === "Seguridad").length)],
    ["Estados de cuenta", String(notifications.filter((notification) => notification.type === "Estado de cuenta").length)]
  ] as const;

  const preferences = [
    ["Notificar nuevos aportes", true],
    ["Notificar estados de cuenta", true],
    ["Notificar accesos de seguridad", true],
    ["Resumen mensual por correo", false]
  ] as const;

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Notificaciones</h2>
        <p className="mt-2 text-base text-slate-500">Consulta las novedades y alertas de tu fondo de ahorro familiar.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <NotificationStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
            {notifications.map(({ title, message, type, isRead, createdAt }) => {
              const unread = !isRead;
              const iconMap: Record<string, LucideIcon> = {
                Movimiento: WalletCards,
                "Estado de cuenta": FileText,
                Seguridad: ShieldCheck,
                Perfil: UserRound
              };
              const toneMap: Record<string, "green" | "blue" | "gray"> = {
                Movimiento: "green",
                "Estado de cuenta": "blue",
                Seguridad: "blue",
                Perfil: "gray"
              };
              const Icon = iconMap[type] ?? ShieldCheck;
              const tone = toneMap[type] ?? "blue";

              return (
                <div key={`${title}-${createdAt}`} className={cn("relative flex flex-col gap-4 px-6 py-5 sm:flex-row", unread ? "bg-blue-50/60" : "bg-white")}>
                  {unread ? <span className="absolute left-0 top-5 h-12 w-1 rounded-r-full bg-[#0A5FD8]" /> : null}
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", notificationTones[tone])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-extrabold uppercase text-[#004AAD]">{type}</p>
                      <Badge tone={unread ? "blue" : "gray"}>{unread ? "No leída" : "Leída"}</Badge>
                    </div>
                    <p className="mt-2 text-base font-extrabold text-slate-950">{title}</p>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{message}</p>
                  </div>
                  <div className="flex shrink-0 flex-row items-center justify-between gap-4 text-right sm:flex-col sm:items-end sm:justify-between">
                    <p className="text-sm font-bold text-slate-500">{formatDateTime(createdAt)}</p>
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
