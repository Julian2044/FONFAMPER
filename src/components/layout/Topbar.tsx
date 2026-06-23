"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  WalletCards,
  type LucideIcon
} from "lucide-react";
import type { DemoUser } from "@/types/user";
import { AvatarPlaceholder } from "@/components/ui/AvatarPlaceholder";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type TopbarProps = {
  user: DemoUser;
  title: string;
  variant?: "saver" | "admin";
  tipoPortal?: "ahorrador" | "admin";
  perfilHref?: string;
  notificacionesHref?: string;
  cambiarUsuarioHref?: string;
  cerrarSesionHref?: string;
};

type DropdownItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  danger?: boolean;
};

type NotificationItem = {
  title: string;
  text: string;
  date: string;
  badge: string;
  icon: LucideIcon;
  tone: "green" | "blue";
  badgeTone: "blue" | "green" | "gray" | "orange";
};

const notificationIconTones = {
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-[#004AAD]"
};

const notificationBadgeTones = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-100"
};

const saverNotifications: NotificationItem[] = [
  {
    title: "Nuevo aporte registrado",
    text: "Se registró un aporte por $50.000 en tu cuenta.",
    date: "15 ene 2023",
    badge: "No leída",
    icon: WalletCards,
    tone: "green",
    badgeTone: "blue"
  },
  {
    title: "Estado de cuenta disponible",
    text: "Tu estado de cuenta de enero 2023 ya está disponible.",
    date: "15 ene 2023",
    badge: "No leída",
    icon: FileText,
    tone: "blue",
    badgeTone: "blue"
  },
  {
    title: "Inicio de sesión exitoso",
    text: "Se detectó un inicio de sesión desde Chrome en Windows.",
    date: "Ahora",
    badge: "Leída",
    icon: ShieldCheck,
    tone: "blue",
    badgeTone: "gray"
  }
];

const adminNotifications: NotificationItem[] = [
  {
    title: "Movimiento pendiente",
    text: "Hay 2 movimientos por revisar.",
    date: "Hoy",
    badge: "Pendiente",
    icon: ClipboardList,
    tone: "blue",
    badgeTone: "orange"
  },
  {
    title: "Importación validada",
    text: "El archivo aportes_mayo.xlsx fue validado correctamente.",
    date: "Hace 2 horas",
    badge: "Completado",
    icon: CheckCircle2,
    tone: "green",
    badgeTone: "green"
  },
  {
    title: "Evento de auditoría",
    text: "Sonia Perez editó el usuario Camilo Perez.",
    date: "Hace 15 minutos",
    badge: "Completado",
    icon: ShieldCheck,
    tone: "blue",
    badgeTone: "green"
  }
];

function getDropdownItems({
  variant,
  perfilHref,
  notificacionesHref,
  cambiarUsuarioHref,
  cerrarSesionHref
}: Required<Pick<TopbarProps, "variant" | "perfilHref" | "notificacionesHref" | "cambiarUsuarioHref" | "cerrarSesionHref">>) {
  if (variant === "admin") {
    return {
      primaryItems: [
        { label: "Panel administrativo", href: perfilHref, icon: LayoutDashboard },
        { label: "Auditoría", href: notificacionesHref, icon: ClipboardList },
        { label: "Cambiar a Camilo demo", href: cambiarUsuarioHref, icon: RefreshCw }
      ] satisfies DropdownItem[],
      dangerItem: { label: "Cerrar sesión", href: cerrarSesionHref, icon: LogOut, danger: true } satisfies DropdownItem
    };
  }

  return {
    primaryItems: [
      { label: "Mi perfil", href: perfilHref, icon: User },
      { label: "Notificaciones", href: notificacionesHref, icon: Bell, badge: "2" },
      { label: "Cambiar a Sonia demo", href: cambiarUsuarioHref, icon: RefreshCw }
    ] satisfies DropdownItem[],
    dangerItem: { label: "Cerrar sesión", href: cerrarSesionHref, icon: LogOut, danger: true } satisfies DropdownItem
  };
}

function DropdownLink({ item, onNavigate }: { item: DropdownItem; onNavigate: () => void }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-slate-50",
        item.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700"
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", item.danger ? "bg-red-50 text-red-600" : "bg-blue-50 text-[#004AAD]")}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{item.label}</span>
      </span>
      {item.badge ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-extrabold text-[#004AAD] ring-1 ring-blue-100">{item.badge}</span> : null}
    </Link>
  );
}

function NotificationDropdown({
  variant,
  footerHref,
  onNavigate
}: {
  variant: "saver" | "admin";
  footerHref: string;
  onNavigate: () => void;
}) {
  const isAdmin = variant === "admin";
  const notifications = isAdmin ? adminNotifications : saverNotifications;

  return (
    <div
      role="menu"
      className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
    >
      <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-4">
        <div>
          <p className="text-base font-extrabold text-slate-950">{isAdmin ? "Alertas administrativas" : "Notificaciones"}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{isAdmin ? "3 novedades recientes" : "2 sin leer"}</p>
        </div>
        {!isAdmin ? (
          <button type="button" className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#004AAD] ring-1 ring-blue-100">
            Marcar como leídas
          </button>
        ) : null}
      </div>

      <div className="mt-2 divide-y divide-slate-100">
        {notifications.map(({ title, text, date, badge, icon: Icon, tone, badgeTone }) => (
          <div key={title} className="flex gap-3 py-4">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", notificationIconTones[tone])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-extrabold text-slate-950">{title}</p>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ring-1", notificationBadgeTones[badgeTone])}>{badge}</span>
              </div>
              <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">{date}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href={footerHref}
        onClick={onNavigate}
        className="mt-2 flex w-full items-center justify-center rounded-xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-[#004AAD] transition hover:bg-blue-100"
      >
        {isAdmin ? "Ver auditoría" : "Ver todas las notificaciones"}
      </Link>
    </div>
  );
}

export function Topbar({
  user,
  title,
  variant = "saver",
  tipoPortal,
  perfilHref,
  notificacionesHref,
  cambiarUsuarioHref,
  cerrarSesionHref = "/login"
}: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const resolvedTipoPortal = tipoPortal ?? (variant === "admin" ? "admin" : "ahorrador");
  const resolvedPerfilHref = perfilHref ?? (variant === "admin" ? "/admin/dashboard" : "/ahorrador/perfil");
  const resolvedNotificacionesHref = notificacionesHref ?? (variant === "admin" ? "/admin/auditoria" : "/ahorrador/notificaciones");
  const resolvedCambiarUsuarioHref = cambiarUsuarioHref ?? (variant === "admin" ? "/ahorrador/inicio" : "/admin/dashboard");
  const { primaryItems, dangerItem } = getDropdownItems({
    variant,
    perfilHref: resolvedPerfilHref,
    notificacionesHref: resolvedNotificacionesHref,
    cambiarUsuarioHref: resolvedCambiarUsuarioHref,
    cerrarSesionHref
  });

  return (
    <header className="sticky top-0 z-20 h-auto border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:h-[88px] lg:px-8">
      <div className="flex h-full min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <Button variant="ghost" className="h-11 w-11 px-0 lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden w-full max-w-xl items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
            <Search className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">{variant === "admin" ? "Buscar en FONFAMPER..." : "Buscar en Fonfamper..."}</span>
          </div>
          <div className="min-w-0 md:hidden">
            <p className="truncate text-sm font-bold text-slate-950">{title}</p>
            <p className="text-xs text-slate-500">{user.fund}</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              aria-label="Notificaciones"
              aria-haspopup="menu"
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen((current) => !current);
                setUserMenuOpen(false);
              }}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-transparent px-0 text-slate-600 transition hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#0A5FD8] ring-2 ring-white" />
            </button>

            {notificationsOpen ? (
              <NotificationDropdown
                variant={variant}
                footerHref={resolvedNotificacionesHref}
                onNavigate={() => setNotificationsOpen(false)}
              />
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              onClick={() => {
                setUserMenuOpen((current) => !current);
                setNotificationsOpen(false);
              }}
              className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50 sm:flex"
            >
              <AvatarPlaceholder name={user.name} size="sm" />
              <div className="hidden text-left md:block">
                <p className="text-sm font-bold text-slate-950">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition", userMenuOpen ? "rotate-180" : "rotate-0")} />
            </button>

            <button
              type="button"
              aria-label={`Abrir menú de ${user.name}`}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              onClick={() => {
                setUserMenuOpen((current) => !current);
                setNotificationsOpen(false);
              }}
              className="sm:hidden"
            >
              <AvatarPlaceholder name={user.name} size="sm" />
            </button>

            {userMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+12px)] z-50 w-[280px] rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <AvatarPlaceholder name={user.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-950">{user.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{user.role}</p>
                    <p className="mt-1 text-xs text-slate-400">Cuenta demo</p>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  {primaryItems.map((item) => (
                    <DropdownLink key={item.label} item={item} onNavigate={() => setUserMenuOpen(false)} />
                  ))}
                </div>

                <div className="mt-2 border-t border-slate-100 pt-2">
                  <DropdownLink item={dangerItem} onNavigate={() => setUserMenuOpen(false)} />
                </div>

                <p className="px-3 pt-2 text-[11px] font-semibold uppercase text-slate-400">{resolvedTipoPortal === "admin" ? "Portal administrativo" : "Portal del ahorrador"}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
